import DashboardForm from '@/components/DashboardForm';
import ControlledSubstances from '@/components/ControlledSubstances';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Business Compliance Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Complete business registration and regulatory requirements
          </p>
        </div>

        <Tabs defaultValue="business" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="business">Business Details</TabsTrigger>
            <TabsTrigger value="substances">Controlled Substances</TabsTrigger>
          </TabsList>
          
          <TabsContent value="business" className="mt-6">
            <DashboardForm />
          </TabsContent>
          
          <TabsContent value="substances" className="mt-6">
            <ControlledSubstances />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;