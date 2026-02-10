import { useState } from 'react';
import { useMyDPSRequests, useRequestDPS } from '../../hooks/queries/useFinance';
import { useGetCallerUserProfile } from '../../hooks/queries/useCurrentUserProfile';
import { useBanStatus } from '../../hooks/queries/useBanStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VerificationRequiredDialog } from '../../components/kyc/VerificationRequiredDialog';
import { AlertCircle } from 'lucide-react';
import { t } from '../../i18n';
import { formatBDT } from '../../utils/currency';

export function DPSPage() {
  const { data: requests = [] } = useMyDPSRequests();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: banStatus } = useBanStatus();
  const requestDPS = useRequestDPS();

  const [amount, setAmount] = useState('');
  const [termMonths, setTermMonths] = useState('12');
  const [purpose, setPurpose] = useState('');
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);

  const isBanned = banStatus !== null;
  const nidVerified = userProfile?.verificationStatus.nidVerified ?? false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nidVerified) {
      setShowVerificationDialog(true);
      return;
    }

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
        <h3 className="text-2xl font-bold mb-2">{t('finance.dps')}</h3>
        <p className="text-muted-foreground">{t('finance.dpsDesc')}</p>
      </div>

      {isBanned && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('withdrawal.banned')}
          </AlertDescription>
        </Alert>
      )}

      {!nidVerified && !isBanned && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('finance.nidRequired')}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('finance.newDPS')}</CardTitle>
          <CardDescription>{t('finance.newDPSDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">{t('finance.monthlyDeposit')}</Label>
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
              <Label htmlFor="termMonths">{t('finance.termMonths')}</Label>
              <Input
                id="termMonths"
                type="number"
                value={termMonths}
                onChange={(e) => setTermMonths(e.target.value)}
                min="1"
                max="120"
                required
                disabled={isBanned}
              />
            </div>

            <div>
              <Label htmlFor="purpose">{t('finance.purpose')}</Label>
              <Textarea
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder={t('finance.purposePlaceholder')}
                required
                disabled={isBanned}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent text-white"
              disabled={requestDPS.isPending || isBanned}
            >
              {requestDPS.isPending ? t('finance.applying') : t('finance.applyForDPS')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('finance.dpsHistory')}</CardTitle>
          <CardDescription>{t('finance.dpsHistoryDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t('finance.noDPSRequests')}</p>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{formatBDT(req.amountCents)} {t('finance.perMonth')}</p>
                    <Badge
                      variant={
                        req.status === 'approved'
                          ? 'default'
                          : req.status === 'rejected'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {t(`status.${req.status}`)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{req.purpose}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('finance.termMonths')}: {Number(req.termMonths)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showVerificationDialog && (
        <VerificationRequiredDialog
          type="nid"
          onClose={() => setShowVerificationDialog(false)}
        />
      )}
    </div>
  );
}
