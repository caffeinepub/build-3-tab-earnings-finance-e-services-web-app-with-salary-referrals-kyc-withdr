import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useActor } from './hooks/useActor';
import { useGetCallerUserProfile } from './hooks/queries/useCurrentUserProfile';
import { useBanStatus } from './hooks/queries/useBanStatus';
import { AppShell } from './components/app/AppShell';
import { ProfileOnboardingModal } from './components/profile/ProfileOnboardingModal';
import { PolicyAcceptanceGate } from './components/policy/PolicyAcceptanceGate';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: banStatus } = useBanStatus();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;
  const isBanned = banStatus !== null;

  if (isInitializing || actorFetching) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <div className="min-h-screen bg-background text-foreground">
        <PolicyAcceptanceGate>
          <AppShell />
          {showProfileSetup && <ProfileOnboardingModal />}
        </PolicyAcceptanceGate>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
