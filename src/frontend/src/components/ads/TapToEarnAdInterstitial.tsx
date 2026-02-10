import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, AlertCircle } from 'lucide-react';
import type { AdCreative } from '../../hooks/useTapToEarnAdScheduler';
import { adConfig } from '../../config/ads';
import { t } from '../../i18n';

interface TapToEarnAdInterstitialProps {
  isOpen: boolean;
  creative: AdCreative;
  onClose: () => void;
}

export function TapToEarnAdInterstitial({ isOpen, creative, onClose }: TapToEarnAdInterstitialProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [externalAdError, setExternalAdError] = useState(false);
  const [externalAdLoaded, setExternalAdLoaded] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setImageError(false);
      setImageLoaded(false);
      setExternalAdError(false);
      setExternalAdLoaded(false);
    }
  }, [isOpen]);

  // Load external ad script if configured
  useEffect(() => {
    if (!isOpen || !adConfig.enabled || !adConfig.scriptUrl) return;

    const script = document.createElement('script');
    script.src = adConfig.scriptUrl;
    script.async = true;
    script.onload = () => setExternalAdLoaded(true);
    script.onerror = () => setExternalAdError(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [isOpen]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const handleClose = () => {
    setImageError(false);
    setImageLoaded(false);
    setExternalAdError(false);
    setExternalAdLoaded(false);
    onClose();
  };

  // Determine what to show
  const showExternalAd = adConfig.enabled && (adConfig.directUrl || externalAdLoaded);
  const showFallback = !adConfig.enabled || (adConfig.useFallback && (externalAdError || !showExternalAd));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">
                {showFallback ? creative.title : t('ads.title')}
              </DialogTitle>
              <DialogDescription className="mt-2">
                {showFallback ? creative.description : t('ads.description')}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="relative bg-muted/30 min-h-[300px] flex items-center justify-center">
          {/* External ad via direct URL */}
          {showExternalAd && adConfig.directUrl && (
            <iframe
              src={adConfig.directUrl}
              className="w-full h-[400px] border-0"
              title={t('ads.title')}
              onError={() => setExternalAdError(true)}
            />
          )}

          {/* External ad via script (placeholder for ad container) */}
          {showExternalAd && !adConfig.directUrl && externalAdLoaded && (
            <div id="external-ad-container" className="w-full min-h-[300px] flex items-center justify-center">
              {/* Ad network will inject content here */}
              <p className="text-muted-foreground">{t('ads.loading')}</p>
            </div>
          )}

          {/* Fallback to local creative */}
          {showFallback && (
            <>
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              )}

              {imageError ? (
                <div className="p-6 w-full">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {t('ads.error')}
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <img
                  src={creative.imagePath}
                  alt={creative.title}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  className={`max-w-full max-h-[400px] object-contain transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              )}
            </>
          )}

          {/* External ad error fallback */}
          {externalAdError && !showFallback && (
            <div className="p-6 w-full">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {t('ads.error')}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        <div className="p-6 pt-4 bg-background border-t">
          <Button
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-primary to-accent text-white"
            size="lg"
          >
            {t('ads.continueTapping')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
