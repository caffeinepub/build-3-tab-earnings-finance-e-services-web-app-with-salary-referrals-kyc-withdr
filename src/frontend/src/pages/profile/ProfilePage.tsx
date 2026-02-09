import { useState } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../../hooks/queries/useCurrentUserProfile';
import { useMyReferralCode, useMyReferrals } from '../../hooks/queries/useReferrals';
import { useIsCallerAdmin } from '../../hooks/queries/useAccessControl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ReferralCard } from '../../components/referrals/ReferralCard';
import { KYCPage } from '../kyc/KYCPage';
import { AdminBanPanel } from '../admin/AdminBanPanel';
import { CheckCircle2, XCircle, Edit, Save, Shield, FileCheck } from 'lucide-react';

export function ProfilePage() {
  const { data: profile } = useGetCallerUserProfile();
  const { data: referralCode } = useMyReferralCode();
  const { data: referrals = [] } = useMyReferrals();
  const { data: isAdmin = false } = useIsCallerAdmin();
  const saveProfile = useSaveCallerUserProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [showKYC, setShowKYC] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const handleSave = async () => {
    if (!profile) return;

    await saveProfile.mutateAsync({
      ...profile,
      name,
      email,
      phone,
      location,
    });
    setIsEditing(false);
  };

  if (showKYC) {
    return (
      <div>
        <Button variant="ghost" onClick={() => setShowKYC(false)} className="mb-4">
          ← Back to Profile
        </Button>
        <KYCPage />
      </div>
    );
  }

  if (showAdmin && isAdmin) {
    return (
      <div>
        <Button variant="ghost" onClick={() => setShowAdmin(false)} className="mb-4">
          ← Back to Profile
        </Button>
        <AdminBanPanel />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-12">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Profile & Settings</h2>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </div>
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={saveProfile.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {saveProfile.isPending ? 'Saving...' : 'Save'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
          <CardDescription>Your account verification details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Email Verified</span>
            {profile.verificationStatus.emailVerified ? (
              <Badge variant="default" className="bg-primary">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Verified
              </Badge>
            ) : (
              <Badge variant="secondary">
                <XCircle className="mr-1 h-3 w-3" />
                Not Verified
              </Badge>
            )}
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm">NID Verified</span>
            {profile.verificationStatus.nidVerified ? (
              <Badge variant="default" className="bg-primary">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Verified
              </Badge>
            ) : (
              <Badge variant="secondary">
                <XCircle className="mr-1 h-3 w-3" />
                Not Verified
              </Badge>
            )}
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm">Bank Account Verified</span>
            {profile.verificationStatus.bankAccountVerified ? (
              <Badge variant="default" className="bg-primary">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Verified
              </Badge>
            ) : (
              <Badge variant="secondary">
                <XCircle className="mr-1 h-3 w-3" />
                Not Verified
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            KYC Verification
          </CardTitle>
          <CardDescription>Upload documents for identity verification</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowKYC(true)} className="w-full bg-gradient-to-r from-primary to-accent text-white">
            Manage KYC Documents
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Referral Program</CardTitle>
          <CardDescription>Share your code and earn rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <ReferralCard />
        </CardContent>
      </Card>

      {isAdmin && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Shield className="h-5 w-5" />
              Admin Panel
            </CardTitle>
            <CardDescription>Manage users and system settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowAdmin(true)} variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
              Open Admin Panel
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
