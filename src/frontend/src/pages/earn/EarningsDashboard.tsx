import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMyBalance } from '../../hooks/queries/useEarnings';
import { useMyCompletedTasks } from '../../hooks/queries/useTasks';
import { useMyReferrals } from '../../hooks/queries/useReferrals';
import { useReferralBonus } from '../../hooks/queries/useEarnings';
import { DollarSign, TrendingUp, Users, Award } from 'lucide-react';
import { t } from '../../i18n';
import { formatBDT } from '../../utils/currency';

export function EarningsDashboard() {
  const { data: balance = BigInt(0) } = useMyBalance();
  const { data: completedTasks = [] } = useMyCompletedTasks();
  const { data: referrals = [] } = useMyReferrals();
  const { data: referralBonus = BigInt(0) } = useReferralBonus();

  const balanceInBDT = formatBDT(balance);
  const taskEarnings = formatBDT(completedTasks.reduce((sum, task) => sum + Number(task.rewardCents), 0));
  const bonusPercentage = Number(referralBonus);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-white border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('earnings.totalBalance')}</CardTitle>
          <DollarSign className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{balanceInBDT}</div>
          <p className="text-xs opacity-80">{t('earnings.availableForWithdrawal')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('earnings.taskEarnings')}</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{taskEarnings}</div>
          <p className="text-xs text-muted-foreground">{completedTasks.length} {t('earnings.tasksCompleted')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('earnings.referrals')}</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{referrals.length}</div>
          <p className="text-xs text-muted-foreground">{t('earnings.friendsReferred')}</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-accent to-accent/80 text-white border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('earnings.referralBonus')}</CardTitle>
          <Award className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{bonusPercentage}%</div>
          <p className="text-xs opacity-80">{t('earnings.bonusPerHundred')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
