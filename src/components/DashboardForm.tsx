import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MapPin, Building, Users, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const dashboardSchema = z.object({
  postcode: z.string().min(4, 'Postcode must be 4 digits').max(4, 'Postcode must be 4 digits').regex(/^\d{4}$/, 'Postcode must be numbers only'),
  activityDescription: z.string().min(1, 'Activity description is required'),
  anzsicCode: z.string().optional(),
  businessStructure: z.enum(['sole-trader', 'partnership', 'company', 'non-profit']).optional(),
});

type DashboardFormData = z.infer<typeof dashboardSchema>;

const commonActivities = [
  'Café / Restaurant',
  'Construction',
  'Online Retail',
  'Clothing Store',
  'Pizza Shop',
  'Hair Salon',
  'Accounting Services',
  'Consulting',
  'Manufacturing',
  'Healthcare',
  'Other (specify)',
];

const industryGroups = [
  { category: 'Food & Beverage', codes: [
    { code: '4511', description: 'Cafes and Restaurants' },
    { code: '4520', description: 'Takeaway Food Services' },
    { code: '1107', description: 'Bakery Product Manufacturing' },
  ]},
  { category: 'Construction', codes: [
    { code: '3001', description: 'Residential Building Construction' },
    { code: '3002', description: 'Non-Residential Building Construction' },
    { code: '3101', description: 'Road and Bridge Construction' },
  ]},
  { category: 'Retail', codes: [
    { code: '4211', description: 'Department Stores' },
    { code: '4244', description: 'Clothing Retailing' },
    { code: '4279', description: 'Other Store-Based Retailing' },
  ]},
  { category: 'Healthcare', codes: [
    { code: '8401', description: 'Hospitals' },
    { code: '8511', description: 'General Practice Medical Services' },
    { code: '8512', description: 'Specialist Medical Services' },
  ]},
];

const DashboardForm = () => {
  const { toast } = useToast();
  const [customActivity, setCustomActivity] = useState(false);

  const form = useForm<DashboardFormData>({
    resolver: zodResolver(dashboardSchema),
    defaultValues: {
      postcode: '',
      activityDescription: '',
      anzsicCode: '',
    },
  });

  const onSubmit = (data: DashboardFormData) => {
    toast({
      title: "Business Details Submitted",
      description: "Your business information has been processed successfully.",
    });
    console.log('Dashboard form data:', data);
  };

  return (
    <div className="space-y-6">

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Location Card */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Location
                  </CardTitle>
                  <CardDescription>
                    Postcode determines state and local government requirements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="postcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postcode *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 2000"
                            maxLength={4}
                            {...field}
                            className="text-lg font-mono"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Business Activity Card */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    Business Activity
                  </CardTitle>
                  <CardDescription>
                    Primary business activity or industry type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="activityDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Activity Description *</FormLabel>
                        <FormControl>
                          {customActivity ? (
                            <div className="space-y-2">
                              <Input
                                placeholder="Enter your business activity"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setCustomActivity(false);
                                  field.onChange('');
                                }}
                              >
                                Choose from list instead
                              </Button>
                            </div>
                          ) : (
                            <Select onValueChange={(value) => {
                              if (value === 'other') {
                                setCustomActivity(true);
                                field.onChange('');
                              } else {
                                field.onChange(value);
                              }
                            }} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select business activity" />
                              </SelectTrigger>
                              <SelectContent>
                                {commonActivities.map((activity) => (
                                  <SelectItem
                                    key={activity}
                                    value={activity === 'Other (specify)' ? 'other' : activity}
                                  >
                                    {activity}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Industry Classification Card */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Industry Classification
                  </CardTitle>
                  <CardDescription>
                    Optional: ANZSIC code for precise regulatory mapping
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="anzsicCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ANZSIC Code (Optional)</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry code" />
                            </SelectTrigger>
                            <SelectContent>
                              {industryGroups.map((group) => (
                                <div key={group.category}>
                                  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                                    {group.category}
                                  </div>
                                  {group.codes.map((code) => (
                                    <SelectItem key={code.code} value={code.code}>
                                      {code.code} - {code.description}
                                    </SelectItem>
                                  ))}
                                </div>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Business Structure Card */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Business Structure
                  </CardTitle>
                  <CardDescription>
                    Optional: Legal structure affects regulatory obligations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="businessStructure"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Structure Type (Optional)</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid grid-cols-2 gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="sole-trader" id="sole-trader" />
                              <Label htmlFor="sole-trader" className="text-sm">
                                Sole Trader
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="partnership" id="partnership" />
                              <Label htmlFor="partnership" className="text-sm">
                                Partnership
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="company" id="company" />
                              <Label htmlFor="company" className="text-sm">
                                Company
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="non-profit" id="non-profit" />
                              <Label htmlFor="non-profit" className="text-sm">
                                Non-profit
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                size="lg"
                className="px-12 py-3 text-lg font-semibold"
              >
                Analyze Business Requirements
              </Button>
            </div>
          </form>
        </Form>
    </div>
  );
};

export default DashboardForm;