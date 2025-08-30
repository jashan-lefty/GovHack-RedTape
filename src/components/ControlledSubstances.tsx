import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertTriangle, Pill, Wine, Cigarette, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const substanceSchema = z.object({
  alcohol: z.boolean().default(false),
  tobaccoProducts: z.boolean().default(false),
  pharmaceuticals: z.boolean().default(false),
  controlledDrugs: z.boolean().default(false),
  cannabisProducts: z.boolean().default(false),
  chemicals: z.boolean().default(false),
  precursorChemicals: z.boolean().default(false),
  therapeuticGoods: z.boolean().default(false),
});

type ControlledSubstancesData = z.infer<typeof substanceSchema>;

const substanceCategories = [
  {
    id: 'alcohol',
    label: 'Alcohol Sales/Service',
    description: 'Beer, wine, spirits, liquor licensing',
    icon: Wine,
    examples: 'Bars, restaurants, bottle shops, breweries',
    regulations: 'Liquor licensing, RSA certification'
  },
  {
    id: 'tobaccoProducts',
    label: 'Tobacco Products',
    description: 'Cigarettes, cigars, e-cigarettes, vaping products',
    icon: Cigarette,
    examples: 'Tobacco retailers, vape shops',
    regulations: 'Tobacco retailer licensing, plain packaging'
  },
  {
    id: 'pharmaceuticals',
    label: 'Pharmaceuticals',
    description: 'Prescription medicines, over-the-counter drugs',
    icon: Pill,
    examples: 'Pharmacies, medicine wholesalers',
    regulations: 'TGA registration, pharmacy licensing'
  },
  {
    id: 'controlledDrugs',
    label: 'Controlled/Restricted Drugs',
    description: 'Schedule 8 drugs, narcotics, psychotropics',
    icon: ShieldCheck,
    examples: 'Medical practitioners, veterinarians',
    regulations: 'DEA permits, secure storage requirements'
  },
  {
    id: 'cannabisProducts',
    label: 'Cannabis Products',
    description: 'Medical cannabis, CBD products',
    icon: Pill,
    examples: 'Medical cannabis suppliers, CBD retailers',
    regulations: 'Cannabis licensing, patient access schemes'
  },
  {
    id: 'chemicals',
    label: 'Industrial Chemicals',
    description: 'Manufacturing chemicals, solvents',
    icon: AlertTriangle,
    examples: 'Chemical manufacturers, importers',
    regulations: 'NICNAS registration, safety data sheets'
  },
  {
    id: 'precursorChemicals',
    label: 'Precursor Chemicals',
    description: 'Chemicals used in drug manufacturing',
    icon: AlertTriangle,
    examples: 'Chemical suppliers, laboratories',
    regulations: 'ACC permits, transaction reporting'
  },
  {
    id: 'therapeuticGoods',
    label: 'Therapeutic Goods',
    description: 'Medical devices, supplements, cosmetics',
    icon: ShieldCheck,
    examples: 'Medical device suppliers, supplement retailers',
    regulations: 'TGA listing/registration, GMP compliance'
  },
];

const ControlledSubstances = () => {
  const { toast } = useToast();

  const form = useForm<ControlledSubstancesData>({
    resolver: zodResolver(substanceSchema),
    defaultValues: {
      alcohol: false,
      tobaccoProducts: false,
      pharmaceuticals: false,
      controlledDrugs: false,
      cannabisProducts: false,
      chemicals: false,
      precursorChemicals: false,
      therapeuticGoods: false,
    },
  });

  const onSubmit = (data: ControlledSubstancesData) => {
    const selectedSubstances = Object.entries(data)
      .filter(([_, selected]) => selected)
      .map(([key, _]) => substanceCategories.find(cat => cat.id === key)?.label)
      .filter(Boolean);

    toast({
      title: "Controlled Substances Assessment",
      description: selectedSubstances.length > 0 
        ? `Selected ${selectedSubstances.length} substance categories for regulatory review.`
        : "No controlled substances selected.",
    });
    console.log('Controlled substances data:', data);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Controlled Substances Assessment
              </CardTitle>
              <CardDescription>
                Select any controlled substances your business handles. This determines additional licensing and regulatory requirements.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {substanceCategories.map((category) => {
              const Icon = category.icon;
              return (
                <FormField
                  key={category.id}
                  control={form.control}
                  name={category.id as keyof ControlledSubstancesData}
                  render={({ field }) => (
                    <FormItem>
                      <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors">
                        <CardContent className="p-4">
                          <FormControl>
                            <div className="flex items-start space-x-3">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="mt-1"
                              />
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-primary" />
                                  <FormLabel className="text-sm font-medium cursor-pointer">
                                    {category.label}
                                  </FormLabel>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {category.description}
                                </p>
                                <div className="text-xs">
                                  <div className="text-muted-foreground">
                                    <strong>Examples:</strong> {category.examples}
                                  </div>
                                  <div className="text-muted-foreground mt-1">
                                    <strong>Key regulations:</strong> {category.regulations}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </FormControl>
                        </CardContent>
                      </Card>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <Button
              type="submit"
              size="lg"
              className="px-12 py-3 text-lg font-semibold"
            >
              Analyze Substance Regulations
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ControlledSubstances;