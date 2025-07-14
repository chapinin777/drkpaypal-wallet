import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, Bell, Shield, Smartphone, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Settings = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    transactionAlerts: true,
    securityAlerts: true,
    twoFactorAuth: false,
    biometricAuth: false
  });

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    toast({
      title: "Setting Updated",
      description: "Your preference has been saved",
      variant: "default"
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Sign Out Failed",
        description: "Unable to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="glass-card border-white/10 shadow-2xl hover-glow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-white" />
            <h3 className="text-white font-medium">Notifications</h3>
          </div>
          
          <div className="space-y-3 pl-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="text-white">
                Email Notifications
              </Label>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications" className="text-white">
                Push Notifications
              </Label>
              <Switch
                id="push-notifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="transaction-alerts" className="text-white">
                Transaction Alerts
              </Label>
              <Switch
                id="transaction-alerts"
                checked={settings.transactionAlerts}
                onCheckedChange={(checked) => handleSettingChange('transactionAlerts', checked)}
              />
            </div>
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Security */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-white" />
            <h3 className="text-white font-medium">Security</h3>
          </div>
          
          <div className="space-y-3 pl-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="security-alerts" className="text-white">
                Security Alerts
              </Label>
              <Switch
                id="security-alerts"
                checked={settings.securityAlerts}
                onCheckedChange={(checked) => handleSettingChange('securityAlerts', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="two-factor" className="text-white">
                Two-Factor Authentication
              </Label>
              <Switch
                id="two-factor"
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="biometric" className="text-white">
                Biometric Authentication
              </Label>
              <Switch
                id="biometric"
                checked={settings.biometricAuth}
                onCheckedChange={(checked) => handleSettingChange('biometricAuth', checked)}
              />
            </div>
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Account Actions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-white" />
            <h3 className="text-white font-medium">Account</h3>
          </div>
          
          <div className="pl-6">
            <Button
              onClick={handleSignOut}
              variant="destructive"
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Settings;