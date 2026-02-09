import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMyBalance } from '../../hooks/queries/useEarnings';
import { useMyCompletedTasks } from '../../hooks/queries/useTasks';
import { useMyReferrals, useMyReferralCode } from '../../hooks/queries/useReferrals';
import { useReferralBonus } from '../../hooks/queries/useEarnings';
import { DollarSign, TrendingUp, Users, Award } from 'lucide-react';

export function EarningsDashboard() {
  const { data: balance = BigInt(0) } = useMyBalance();
  const { data: completedTasks = [] } = useMyCompletedTasks();
  const { data: referrals = [] } = useMyReferrals();
  const { data: referralBonus = BigInt(0) } = useReferralBonus();

  const balanceInDollars = Number(balance) / 100;
  const taskEarnings = completedTasks.reduce((sum, task) => sum + Number(task.rewardCents), 0) / 100;
  const bonusPercentage = Number(referralBonus);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-white border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <DollarSign className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${balanceInDollars.toFixed(2)}</div>
          <p className="text-xs opacity-80">Available for withdrawal</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Task Earnings</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${taskEarnings.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">{completedTasks.length} tasks completed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Referrals</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{referrals.length}</div>
          <p className="text-xs text-muted-foreground">Friends referred</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-accent to-accent/80 text-white border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Referral Bonus</CardTitle>
          <Award className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{bonusPercentage}%</div>
          <p className="text-xs opacity-80">+10% per 100 referrals</p>
        </CardContent>
      </Card>
    </div>
  );
}
