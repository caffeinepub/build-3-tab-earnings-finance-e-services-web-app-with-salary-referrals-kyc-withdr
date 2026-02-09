import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EServiceRequestPage } from './EServiceRequestPage';
import { EServiceHistoryPage } from './EServiceHistoryPage';
import { EServiceType } from '../../backend';
import { MapPin, FileText, CreditCard, Plane, Smartphone, ArrowLeft, History } from 'lucide-react';

type View = 'landing' | 'request' | 'history';

const serviceInfo = {
  [EServiceType.landServices]: {
    title: 'Land Services',
    description: 'Namjari, Khajna, E-Porcha',
    icon: MapPin,
  },
  [EServiceType.passport]: {
    title: 'Passport',
    description: 'Passport application & renewal',
    icon: FileText,
  },
  [EServiceType.nidCopy]: {
    title: 'NID Online Copy',
    description: 'Get your NID copy online',
    icon: CreditCard,
  },
  [EServiceType.visa]: {
    title: 'Visa Services',
    description: 'Visa application assistance',
    icon: Plane,
  },
  [EServiceType.mobileRecharge]: {
    title: 'Mobile Recharge',
    description: 'Recharge your mobile',
    icon: Smartphone,
  },
};

export function EServiceLanding() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [selectedService, setSelectedService] = useState<EServiceType | null>(null);

  if (currentView === 'request' && selectedService) {
    return (
      <div>
        <Button variant="ghost" onClick={() => setCurrentView('landing')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Services
        </Button>
        <EServiceRequestPage serviceType={selectedService} />
      </div>
    );
  }

  if (currentView === 'history') {
    return (
      <div>
        <Button variant="ghost" onClick={() => setCurrentView('landing')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Services
        </Button>
        <EServiceHistoryPage />
      </div>
    );
  }

  const handleServiceClick = (service: EServiceType) => {
    setSelectedService(service);
    setCurrentView('request');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
            Digital E-Service
          </h2>
          <p className="text-muted-foreground">
            Access government and citizen services online
          </p>
        </div>
        <Button variant="outline" onClick={() => setCurrentView('history')}>
          <History className="mr-2 h-4 w-4" />
          View History
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(serviceInfo).map(([key, info]) => {
          const Icon = info.icon;
          return (
            <Card
              key={key}
              className="hover:shadow-lg transition-shadow cursor-pointer border-accent/20"
              onClick={() => handleServiceClick(key as EServiceType)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-accent to-accent/80 shadow-md">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{info.title}</CardTitle>
                    <CardDescription className="text-xs">{info.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-accent to-accent/80 text-white">
                  Request Service
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
