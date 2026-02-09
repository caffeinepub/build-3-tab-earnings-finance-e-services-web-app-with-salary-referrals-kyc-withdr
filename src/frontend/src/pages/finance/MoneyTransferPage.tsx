import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export function MoneyTransferPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">Money Transfer</h3>
        <p className="text-muted-foreground">Send money securely to other users or accounts</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Money transfer functionality is coming soon. This feature will allow you to send funds to other users and external accounts.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Money transfer feature is under development</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We're working on bringing you a secure and convenient money transfer service. Stay tuned!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
