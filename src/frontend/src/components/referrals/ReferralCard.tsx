import { useState } from 'react';
import { useMyReferralCode, useMyReferrals } from '../../hooks/queries/useReferrals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Copy, Users } from 'lucide-react';
import { t } from '../../i18n';

export function ReferralCard() {
  const { data: referralCode = '' } = useMyReferralCode();
  const { data: referrals = [] } = useMyReferrals();

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success(t('profile.codeCopied'));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">{t('profile.yourReferralCode')}</label>
        <div className="flex gap-2">
          <Input value={referralCode} readOnly className="font-mono" />
          <Button onClick={handleCopy} variant="outline" size="icon">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {t('profile.shareCode')}
        </p>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">
          {referrals.length} {t('profile.referralCount')}
        </span>
      </div>
    </div>
  );
}
