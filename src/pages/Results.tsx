import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, MapPin, Clock, DollarSign, FileText } from 'lucide-react';

interface Requirement {
  id: string;
  name: string;
  description: string;
  cost: string;
  timeframe: string;
  status: 'completed' | 'pending' | 'not-started';
  documents: string[];
}

interface RegulationData {
  local: Requirement[];
  state: Requirement[];
  federal: Requirement[];
}

const Results = () => {
  const [activeStep, setActiveStep] = useState(0);

  const mockData: RegulationData = {
    local: [
      {
        id: 'l1',
        name: 'Food Business Registration',
        description: 'Register your food business with City of Melbourne',
        cost: '$186',
        timeframe: '2-3 weeks',
        status: 'pending',
        documents: ['Food Safety Program', 'Floor Plan', 'Menu']
      },
      {
        id: 'l2',
        name: 'Outdoor Dining Permit',
        description: 'Permit for outdoor seating in Melbourne CBD',
        cost: '$750',
        timeframe: '4-6 weeks',
        status: 'not-started',
        documents: ['Site Plan', 'Public Liability Insurance']
      },
      {
        id: 'l3',
        name: 'Planning Permit',
        description: 'Use of premises for food and drink premises',
        cost: '$1,500',
        timeframe: '8-12 weeks',
        status: 'not-started',
        documents: ['Planning Application', 'Traffic Impact Assessment']
      }
    ],
    state: [
      {
        id: 's1',
        name: 'Liquor Licence (General)',
        description: 'Victorian liquor licence for on-premises consumption',
        cost: '$1,848',
        timeframe: '6-8 weeks',
        status: 'pending',
        documents: ['Liquor Licence Application', 'Community Impact Statement', 'Public Notice']
      },
      {
        id: 's2',
        name: 'Food Act Registration',
        description: 'State-level food business registration with DHHS',
        cost: '$0',
        timeframe: '1-2 weeks',
        status: 'not-started',
        documents: ['Food Safety Program', 'HACCP Plan']
      },
      {
        id: 's3',
        name: 'WorkSafe Registration',
        description: 'Workplace safety registration for employees',
        cost: '$189',
        timeframe: '1 week',
        status: 'not-started',
        documents: ['OHS Risk Assessment', 'Safety Management System']
      }
    ],
    federal: [
      {
        id: 'f1',
        name: 'ABN Registration',
        description: 'Australian Business Number for tax purposes',
        cost: '$0',
        timeframe: '1-2 days',
        status: 'completed',
        documents: ['Business Structure Documentation']
      },
      {
        id: 'f2',
        name: 'GST Registration',
        description: 'Goods and Services Tax registration with ATO',
        cost: '$0',
        timeframe: '1 week',
        status: 'completed',
        documents: ['ABN', 'Business Activity Statement']
      },
      {
        id: 'f3',
        name: 'PAYG Withholding',
        description: 'Pay As You Go withholding for employees',
        cost: '$0',
        timeframe: '1 week',
        status: 'not-started',
        documents: ['Employee Details', 'Tax File Numbers']
      }
    ]
  };

  const roadmapSteps = [
    { level: 'Federal', items: mockData.federal.length, completed: mockData.federal.filter(r => r.status === 'completed').length },
    { level: 'State', items: mockData.state.length, completed: mockData.state.filter(r => r.status === 'completed').length },
    { level: 'Local', items: mockData.local.length, completed: mockData.local.filter(r => r.status === 'completed').length }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Circle className="w-5 h-5 text-yellow-500 fill-current" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-muted';
    }
  };

  const RequirementCard = ({ requirement }: { requirement: Requirement }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(requirement.status)}
            <div>
              <CardTitle className="text-lg">{requirement.name}</CardTitle>
              <CardDescription className="mt-1">{requirement.description}</CardDescription>
            </div>
          </div>
          <Badge variant={requirement.status === 'completed' ? 'default' : 'secondary'}>
            {requirement.status.replace('-', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{requirement.cost}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{requirement.timeframe}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{requirement.documents.length} documents</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Required Documents:</p>
          <div className="flex flex-wrap gap-2">
            {requirement.documents.map((doc) => (
              <Badge key={doc} variant="outline" className="text-xs">
                {doc}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Compliance Requirements
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>Pizza Shop with Alcohol Service • Melbourne CBD, VIC</span>
          </div>
        </div>

        {/* Roadmap Section */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Roadmap</CardTitle>
            <CardDescription>
              Complete requirements in order: Federal → State → Local
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {roadmapSteps.map((step, index) => {
                const progress = (step.completed / step.items) * 100;
                return (
                  <div key={step.level} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                          progress === 100 ? 'bg-green-500' : progress > 0 ? 'bg-yellow-500' : 'bg-muted'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold">{step.level} Requirements</h3>
                          <p className="text-sm text-muted-foreground">
                            {step.completed} of {step.items} completed
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{Math.round(progress)}%</Badge>
                    </div>
                    <Progress value={progress} className="h-2" />
                    {index < roadmapSteps.length - 1 && (
                      <div className="absolute left-4 top-12 w-0.5 h-6 bg-border"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Requirements Tabs */}
        <Tabs defaultValue="local" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="local">Local Requirements</TabsTrigger>
            <TabsTrigger value="state">State Requirements</TabsTrigger>
            <TabsTrigger value="federal">Federal Requirements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="local" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">City of Melbourne Requirements</h2>
                <Badge variant="secondary">{mockData.local.length} requirements</Badge>
              </div>
              {mockData.local.map((requirement) => (
                <RequirementCard key={requirement.id} requirement={requirement} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="state" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Victoria State Requirements</h2>
                <Badge variant="secondary">{mockData.state.length} requirements</Badge>
              </div>
              {mockData.state.map((requirement) => (
                <RequirementCard key={requirement.id} requirement={requirement} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="federal" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Australian Federal Requirements</h2>
                <Badge variant="secondary">{mockData.federal.length} requirements</Badge>
              </div>
              {mockData.federal.map((requirement) => (
                <RequirementCard key={requirement.id} requirement={requirement} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Results;