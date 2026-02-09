import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetTapToEarnState, useBatchedTapToEarn, useClaimTapToEarnCoins } from '../../hooks/queries/useTapToEarn';
import { useBanStatus } from '../../hooks/queries/useBanStatus';
import { loadMonetagScript, showMonetagAd } from '../../utils/ads/monetag';
import { Coins, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function TapToEarnPage() {
  const { data: tapState, isLoading } = useGetTapToEarnState();
  const { data: banStatus } = useBanStatus();
  const { tap, getEffectiveState, flush } = useBatchedTapToEarn();
  const claimCoins = useClaimTapToEarnCoins();

  const [isAdShowing, setIsAdShowing] = useState(false);
  
  // Track which tap counts have already triggered ads to prevent double triggers
  const triggeredAdsRef = useRef<Set<number>>(new Set());
  const lastCheckedTapCountRef = useRef(0);

  const isBanned = banStatus !== null;

  useEffect(() => {
    loadMonetagScript();
  }, []);

  // Get effective state (optimistic + server)
  const effectiveState = getEffectiveState();
  const effectiveTapCount = effectiveState ? Number(effectiveState.tapCount) : 0;
  const effectiveCoinBalance = effectiveState ? Number(effectiveState.coinBalance) : 0;

  useEffect(() => {
    if (!effectiveState || isBanned || isAdShowing) return;

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
      
      setIsAdShowing(true);
      showMonetagAd()
        .then(() => {
          toast.success('Big ad completed!');
        })
        .catch((err) => {
          console.error('Ad error:', err);
          toast.error('Ad failed to load');
        })
        .finally(() => {
          setIsAdShowing(false);
        });
      return;
    }

    // Check small ad threshold (45)
    const smallAdThreshold = checkThreshold(45);
    if (smallAdThreshold) {
      triggeredAdsRef.current.add(smallAdThreshold);
      lastCheckedTapCountRef.current = currentTapCount;
      
      setIsAdShowing(true);
      showMonetagAd()
        .then(() => {
          toast.success('Small ad completed!');
        })
        .catch((err) => {
          console.error('Ad error:', err);
          toast.error('Ad failed to load');
        })
        .finally(() => {
          setIsAdShowing(false);
        });
      return;
    }

    // Update last checked count
    lastCheckedTapCountRef.current = currentTapCount;
  }, [effectiveTapCount, isBanned, isAdShowing, effectiveState]);

  const handleTap = () => {
    if (isAdShowing || isBanned) return;
    tap();
  };

  const handleClaim = async () => {
    if (claimCoins.isPending || isBanned) return;
    
    // Flush any pending taps before claiming
    await flush();
    
    const claimed = await claimCoins.mutateAsync(null);
    toast.success(`Claimed ${Number(claimed)} coins to your account!`);
    
    // Clear triggered ads tracking when claiming
    triggeredAdsRef.current.clear();
    lastCheckedTapCountRef.current = 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Tap to Earn
        </h3>
        <p className="text-muted-foreground">Tap the coin to earn rewards!</p>
      </div>

      {isBanned && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your account is banned. You cannot tap to earn.
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground mb-2">Coin Balance</p>
              <p className="text-5xl font-bold text-primary">{effectiveCoinBalance}</p>
            </div>

            <button
              onClick={handleTap}
              disabled={isBanned || isAdShowing}
              className="relative group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative h-48 w-48 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-2xl transform transition-transform group-hover:scale-105 group-active:scale-95">
                <Coins className="h-24 w-24" />
              </div>
            </button>

            <div className="text-center">
              <p className="text-2xl font-bold mb-1">
                {isAdShowing ? 'Ad Playing...' : 'Tap the Coin!'}
              </p>
              <p className="text-sm text-muted-foreground">
                Each tap = +1 coin
              </p>
            </div>

            {effectiveCoinBalance > 0 && (
              <Button
                onClick={handleClaim}
                disabled={claimCoins.isPending || isBanned}
                className="bg-gradient-to-r from-primary to-accent text-white px-8 py-6 text-lg"
              >
                {claimCoins.isPending ? 'Claiming...' : `Claim ${effectiveCoinBalance} Coins to Account`}
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
              <p className="font-medium">Tap to Earn</p>
              <p className="text-sm text-muted-foreground">Each tap gives you +1 coin instantly</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
