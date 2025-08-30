/**
 * selenium.js
 * Backend Selenium scraper for Red Tape Navigator.
 *
 * What it does
 *  - Accepts frontend JSON input (postcode, activityDescription, anzsicCode, businessStructure, controlledSubstances)
 *  - Uses ABS postcode to state mapping (coarse) to pick jurisdiction context
 *  - Scrapes ABLIS Activity Search for obligations using postcode and activity
 *  - Optionally runs extra targeted queries for alcohol, medicines, and hazardous chemicals
 *  - Returns normalized JSON grouped by level (local, state, federal) with source links
 *
 * Run
 *   npm i express cors body-parser selenium-webdriver chromedriver dotenv
 *   CHROME_HEADLESS=true PORT=8787 node selenium.js
 *
 * Endpoint
 *   POST /scrape
 *   {
 *     "postcode":"3066",
 *     "activityDescription":"Café / Restaurant",
 *     "anzsicCode":"4511",
 *     "businessStructure":"company",
 *     "controlledSubstances":{
 *        "usesControlled":true,
 *        "alcohol":{"serveOnPremise":true},
 *        "medicines":{"dispense":false,"wholesale":false,"storeOnly":false,"schedules":["S2","S8"]},
 *        "chemicals":{"manufacture":false,"importOrExport":false,"transport":false,"store":true}
 *     }
 *   }
 */

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

// ----------------------------- config -----------------------------

const PORT = process.env.PORT || 8787;
const CHROME_HEADLESS = String(process.env.CHROME_HEADLESS || "true").toLowerCase() === "true";

// Target sources
const SOURCES = {
  ABLIS_ACTIVITY: "https://ablis.business.gov.au/search/activity",
  ABLIS_HOME: "https://ablis.business.gov.au/",
  ABS_ASGS_LGA: "https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs-edition-3/jul2021-jun2026/non-abs-structures/local-government-areas#lga-name-criteria",

};

// ----------------------- postcode to state map ---------------------
// Coarse mapping for demo. Replace with ABS ASGS join in production.
function mapStateFromPostcode(pc) {
  const n = parseInt(String(pc), 10);
  if (isNaN(n)) return null;
  if ((n >= 200 && n <= 299) || (n >= 2600 && n <= 2618) || (n >= 2900 && n <= 2999)) return "ACT";
  if (n >= 800 && n <= 899) return "NT";
  if ((n >= 1000 && n <= 2599) || (n >= 2619 && n <= 2898)) return "NSW";
  if (n >= 3000 && n <= 3999) return "VIC";
  if (n >= 4000 && n <= 4999) return "QLD";
  if (n >= 5000 && n <= 5799) return "SA";
  if (n >= 6000 && n <= 6799) return "WA";
  if (n >= 7000 && n <= 7799) return "TAS";
  return null;
}

// ---------------------------- driver ------------------------------

async function withDriver(fn) {
  const options = new chrome.Options();
  if (CHROME_HEADLESS) options.addArguments("--headless=new");
  options.addArguments("--no-sandbox");
  options.addArguments("--disable-dev-shm-usage");
  options.addArguments("--window-size=1280,1024");

  const driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();
  try {
    return await fn(driver);
  } finally {
    await driver.quit();
  }
}

// ------------------------ ABLIS scraping --------------------------

async function searchAblis(driver, activity, postcode) {
  await driver.get(SOURCES.ABLIS_ACTIVITY);
  // Attempt several selectors in case the site markup changes
  const selectors = {
    keyword: ["input#keyword", "input[name='keyword']", "input[type='search']"],
    location: ["input#location", "input[name='location']", "input[placeholder*='postcode']"],
    submit: ["button[type='submit']", "button#search", "button[class*='search']"]
  };

  async function findFirst(cssList) {
    for (const sel of cssList) {
      const els = await driver.findElements(By.css(sel));
      if (els.length > 0) return els[0];
    }
    return null;
  }

  const keywordInput = await findFirst(selectors.keyword);
  const locationInput = await findFirst(selectors.location);
  const submitBtn = await findFirst(selectors.submit);

  if (!keywordInput || !locationInput || !submitBtn) {
    throw new Error("Could not find ABLIS search controls. Update selectors.");
  }

  await keywordInput.clear();
  await keywordInput.sendKeys(activity);
  await locationInput.clear();
  await locationInput.sendKeys(String(postcode));
  await submitBtn.click();

  // Wait for a result container or a results count
  await driver.wait(async () => {
    const possible = await driver.findElements(By.css(".search-result, .result, .result-card, .results, .content"));
    return possible.length > 0;
  }, 10000).catch(() => {});

  const html = await driver.getPageSource();
  return parseAblisResults(html, activity, postcode);
}

