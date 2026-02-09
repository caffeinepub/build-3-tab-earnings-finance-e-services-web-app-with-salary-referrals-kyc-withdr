import { useMyEServiceRequests } from '../../hooks/queries/useEServices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EServiceType } from '../../backend';

const serviceLabels: Record<EServiceType, string> = {
  [EServiceType.landServices]: 'Land Services',
  [EServiceType.passport]: 'Passport',
  [EServiceType.nidCopy]: 'NID Online Copy',
  [EServiceType.visa]: 'Visa Services',
  [EServiceType.mobileRecharge]: 'Mobile Recharge',
};

export function EServiceHistoryPage() {
  const { data: requests = [], isLoading } = useMyEServiceRequests();

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">E-Service History</h3>
        <p className="text-muted-foreground">Your submitted service requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request History</CardTitle>
          <CardDescription>Track the status of your e-service requests</CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No service requests yet</p>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{serviceLabels[req.serviceType]}</p>
                    <Badge
                      variant={
                        req.status === 'approved'
                          ? 'default'
                          : req.status === 'rejected'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {req.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{req.requestDetails}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
