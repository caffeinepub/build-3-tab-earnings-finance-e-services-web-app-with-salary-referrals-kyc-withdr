import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EarningsDashboard } from './EarningsDashboard';
import { TaskCatalog } from './TaskCatalog';
import { WithdrawPage } from './WithdrawPage';
import { TapToEarnPage } from './TapToEarnPage';
import { ReferralCard } from '../../components/referrals/ReferralCard';
import { ListChecks, Wallet, Users, ArrowLeft, Coins } from 'lucide-react';

type View = 'landing' | 'tasks' | 'withdraw' | 'tap';

export function EarnLanding() {
  const [currentView, setCurrentView] = useState<View>('landing');

  if (currentView === 'tasks') {
    return (
      <div>
        <Button variant="ghost" onClick={() => setCurrentView('landing')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Earn Money
        </Button>
        <TaskCatalog />
      </div>
    );
  }

  if (currentView === 'withdraw') {
    return (
      <div>
        <Button variant="ghost" onClick={() => setCurrentView('landing')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Earn Money
        </Button>
        <WithdrawPage />
      </div>
    );
  }

  if (currentView === 'tap') {
    return (
      <div>
        <Button variant="ghost" onClick={() => setCurrentView('landing')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Earn Money
        </Button>
        <TapToEarnPage />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Earn Money
        </h2>
        <p className="text-muted-foreground">
          Complete tasks, refer friends, and grow your monthly salary
        </p>
      </div>

      <EarningsDashboard />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-primary/30 bg-gradient-to-br from-primary/5 to-transparent" onClick={() => setCurrentView('tap')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent shadow-md">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>Tap to Earn</CardTitle>
                <CardDescription>Play and earn coins</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Tap the coin button to earn rewards. Watch ads for bonus coins!
            </p>
            <Button className="w-full bg-gradient-to-r from-primary to-accent text-white">
              Start Tapping
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-primary/20" onClick={() => setCurrentView('tasks')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-md">
                <ListChecks className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>Task Catalog</CardTitle>
                <CardDescription>Browse and complete tasks</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Earn rewards by completing tap-tap tasks, watching videos, following social media, and AI editing.
            </p>
            <Button className="w-full bg-gradient-to-r from-primary to-primary/80 text-white">
              View Tasks
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-accent/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-accent to-accent/80 shadow-md">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>Referrals</CardTitle>
                <CardDescription>Invite friends and earn bonuses</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ReferralCard />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-accent/30" onClick={() => setCurrentView('withdraw')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent shadow-md">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>Withdrawals</CardTitle>
                <CardDescription>Cash out your earnings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Request withdrawals to your bank account or mobile wallet (bKash, Nagad).
            </p>
            <Button className="w-full bg-gradient-to-r from-primary to-accent text-white">
              Withdraw Funds
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
