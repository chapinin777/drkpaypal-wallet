import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Wallet, CreditCard, Send, Receipt, User, Settings, LogOut } from 'lucide-react';

const WalletDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedFullName, setUpdatedFullName] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (!user) {
          navigate('/auth');
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load profile data.",
          });
          return;
        }

        setProfile(profileData);
        setUpdatedFullName(profileData?.full_name || '');
      } catch (error: any) {
        console.error("Error fetching profile:", error.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate('/auth');
    } catch (error: any) {
      console.error("Sign out error:", error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out.",
      });
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: updatedFullName })
        .eq('id', user?.id);

      if (error) {
        throw error;
      }

      setProfile(prev => prev ? { ...prev, full_name: updatedFullName } : null);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      console.error("Profile update error:", error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Desktop Header */}
      <div className="hidden md:block bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Wallet className="h-8 w-8 text-blue-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Rolland PayPal</h1>
              <p className="text-xs text-gray-400">Digital Wallet</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 rounded-full hover:bg-gray-700">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || `https://avatar.vercel.sh/${user?.email}.png`} alt={profile?.full_name || user?.email || "Avatar"} />
                  <AvatarFallback className="bg-gray-700 text-white">{profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem onClick={() => setIsEditing(true)} className="hover:bg-gray-700">
                <User className="mr-2 h-4 w-4" />
                <span>Edit Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-700">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem onClick={handleSignOut} className="hover:bg-gray-700">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="h-6 w-6 text-blue-400" />
            <span className="text-lg font-bold text-white">Rolland</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 rounded-full hover:bg-gray-700">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || `https://avatar.vercel.sh/${user?.email}.png`} alt={profile?.full_name || user?.email || "Avatar"} />
                  <AvatarFallback className="bg-gray-700 text-white">{profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem onClick={() => setIsEditing(true)} className="hover:bg-gray-700">
                <User className="mr-2 h-4 w-4" />
                <span>Edit Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-700">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem onClick={handleSignOut} className="hover:bg-gray-700">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-6 px-4 md:px-6">
        {/* Edit Profile Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border border-gray-700 w-96 shadow-lg rounded-md bg-gray-800">
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-white">Edit Profile</h3>
                <div className="mt-2 px-7 py-3">
                  <Label htmlFor="fullName" className="block text-sm font-medium text-gray-300">Full Name</Label>
                  <Input
                    type="text"
                    id="fullName"
                    value={updatedFullName}
                    onChange={(e) => setUpdatedFullName(e.target.value)}
                    className="mt-1 bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md"
                  />
                </div>
                <div className="items-center px-4 py-3">
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                    className="mt-3 px-4 py-2 text-gray-300 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Balance Card */}
          <Card className="bg-gray-800 border-gray-700 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Account Balance</CardTitle>
              <CardDescription className="text-gray-300">Available funds in your wallet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">$0.00</div>
              <p className="text-sm text-gray-400">Last updated: Now</p>
            </CardContent>
          </Card>

          {/* Send Money */}
          <Card className="bg-gray-800 border-gray-700 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Send Money</CardTitle>
              <CardDescription className="text-gray-300">Transfer funds to another account</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-green-600 text-white hover:bg-green-700">
                <Send className="mr-2 h-4 w-4" />
                Send Funds
              </Button>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="bg-gray-800 border-gray-700 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Recent Transactions</CardTitle>
              <CardDescription className="text-gray-300">Your latest transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">No recent transactions.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WalletDashboard;
