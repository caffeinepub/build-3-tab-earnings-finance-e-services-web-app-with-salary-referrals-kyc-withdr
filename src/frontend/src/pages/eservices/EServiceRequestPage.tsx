import { useState } from 'react';
import { useRequestEService } from '../../hooks/queries/useEServices';
import { useGetCallerUserProfile } from '../../hooks/queries/useCurrentUserProfile';
import { useBanStatus } from '../../hooks/queries/useBanStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VerificationRequiredDialog } from '../../components/kyc/VerificationRequiredDialog';
import type { EServiceType } from '../../backend';
import { AlertCircle } from 'lucide-react';

interface EServiceRequestPageProps {
  serviceType: EServiceType;
}

const serviceLabels: Record<EServiceType, string> = {
  landServices: 'Land Services',
  passport: 'Passport',
  nidCopy: 'NID Online Copy',
  visa: 'Visa Services',
  mobileRecharge: 'Mobile Recharge',
};

export function EServiceRequestPage({ serviceType }: EServiceRequestPageProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: banStatus } = useBanStatus();
  const requestService = useRequestEService();

  const [requestDetails, setRequestDetails] = useState('');
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);

  const isBanned = banStatus !== null;
  const emailVerified = userProfile?.verificationStatus.emailVerified ?? false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailVerified) {
      setShowVerificationDialog(true);
      return;
    }

    await requestService.mutateAsync({ serviceType, requestDetails });
    setRequestDetails('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">{serviceLabels[serviceType]}</h3>
        <p className="text-muted-foreground">Submit your service request</p>
      </div>

      {isBanned && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your account is banned. You cannot request e-services.
          </AlertDescription>
        </Alert>
      )}

      {!emailVerified && !isBanned && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Email verification is required to request e-services. Please complete your profile.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Service Request Form</CardTitle>
          <CardDescription>Provide details about your request</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="details">Request Details</Label>
              <Textarea
                id="details"
                value={requestDetails}
                onChange={(e) => setRequestDetails(e.target.value)}
                placeholder="Describe your service request in detail..."
                rows={6}
                required
                disabled={isBanned}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Provide all necessary information for processing your request
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-accent to-accent/80 text-white"
              disabled={requestService.isPending || isBanned}
            >
              {requestService.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {showVerificationDialog && (
        <VerificationRequiredDialog
          type="email"
          onClose={() => setShowVerificationDialog(false)}
        />
      )}
    </div>
  );
}
