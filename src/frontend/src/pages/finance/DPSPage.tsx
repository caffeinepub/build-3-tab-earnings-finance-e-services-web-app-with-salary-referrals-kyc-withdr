import { useState } from 'react';
import { useMyDPSRequests, useRequestDPS } from '../../hooks/queries/useFinance';
import { useBanStatus } from '../../hooks/queries/useBanStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function DPSPage() {
  const { data: requests = [] } = useMyDPSRequests();
  const { data: banStatus } = useBanStatus();
  const requestDPS = useRequestDPS();

  const [amount, setAmount] = useState('');
  const [termMonths, setTermMonths] = useState('12');
  const [purpose, setPurpose] = useState('');

  const isBanned = banStatus !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountCents = BigInt(Math.floor(parseFloat(amount) * 100));
    const months = BigInt(parseInt(termMonths));

    await requestDPS.mutateAsync({ amountCents, termMonths: months, purpose });
    setAmount('');
    setTermMonths('12');
    setPurpose('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">DPS (Deposit Pension Scheme)</h3>
        <p className="text-muted-foreground">Start a savings plan with regular deposits</p>
      </div>

      {isBanned && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your account is banned. You cannot create DPS plans.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>New DPS Plan</CardTitle>
          <CardDescription>Set up a new deposit pension scheme</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Monthly Deposit Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                disabled={isBanned}
              />
            </div>

            <div>
              <Label htmlFor="termMonths">Term (Months)</Label>
              <Input
                id="termMonths"
                type="number"
                value={termMonths}
                onChange={(e) => setTermMonths(e.target.value)}
                min="6"
                max="120"
                required
                disabled={isBanned}
              />
            </div>

            <div>
              <Label htmlFor="purpose">Purpose/Goal</Label>
              <Textarea
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="What are you saving for?"
                required
                disabled={isBanned}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[oklch(0.65_0.22_264)] to-[oklch(0.75_0.20_85)]"
              disabled={requestDPS.isPending || isBanned}
            >
              {requestDPS.isPending ? 'Creating...' : 'Create DPS Plan'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>DPS History</CardTitle>
          <CardDescription>Your deposit pension schemes</CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No DPS plans yet</p>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">${(Number(req.amountCents) / 100).toFixed(2)}/month</p>
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
                  <p className="text-sm text-muted-foreground">{req.purpose}</p>
                  <p className="text-xs text-muted-foreground">
                    {Number(req.termMonths)} months term
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
