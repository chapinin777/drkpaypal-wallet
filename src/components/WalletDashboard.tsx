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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Wallet, Send, Plus, ArrowDown, ArrowUp, Receipt, User, Settings, LogOut, Copy, Eye, EyeOff } from 'lucide-react';
import TransactionModal from '@/components/TransactionModal';

const WalletDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedFullName, setUpdatedFullName] = useState('');
  const [showBalance, setShowBalance] = useState(true);
  const [activeModal, setActiveModal] = useState<'send' | 'receive' | 'deposit' | 'withdraw' | null>(null);
  const [transactions] = useState([
    { id: 1, type: 'Received', amount: '+$250.00', date: '2 hours ago', from: 'john@example.com' },
    { id: 2, type: 'Sent', amount: '-$50.00', date: '1 day ago', to: 'alice@example.com' },
    { id: 3, type: 'Deposited', amount: '+$1,000.00', date: '3 days ago', from: 'Bank Transfer' },
  ]);

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

  const walletAddress = "0x742d...5A8f";
  const balance = "1,250.00";

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast({
      title: "Address copied",
      description: "Wallet address copied to clipboard",
    });
  };

  const handleTransaction = (type: string, amount: number, recipient?: string) => {
    console.log(`${type} transaction:`, { amount, recipient });
    toast({
      title: "Transaction initiated",
      description: `${type} transaction for $${amount} has been initiated.`,
    });
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="h-6 w-6 text-blue-400" />
            <span className="text-lg font-bold text-white">PayPal Wallet</span>
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
      <div className="max-w-md mx-auto py-6 px-4">
        {/* Balance Card - Metamask Style */}
        <Card className="bg-gray-800 border-gray-700 shadow-lg mb-6">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
            </div>
            
            <div className="mb-2">
              <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm mb-1">
                <span>{walletAddress}</span>
                <Button variant="ghost" size="sm" onClick={copyAddress} className="h-6 w-6 p-0">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-3xl font-bold text-white">
                  {showBalance ? `$${balance}` : '••••••'}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowBalance(!showBalance)}
                  className="h-6 w-6 p-0"
                >
                  {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-gray-400 text-sm">Available Balance</p>
            </div>

            {/* Action Buttons - Metamask Style */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <Button
                  onClick={() => setActiveModal('send')}
                  className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 mb-2"
                >
                  <Send className="h-5 w-5" />
                </Button>
                <span className="text-xs text-gray-300">Send</span>
              </div>
              
              <div className="text-center">
                <Button
                  onClick={() => setActiveModal('receive')}
                  className="w-12 h-12 rounded-full bg-green-600 hover:bg-green-700 mb-2"
                >
                  <ArrowDown className="h-5 w-5" />
                </Button>
                <span className="text-xs text-gray-300">Receive</span>
              </div>
              
              <div className="text-center">
                <Button
                  onClick={() => setActiveModal('deposit')}
                  className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700 mb-2"
                >
                  <Plus className="h-5 w-5" />
                </Button>
                <span className="text-xs text-gray-300">Add</span>
              </div>
              
              <div className="text-center">
                <Button
                  onClick={() => setActiveModal('withdraw')}
                  className="w-12 h-12 rounded-full bg-orange-600 hover:bg-orange-700 mb-2"
                >
                  <ArrowUp className="h-5 w-5" />
                </Button>
                <span className="text-xs text-gray-300">Withdraw</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="bg-gray-800 border-gray-700 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-white flex items-center">
              <Receipt className="mr-2 h-5 w-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {transactions.length > 0 ? (
              <div className="space-y-0">
                {transactions.map((transaction, index) => (
                  <div 
                    key={transaction.id} 
                    className={`flex items-center justify-between p-4 hover:bg-gray-700/50 transition-colors ${
                      index !== transactions.length - 1 ? 'border-b border-gray-700' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === 'Received' ? 'bg-green-600' :
                        transaction.type === 'Sent' ? 'bg-red-600' :
                        'bg-blue-600'
                      }`}>
                        {transaction.type === 'Received' ? <ArrowDown className="h-4 w-4" /> :
                         transaction.type === 'Sent' ? <ArrowUp className="h-4 w-4" /> :
                         <Plus className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-white font-medium">{transaction.type}</p>
                        <p className="text-gray-400 text-sm">
                          {transaction.from && `From: ${transaction.from}`}
                          {transaction.to && `To: ${transaction.to}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.amount.startsWith('+') ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.amount}
                      </p>
                      <p className="text-gray-400 text-sm">{transaction.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-400">No transactions yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction Modals */}
      {activeModal && (
        <TransactionModal
          type={activeModal}
          onClose={() => setActiveModal(null)}
          onConfirm={handleTransaction}
        />
      )}

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
    </div>
  );
};

export default WalletDashboard;
