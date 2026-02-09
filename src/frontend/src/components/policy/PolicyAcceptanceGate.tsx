import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface PolicyAcceptanceGateProps {
  children: React.ReactNode;
}

export function PolicyAcceptanceGate({ children }: PolicyAcceptanceGateProps) {
  const { identity } = useInternetIdentity();
  const [accepted, setAccepted] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (identity) {
      const principal = identity.getPrincipal().toString();
      const key = `policy-accepted-${principal}`;
      const hasAccepted = localStorage.getItem(key) === 'true';
      setAccepted(hasAccepted);
      setShowDialog(!hasAccepted);
    }
  }, [identity]);

  const handleAccept = () => {
    if (!termsChecked || !privacyChecked) return;

    if (identity) {
      const principal = identity.getPrincipal().toString();
      const key = `policy-accepted-${principal}`;
      localStorage.setItem(key, 'true');
      setAccepted(true);
      setShowDialog(false);
    }
  };

  if (!identity || accepted) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <Dialog open={showDialog} onOpenChange={() => {}}>
        <DialogContent className="max-w-2xl max-h-[90vh]" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Terms of Service & Privacy Policy</DialogTitle>
            <DialogDescription>
              Please review and accept our terms and privacy policy to continue
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold text-base mb-2">Terms of Service</h3>
                <p className="text-muted-foreground mb-2">
                  By using EarnHub, you agree to the following terms:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>You must provide accurate information during registration and verification</li>
                  <li>Email verification is required for earning activities</li>
                  <li>NID/document verification is mandatory for micro loans and government e-services</li>
                  <li>Use of auto-clickers, bots, or fake referrals is strictly prohibited</li>
                  <li>Violation of terms may result in account ban and forfeiture of earnings</li>
                  <li>You are responsible for the accuracy of information you provide</li>
                  <li>EarnHub serves as a platform to facilitate services; we are not liable for user errors</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-base mb-2">Privacy Policy</h3>
                <p className="text-muted-foreground mb-2">
                  Your privacy and data security are important to us:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>All personal data is encrypted and stored securely</li>
                  <li>Sensitive documents (NID, land records) are encrypted before transmission</li>
                  <li>We will never sell or share your personal information with third parties</li>
                  <li>Your data is used only for verification and service delivery purposes</li>
                  <li>You can request data deletion by contacting support</li>
                  <li>We comply with data protection regulations</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-base mb-2">Ban & Forfeiture Policy</h3>
                <p className="text-muted-foreground">
                  Users found engaging in fraudulent activities (auto-clicking, bot usage, fake referrals) will have their accounts permanently banned and all earnings forfeited without refund.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-base mb-2">User Responsibility</h3>
                <p className="text-muted-foreground">
                  EarnHub acts as a facilitator for government and financial services. Users are solely responsible for the accuracy and legality of information they submit. We are not liable for consequences arising from incorrect or fraudulent submissions.
                </p>
              </div>
            </div>
          </ScrollArea>

          <div className="space-y-3 pt-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={termsChecked}
                onCheckedChange={(checked) => setTermsChecked(checked as boolean)}
              />
              <label htmlFor="terms" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I have read and agree to the Terms of Service
              </label>
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox
                id="privacy"
                checked={privacyChecked}
                onCheckedChange={(checked) => setPrivacyChecked(checked as boolean)}
              />
              <label htmlFor="privacy" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I have read and agree to the Privacy Policy
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleAccept}
              disabled={!termsChecked || !privacyChecked}
              className="w-full bg-gradient-to-r from-[oklch(0.55_0.25_264)] to-[oklch(0.75_0.20_85)]"
            >
              Accept and Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