function parseAblisResults(html, activity, postcode) {
  // Very lightweight HTML parsing using regex and fallback heuristics.
  // For robustness you can add cheerio, but here we keep zero extra deps.
  const items = [];

  // Split on cards by common wrappers
  const chunks = html.split(/<article|<li class="search-result|<div class="result-card|<div class="result"/i);
  for (const raw of chunks) {
    const title = textBetween(raw, /<h3[^>]*>([\s\S]*?)<\/h3>|<h2[^>]*>([\s\S]*?)<\/h2>|<a[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
    const agency = textBetween(raw, /class="(?:agency|provider|organisation|regulator|agency-name)"[^>]*>([\s\S]*?)<\/[^>]+>/i);
    const level = textBetween(raw, /class="(?:jurisdiction|level|gov-level)"[^>]*>([\s\S]*?)<\/[^>]+>/i);
    const link = linkHref(raw);

    if (!title && !agency && !link) continue;

    const cleanTitle = clean(title);
    const cleanAgency = clean(agency);
    let cleanLevel = clean(level);

    // Infer level if missing
    if (!cleanLevel) {
      if (cleanAgency) {
        const low = cleanAgency.toLowerCase();
        if (low.includes("council") || low.includes("shire") || low.includes("city of")) cleanLevel = "local";
      }
    }
    if (!cleanLevel && cleanTitle) {
      const low = cleanTitle.toLowerCase();
      if (low.includes("state")) cleanLevel = "state";
      else if (low.includes("commonwealth") || low.includes("federal")) cleanLevel = "federal";
    }

    items.push({
      level: cleanLevel || null,
      regulator: cleanAgency || null,
      obligation: cleanTitle || null,
      source_url: link || SOURCES.ABLIS_HOME,
      activity,
      postcode
    });
  }

  return dedupeBy(items, (r) => `${r.obligation}|${r.regulator}|${r.source_url}`);
}

function textBetween(s, re) {
  const m = re.exec(s);
  if (!m) return null;
  const groups = m.slice(1).filter(Boolean);
  return groups.length > 0 ? groups[0] : null;
}
function linkHref(s) {
  const m = /<a[^>]+href="([^"]+)"/i.exec(s);
  if (!m) return null;
  let href = m[1];
  if (href && href.startsWith("/")) href = `https://ablis.business.gov.au${href}`;
  return href;
}
function clean(s) {
  if (!s) return null;
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function dedupeBy(arr, keyFn) {
  const seen = new Set();
  const out = [];
  for (const it of arr) {
    const k = keyFn(it);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(it);
  }
  return out;
}

// ------------------- specialized supplemental queries -------------------
// These use ABLIS again with narrowed keywords to surface specific regimes.
// You can add state regulator pages later if needed.

async function supplementalQueries(driver, postcode, flags) {
  const wants = [];

  if (flags?.alcohol && (flags.alcohol.serveOnPremise || flags.alcohol.takeaway || flags.alcohol.brewOrDistil)) {
    wants.push("liquor licence");
    wants.push("responsible service of alcohol");
  }
  if (flags?.medicines) {
    if (flags.medicines.dispense || flags.medicines.wholesale || flags.medicines.storeOnly) {
      wants.push("scheduled medicines");
      wants.push("pharmacy");
      if (Array.isArray(flags.medicines.schedules) && flags.medicines.schedules.length) {
        wants.push("poisons permit");
      }
    }
  }
  if (flags?.chemicals && (flags.chemicals.manufacture || flags.chemicals.importOrExport || flags.chemicals.transport || flags.chemicals.store)) {
    wants.push("hazardous chemicals");
    wants.push("dangerous goods");
  }

  const extra = [];
  for (const q of dedupeBy(wants, (x) => x)) {
    const results = await searchAblis(driver, q, postcode).catch(() => []);
    for (const r of results) {
      extra.push({ ...r, activity: q });
    }
  }
  return dedupeBy(extra, (r) => `${r.obligation}|${r.regulator}|${r.source_url}`);
}

// ------------------------ grouping and summary --------------------------

function groupByLevel(items) {
  const levels = { local: [], state: [], federal: [], unknown: [] };
  for (const it of items) {
    const lvl = (it.level || "").toLowerCase();
    if (lvl.includes("local")) levels.local.push(it);
    else if (lvl.includes("state")) levels.state.push(it);
    else if (lvl.includes("federal") || lvl.includes("commonwealth")) levels.federal.push(it);
    else levels.unknown.push(it);
  }
  return levels;
}

// Try to infer LGA from regulator strings like "City of Yarra" or "Yarra City Council"
function tryInferLGA(items) {
  for (const it of items) {
    const reg = (it.regulator || "").toLowerCase();
    if (reg.includes("council") || reg.includes("city of") || reg.includes("shire")) {
      return it.regulator;
    }
  }
  return null;
}

// ----------------------------- main handler -----------------------------

async function scrapeAll(input) {
  const {
    postcode,
    activityDescription,
    anzsicCode,
    businessStructure,
    controlledSubstances
  } = input || {};

  if (!postcode || !activityDescription) {
    throw new Error("postcode and activityDescription are required");
  }

  const state = mapStateFromPostcode(postcode);
  const allItems = [];

  return await withDriver(async (driver) => {
    // Base ABLIS query by activity
    const base = await searchAblis(driver, activityDescription, postcode).catch(() => []);
    allItems.push(...base);

    // If ANZSIC is provided, try an extra query with an industry keyword
    if (anzsicCode) {
      const codeQuery = `${activityDescription} ${anzsicCode}`;
      const extra = await searchAblis(driver, codeQuery, postcode).catch(() => []);
      allItems.push(...extra);
    }

    // Supplemental queries for controlled categories
    if (controlledSubstances?.usesControlled) {
      const extra = await supplementalQueries(driver, postcode, {
        alcohol: controlledSubstances.alcohol,
        medicines: {
          ...controlledSubstances.medicines,
          schedules: controlledSubstances.schedules || []
        },
        chemicals: controlledSubstances.chemicals
      });
      allItems.push(...extra);
    }

    const deduped = dedupeBy(allItems, (r) => `${r.obligation}|${r.regulator}|${r.source_url}`);
    const groups = groupByLevel(deduped);
    const inferredLGA = tryInferLGA(deduped);

    // Eligibility note: include references to the Commonwealth and ABS pages used
    const datasets_used = {
      commonwealth: [
        "ABLIS Activity Search",
        "ABS ASGS LGA name criteria"
      ],
      links: [SOURCES.ABLIS_ACTIVITY, SOURCES.ABS_ASGS_LGA, ...SOURCES.GOVHACK_LINKS]
    };

    // Minimal prompt framing for your downstream AI, if you want to use it
    const prompt = {
      objective: "Explain obligations grouped by jurisdiction. Flag overlaps and possible conflicts. Provide links.",
      context: {
        location: { postcode, state, inferredLGA },
        activity: activityDescription,
        anzsicCode,
        businessStructure,
        controlledSubstances
      },
      data_shape: {
        local: "Array of {regulator, obligation, source_url}",
        state: "Array of {regulator, obligation, source_url}",
        federal: "Array of {regulator, obligation, source_url}"
      }
    };

    return {
      ok: true,
      input: { postcode, state, activityDescription, anzsicCode, businessStructure, controlledSubstances },
      jurisdiction: { state, inferredLGA },
      datasets_used,
      results: {
        local: groups.local,
        state: groups.state,
        federal: groups.federal,
        unknown: groups.unknown
      },
      prompt_for_ai: prompt,
      confidence: state ? "Location resolved by postcode to state. LGA inferred from regulator text if present." : "State could not be confidently resolved from postcode."
    };
  });
}

// ------------------------------- server --------------------------------

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "1mb" }));

app.get("/health", (req, res) => res.json({ ok: true }));

app.post("/scrape", async (req, res) => {
  try {
    const out = await scrapeAll(req.body);
    res.json(out);
  } catch (e) {
    res.status(400).json({ ok: false, error: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`selenium scraper listening on ${PORT}`);
});

module.exports = { scrapeAll };
