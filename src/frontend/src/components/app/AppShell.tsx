import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { LoginButton } from '../auth/LoginButton';
import { PrimaryTabs } from './PrimaryTabs';
import { BanNoticeBanner } from '../policy/BanNoticeBanner';
import { useBanStatus } from '../../hooks/queries/useBanStatus';
import { Button } from '@/components/ui/button';
import { User, Heart } from 'lucide-react';
import { ProfilePage } from '../../pages/profile/ProfilePage';
import { t } from '../../i18n';

export function AppShell() {
  const { identity } = useInternetIdentity();
  const { data: banStatus } = useBanStatus();
  const [showProfile, setShowProfile] = useState(false);

  const isAuthenticated = !!identity;
  const isBanned = banStatus !== null;

  // Generate app identifier for UTM tracking
  const appIdentifier = encodeURIComponent(window.location.hostname || 'unknown-app');

  if (showProfile) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Button variant="ghost" onClick={() => setShowProfile(false)}>
              {t('app.backToApp')}
            </Button>
            <LoginButton />
          </div>
        </header>
        <ProfilePage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-md">
              A
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t('app.title')}
              </h1>
              <p className="text-xs text-muted-foreground">{t('app.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <Button variant="ghost" size="icon" onClick={() => setShowProfile(true)}>
                <User className="h-5 w-5" />
              </Button>
            )}
            <LoginButton />
          </div>
        </div>
      </header>

      {isBanned && <BanNoticeBanner />}

      <main className="container mx-auto px-4 py-6">
        {isAuthenticated ? (
          <PrimaryTabs />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="mb-6 h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-4xl shadow-lg">
              A
            </div>
            <h2 className="text-3xl font-bold mb-4">{t('app.welcome')}</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              {t('app.welcomeDesc')}
            </p>
            <LoginButton />
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-12 py-6 bg-card/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()}. {t('app.footer')} <Heart className="inline h-4 w-4 text-red-500" /> {t('app.footerWith')}{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
