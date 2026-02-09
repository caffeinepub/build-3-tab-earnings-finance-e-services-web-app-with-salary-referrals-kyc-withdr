import { useState } from 'react';
import { useMyReferralCode, useMyReferrals } from '../../hooks/queries/useReferrals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Copy, Users } from 'lucide-react';

export function ReferralCard() {
  const { data: referralCode = '' } = useMyReferralCode();
  const { data: referrals = [] } = useMyReferrals();

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success('Referral code copied to clipboard!');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Your Referral Code</label>
        <div className="flex gap-2">
          <Input value={referralCode} readOnly className="font-mono" />
          <Button onClick={handleCopy} variant="outline" size="icon">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Share this code with friends to earn referral bonuses
        </p>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">
          {referrals.length} {referrals.length === 1 ? 'referral' : 'referrals'}
        </span>
      </div>
    </div>
  );
}
