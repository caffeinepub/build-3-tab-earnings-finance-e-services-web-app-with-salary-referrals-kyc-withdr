import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetTapToEarnState, useBatchedTapToEarn, useClaimTapToEarnCoins } from '../../hooks/queries/useTapToEarn';
import { useBanStatus } from '../../hooks/queries/useBanStatus';
import { useTapToEarnAdScheduler } from '../../hooks/useTapToEarnAdScheduler';
import { TapToEarnAdInterstitial } from '../../components/ads/TapToEarnAdInterstitial';
import { getAdCreativeByThreshold } from '../../utils/ads/inventory';
import { Coins, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { t } from '../../i18n';
import { formatBDT } from '../../utils/currency';

export function TapToEarnPage() {
  const { data: tapState, isLoading } = useGetTapToEarnState();
  const { data: banStatus } = useBanStatus();
  const { tap, getEffectiveState, flush } = useBatchedTapToEarn();
  const claimCoins = useClaimTapToEarnCoins();

  // Track which tap counts have already triggered ads to prevent double triggers
  const triggeredAdsRef = useRef<Set<number>>(new Set());
  const lastCheckedTapCountRef = useRef(0);

  const isBanned = banStatus !== null;

  // Ad scheduler
  const adScheduler = useTapToEarnAdScheduler({
    onAdComplete: () => {
      toast.success(t('tapToEarn.adCompleted'));
    },
    getAdCreative: () => {
      const effectiveState = getEffectiveState();
      const tapCount = effectiveState ? Number(effectiveState.tapCount) : 0;
      return getAdCreativeByThreshold(tapCount);
    },
  });

  // Get effective state (optimistic + server)
  const effectiveState = getEffectiveState();
  const effectiveTapCount = effectiveState ? Number(effectiveState.tapCount) : 0;
  const effectiveCoinBalance = effectiveState ? Number(effectiveState.coinBalance) : 0;

  useEffect(() => {
    if (!effectiveState || isBanned || adScheduler.isShowing) return;

    const currentTapCount = effectiveTapCount;
    const lastChecked = lastCheckedTapCountRef.current;

    // Check if we crossed any ad thresholds since last check
    const checkThreshold = (threshold: number) => {
      const lastMultiple = Math.floor(lastChecked / threshold) * threshold;
      const currentMultiple = Math.floor(currentTapCount / threshold) * threshold;
      
      // If we crossed a threshold and haven't triggered this exact count
      if (currentMultiple > lastMultiple && 
          currentMultiple > 0 && 
          !triggeredAdsRef.current.has(currentMultiple)) {
        return currentMultiple;
      }
      return null;
    };

    // Check big ad threshold first (280)
    const bigAdThreshold = checkThreshold(280);
    if (bigAdThreshold) {
      triggeredAdsRef.current.add(bigAdThreshold);
      lastCheckedTapCountRef.current = currentTapCount;
      adScheduler.scheduleAd();
      return;
    }

    // Check small ad threshold (45)
    const smallAdThreshold = checkThreshold(45);
    if (smallAdThreshold) {
      triggeredAdsRef.current.add(smallAdThreshold);
      lastCheckedTapCountRef.current = currentTapCount;
      adScheduler.scheduleAd();
      return;
    }

    // Update last checked count
    lastCheckedTapCountRef.current = currentTapCount;
  }, [effectiveTapCount, isBanned, adScheduler, effectiveState]);

  const handleTap = () => {
    if (adScheduler.isShowing || isBanned) return;
    tap();
  };

  const handleClaim = async () => {
    if (claimCoins.isPending || isBanned) return;
    
    // Flush any pending taps before claiming
    await flush();
    
    const claimedCents = await claimCoins.mutateAsync(null);
    const claimedAmount = formatBDT(claimedCents);
    toast.success(t('tapToEarn.claimSuccess', { amount: claimedAmount }));
    
    // Clear triggered ads tracking when claiming
    triggeredAdsRef.current.clear();
    lastCheckedTapCountRef.current = 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {t('tapToEarn.title')}
        </h3>
        <p className="text-muted-foreground">{t('tapToEarn.description')}</p>
      </div>

      {isBanned && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('tapToEarn.banned')}
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground mb-2">{t('tapToEarn.coinBalance')}</p>
              <p className="text-5xl font-bold text-primary">{effectiveCoinBalance}</p>
            </div>

            <button
              onClick={handleTap}
              disabled={isBanned || adScheduler.isShowing}
              className="relative group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative h-48 w-48 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-2xl transform transition-transform group-hover:scale-105 group-active:scale-95">
                <Coins className="h-24 w-24" />
              </div>
            </button>

            <div className="text-center">
              <p className="text-2xl font-bold mb-1">
                {adScheduler.isShowing ? t('tapToEarn.adPlaying') : t('tapToEarn.tapTheCoin')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('tapToEarn.eachTap')}
              </p>
            </div>

            {effectiveCoinBalance > 0 && (
              <Button
                onClick={handleClaim}
                disabled={claimCoins.isPending || isBanned}
                className="bg-gradient-to-r from-primary to-accent text-white px-8 py-6 text-lg"
              >
                {claimCoins.isPending ? t('tapToEarn.claiming') : `${t('tapToEarn.claimCoins')} (${effectiveCoinBalance})`}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Coins className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{t('tapToEarn.conversionRule')}</p>
              <p className="text-sm text-muted-foreground">{t('tapToEarn.conversionInfo')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Coins className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{t('tapToEarn.title')}</p>
              <p className="text-sm text-muted-foreground">{t('tapToEarn.tapToEarnInfo')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ad Interstitial */}
      {adScheduler.selectedCreative && (
        <TapToEarnAdInterstitial
          isOpen={adScheduler.isShowing}
          creative={adScheduler.selectedCreative}
          onClose={adScheduler.closeAd}
        />
      )}
    </div>
  );
}
