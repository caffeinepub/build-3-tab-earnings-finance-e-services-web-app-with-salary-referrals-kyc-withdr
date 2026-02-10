import { useState } from 'react';
import { useBanUser, useUnbanUser } from '../../hooks/queries/useBanStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Principal } from '@icp-sdk/core/principal';
import { Shield, Ban, CheckCircle } from 'lucide-react';
import { t } from '../../i18n';

export function AdminBanPanel() {
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();

  const [principalId, setPrincipalId] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleBan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const principal = Principal.fromText(principalId);
      await banUser.mutateAsync({
        user: principal,
        reason,
        banType: { __kind__: 'permanent', permanent: null },
      });
      setPrincipalId('');
      setReason('');
    } catch (err: any) {
      setError(err.message || t('admin.banError'));
    }
  };

  const handleUnban = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const principal = Principal.fromText(principalId);
      await unbanUser.mutateAsync(principal);
      setPrincipalId('');
    } catch (err: any) {
      setError(err.message || t('admin.unbanError'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2 text-primary">
          <Shield className="h-8 w-8" />
          {t('admin.banPanel')}
        </h2>
        <p className="text-muted-foreground">{t('admin.manageBans')}</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-primary" />
            {t('admin.banUser')}
          </CardTitle>
          <CardDescription>{t('admin.banUserDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBan} className="space-y-4">
            <div>
              <Label htmlFor="ban-principal">{t('admin.userPrincipalId')}</Label>
              <Input
                id="ban-principal"
                value={principalId}
                onChange={(e) => setPrincipalId(e.target.value)}
                placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"
                required
              />
            </div>

            <div>
              <Label htmlFor="reason">{t('admin.banReason')}</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('admin.banReasonPlaceholder')}
                required
              />
            </div>

            <Button
              type="submit"
              variant="destructive"
              className="w-full"
              disabled={banUser.isPending}
            >
              {banUser.isPending ? t('admin.banning') : t('admin.banUser')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            {t('admin.unbanUser')}
          </CardTitle>
          <CardDescription>{t('admin.unbanUserDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUnban} className="space-y-4">
            <div>
              <Label htmlFor="unban-principal">{t('admin.userPrincipalId')}</Label>
              <Input
                id="unban-principal"
                value={principalId}
                onChange={(e) => setPrincipalId(e.target.value)}
                placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent text-white"
              disabled={unbanUser.isPending}
            >
              {unbanUser.isPending ? t('admin.unbanning') : t('admin.unbanUser')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
