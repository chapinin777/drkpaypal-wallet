import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Save, Edit3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const UserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    address_line1: '',
    city: '',
    state: '',
    country: 'United States',
    postal_code: ''
  });

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(prev => ({
          ...prev,
          ...data,
          email: user.email || ''
        }));
      } else {
        setProfile(prev => ({
          ...prev,
          email: user.email || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profile,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully",
        variant: "default"
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="glass-card border-white/10 shadow-2xl hover-glow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
          <User className="h-5 w-5" />
          User Profile
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          className="text-white hover:bg-white/10"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white">Full Name</Label>
            <Input
              value={profile.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              disabled={!isEditing}
              className="glass-light border-white/20 text-white placeholder:text-gray-400 disabled:opacity-60"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-white">Email</Label>
            <Input
              value={profile.email}
              disabled
              className="glass-light border-white/20 text-white placeholder:text-gray-400 disabled:opacity-60"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-white">Phone</Label>
            <Input
              value={profile.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!isEditing}
              placeholder="(555) 123-4567"
              className="glass-light border-white/20 text-white placeholder:text-gray-400 disabled:opacity-60"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-white">Address</Label>
            <Input
              value={profile.address_line1}
              onChange={(e) => handleInputChange('address_line1', e.target.value)}
              disabled={!isEditing}
              placeholder="123 Main St"
              className="glass-light border-white/20 text-white placeholder:text-gray-400 disabled:opacity-60"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-white">City</Label>
            <Input
              value={profile.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              disabled={!isEditing}
              placeholder="New York"
              className="glass-light border-white/20 text-white placeholder:text-gray-400 disabled:opacity-60"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-white">State</Label>
            <Input
              value={profile.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              disabled={!isEditing}
              placeholder="NY"
              className="glass-light border-white/20 text-white placeholder:text-gray-400 disabled:opacity-60"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-white">Country</Label>
            <Input
              value={profile.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              disabled={!isEditing}
              className="glass-light border-white/20 text-white placeholder:text-gray-400 disabled:opacity-60"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-white">Postal Code</Label>
            <Input
              value={profile.postal_code}
              onChange={(e) => handleInputChange('postal_code', e.target.value)}
              disabled={!isEditing}
              placeholder="10001"
              className="glass-light border-white/20 text-white placeholder:text-gray-400 disabled:opacity-60"
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                fetchProfile();
              }}
              className="text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserProfile;