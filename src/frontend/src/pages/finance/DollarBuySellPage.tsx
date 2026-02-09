import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export function DollarBuySellPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">Dollar Buy/Sell</h3>
        <p className="text-muted-foreground">Exchange currency at competitive rates</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Currency exchange functionality is coming soon. This feature will allow you to buy and sell US dollars.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Currency exchange feature is under development</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We're working on bringing you competitive currency exchange rates. Stay tuned!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
