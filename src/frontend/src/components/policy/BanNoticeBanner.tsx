import { useBanStatus } from '../../hooks/queries/useBanStatus';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function BanNoticeBanner() {
  const { data: banStatus } = useBanStatus();

  if (!banStatus) return null;

  return (
    <div className="container mx-auto px-4 py-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Account Banned</AlertTitle>
        <AlertDescription>
          Your account has been banned. Reason: {banStatus.reason}. All earnings have been forfeited per our policy. You cannot perform earning activities or withdrawals.
        </AlertDescription>
      </Alert>
    </div>
  );
}
