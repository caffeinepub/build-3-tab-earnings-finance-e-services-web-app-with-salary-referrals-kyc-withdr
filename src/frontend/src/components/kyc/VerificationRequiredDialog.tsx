import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface VerificationRequiredDialogProps {
  type: 'email' | 'nid';
  onClose: () => void;
}

export function VerificationRequiredDialog({ type, onClose }: VerificationRequiredDialogProps) {
  const isNID = type === 'nid';

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Verification Required
          </DialogTitle>
          <DialogDescription>
            {isNID
              ? 'NID verification is required for Banking & Finance services (such as micro loans). Please complete KYC verification to proceed.'
              : 'Email verification is required to use this feature. Please complete your profile setup.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {isNID
              ? 'To apply for micro loans and other financial services, you must verify your National ID (NID). This helps us ensure secure and compliant financial transactions.'
              : 'To access this feature, please verify your email address by completing your profile.'}
          </p>
          <Button onClick={onClose} className="w-full bg-gradient-to-r from-green to-accent text-white">
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
