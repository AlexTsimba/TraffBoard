import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requirePageAuth } from "@/lib/auth/page-protection";
import { get2FAStatus } from "@/lib/data/two-factor";
import { getCurrentUserProfile } from "@/lib/data/users";

import { AccountSettings } from "./_components/account-settings";
import AppearanceSettings from "./_components/appearance-settings";
import { PasswordChange } from "./_components/password-change";
import { SecuritySettings } from "./_components/security-settings";

export default async function SettingsPage() {
  // SECURITY: Page-level authentication check
  await requirePageAuth();

  // Load user profile and 2FA status using secure Data Access Layer
  // Sessions removed - using JWT-only authentication
  const [userProfile, twoFactorStatus] = await Promise.all([
    getCurrentUserProfile(),
    get2FAStatus().catch(() => null), // Gracefully handle 2FA status errors
  ]);

  return (
    <div className="@container/main flex flex-col gap-4">
      <Tabs className="w-full" defaultValue="account">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent className="pt-2" value="account">
          <div className="space-y-6">
            <AccountSettings initialUser={userProfile} />
            <PasswordChange />
          </div>
        </TabsContent>
        <TabsContent className="pt-2" value="security">
          <SecuritySettings initial2FAStatus={twoFactorStatus} />
        </TabsContent>
        <TabsContent className="pt-2" value="appearance">
          <AppearanceSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
