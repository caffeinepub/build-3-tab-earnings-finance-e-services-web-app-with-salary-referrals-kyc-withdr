import { useState } from 'react';
import { useMyBalance } from '../../hooks/queries/useEarnings';
import { useMyWithdrawalRequests, useRequestWithdrawal } from '../../hooks/queries/useWithdrawals';
import { useBanStatus } from '../../hooks/queries/useBanStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import type { WithdrawMethod } from '../../backend';
import { AlertCircle, Wallet } from 'lucide-react';

export function WithdrawPage() {
  const { data: balance = BigInt(0) } = useMyBalance();
  const { data: requests = [] } = useMyWithdrawalRequests();
  const { data: banStatus } = useBanStatus();
  const requestWithdrawal = useRequestWithdrawal();

  const [amount, setAmount] = useState('');
  const [methodType, setMethodType] = useState<'bank' | 'mobile' | 'global'>('mobile');
  const [provider, setProvider] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [branch, setBranch] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');

  const isBanned = banStatus !== null;
  const balanceInDollars = Number(balance) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountCents = BigInt(Math.floor(parseFloat(amount) * 100));
    if (amountCents > balance) {
      return;
    }

    let method: WithdrawMethod;
    if (methodType === 'bank') {
      method = {
        __kind__: 'bank',
        bank: {
          bankName,
          branch,
          accountHolderName,
          accountNumber,
          routingNumber,
        },
      };
    } else if (methodType === 'mobile') {
      method = {
        __kind__: 'mobile',
        mobile: {
          provider,
          accountNumber,
        },
      };
    } else {
      method = {
        __kind__: 'global',
        global: {
          provider,
          accountNumber,
        },
      };
    }

    await requestWithdrawal.mutateAsync({ amountCents, method });
    setAmount('');
    setProvider('');
    setAccountNumber('');
    setBankName('');
    setBranch('');
    setAccountHolderName('');
    setRoutingNumber('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">Withdraw Funds</h3>
        <p className="text-muted-foreground">Request withdrawal to your bank or mobile wallet</p>
      </div>

      <Card className="bg-gradient-to-br from-primary to-primary/80 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Available Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">${balanceInDollars.toFixed(2)}</div>
        </CardContent>
      </Card>

      {isBanned && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your account is banned. You cannot request withdrawals.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>New Withdrawal Request</CardTitle>
          <CardDescription>Fill in the details to request a withdrawal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (USD)</Label>
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
              <p className="text-xs text-muted-foreground mt-1">
                Maximum: ${balanceInDollars.toFixed(2)}
              </p>
            </div>

            <div>
              <Label htmlFor="methodType">Withdrawal Method</Label>
              <Select value={methodType} onValueChange={(v: any) => setMethodType(v)} disabled={isBanned}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mobile">Mobile Wallet (bKash/Nagad)</SelectItem>
                  <SelectItem value="bank">Bank Account</SelectItem>
                  <SelectItem value="global">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {methodType === 'mobile' && (
              <>
                <div>
                  <Label htmlFor="provider">Provider</Label>
                  <Select value={provider} onValueChange={setProvider} disabled={isBanned}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bKash">bKash</SelectItem>
                      <SelectItem value="Nagad">Nagad</SelectItem>
                      <SelectItem value="Rocket">Rocket</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    required
                    disabled={isBanned}
                  />
                </div>
              </>
            )}

            {methodType === 'bank' && (
              <>
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                    disabled={isBanned}
                  />
                </div>
                <div>
                  <Label htmlFor="branch">Branch</Label>
                  <Input
                    id="branch"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    required
                    disabled={isBanned}
                  />
                </div>
                <div>
                  <Label htmlFor="accountHolderName">Account Holder Name</Label>
                  <Input
                    id="accountHolderName"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    required
                    disabled={isBanned}
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    required
                    disabled={isBanned}
                  />
                </div>
                <div>
                  <Label htmlFor="routingNumber">Routing Number</Label>
                  <Input
                    id="routingNumber"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                    required
                    disabled={isBanned}
                  />
                </div>
              </>
            )}

            {methodType === 'global' && (
              <>
                <div>
                  <Label htmlFor="provider">Provider</Label>
                  <Input
                    id="provider"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    placeholder="e.g., PayPal, Wise"
                    required
                    disabled={isBanned}
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Email or account ID"
                    required
                    disabled={isBanned}
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent text-white"
              disabled={requestWithdrawal.isPending || isBanned}
            >
              {requestWithdrawal.isPending ? 'Submitting...' : 'Submit Withdrawal Request'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
          <CardDescription>Your past withdrawal requests</CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No withdrawal requests yet</p>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">${(Number(req.amountCents) / 100).toFixed(2)}</p>
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
                  <p className="text-xs text-muted-foreground">
                    {req.method.__kind__ === 'bank' && `Bank: ${req.method.bank.bankName}`}
                    {req.method.__kind__ === 'mobile' && `Mobile: ${req.method.mobile.provider}`}
                    {req.method.__kind__ === 'global' && `Global: ${req.method.global.provider}`}
                  </p>
                  {req.comment && (
                    <p className="text-xs text-muted-foreground">Comment: {req.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
