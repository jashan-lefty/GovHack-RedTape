# Red Tape Navigator

<img width="1896" height="961" alt="Screenshot 2025-08-30 191816" src="https://github.com/user-attachments/assets/a7b770dc-3de8-4b02-a01f-7ff89b19583a" />


**Simplifying compliance across Commonwealth, State, and Local laws in Australia.**

Red Tape Navigator helps businesses and individuals quickly discover which regulations, licences, and obligations apply to them based on location and activity. Powered by AI and government data, the tool cuts through complexity, so Australians can navigate compliance with clarity and confidence.

<img width="1905" height="962" alt="Screenshot 2025-08-30 191656" src="https://github.com/user-attachments/assets/668bf5ce-c734-47c3-b508-925164fb0151" />

---

##  Why Red Tape Navigator?

-  **Regulatory confusion is costly**, navigating overlapping rules across local councils, states, and federal laws is time-consuming and error-prone.
-  **A unified, user-friendly solution**, just enter your postcode and activity, and instantly get structured, jurisdiction-aware compliance guidance.
-  **Grounded in authoritative data**, we integrate multiple public datasets and provide clear sources for every recommendation.

---

##  Live Demo & Features

Visit the [GovHack submission portal link or hosted site] to try the live demo.

- Minimal, intuitive frontend UI built with **React**, **Vite**, and **shadcn-ui**.
- Dynamic forms to input your **postcode**, **business activity**, **ANZSIC code**, **business structure**, and controlled substances involvement.
- Retrieves obligations using:
  - **ABLIS**: licence requirements across all government levels.
  - **ABS ASGS**: maps postcodes to state and local government area.
  - **Controlled Substances flags**: adds extra queries for alcohol, medicines, and hazardous chemicals.
- Built-in **Selenium scraper** (in `scraper/selenium.js`) that pulls structured results from ABLIS when APIs are unavailable.
- Backend uses **OpenAI** to compose human-friendly responses with clear jurisdiction grouping, overlap detection, and source citations.

---

##  Data Sources Integrated

| Dataset                               | Use in Project                                                  |
|--------------------------------------|-----------------------------------------------------------------|
| **ABLIS Activity Search**            | Core licence and regulator lookup via Selenium.                |
| **ABS ASGS – Local Government Areas**| Map postcode → State + LGA.                                     |
| **Federal Legislation Register**     | Provide authoritative federal law references.                  |
| **State/Territory Legislation Portals** | Added for credibility; referenced in docs.                 |
| **ALRC Commonwealth Statute Book**   | Shows legislative complexity and context; cited in write-up.   |
| **Safe Work Australia & TGA (Optional)** | Cover workplace safety and medicine/poison regulation.      |

---



