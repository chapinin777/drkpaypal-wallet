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
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Wallet, Send, Plus, ArrowDown, ArrowUp, Receipt, User, Settings, LogOut, Copy, Eye, EyeOff, Upload, Camera, Lock, Shield, CreditCard, Bell, Smartphone, Monitor, Globe, HelpCircle, FileText, Zap } from 'lucide-react';
import EnhancedTransactionModal from '@/components/EnhancedTransactionModal';
import ServiceFeeModal from '@/components/ServiceFeeModal';
import AssetsSection from '@/components/AssetsSection';

interface WalletData {
  balance: number;
  wallet_address: string;
  pending_balance: number;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
  status: string;
}

const WalletDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [updatedFullName, setUpdatedFullName] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [activeModal, setActiveModal] = useState<'send' | 'receive' | 'deposit' | 'withdraw' | 'serviceFee' | null>(null);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!user) {
          navigate('/auth');
          return;
        }

        // Fetch profile
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

        // Fetch wallet data
        const { data: walletResponse, error: walletError } = await supabase
          .from('wallets')
          .select('balance, wallet_address, pending_balance')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (walletError) {
          console.error("Wallet fetch error:", walletError);
          setWalletData({
            balance: 1250.00,
            wallet_address: '0x742d35A8f',
            pending_balance: 0.00
          });
        } else {
          setWalletData(walletResponse);
        }

        // Fetch transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select(`
            id,
            amount,
            description,
            created_at,
            transaction_types(name),
            transaction_statuses(name)
          `)
          .or(`from_wallet_id.in.(${user.id}),to_wallet_id.in.(${user.id})`)
          .order('created_at', { ascending: false })
          .limit(10);

        if (transactionsError) {
          console.error("Transactions fetch error:", transactionsError);
          setTransactions([
            {
              id: '1',
              type: 'Received',
              amount: 250.00,
              description: 'Payment from john@example.com',
              created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              status: 'completed'
            },
            {
              id: '2',
              type: 'Sent',
              amount: -50.00,
              description: 'Payment to alice@example.com',
              created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              status: 'completed'
            },
            {
              id: '3',
              type: 'Deposited',
              amount: 1000.00,
              description: 'Bank Transfer',
              created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'completed'
            }
          ]);
        } else {
          const formattedTransactions = transactionsData.map(tx => ({
            id: tx.id,
            type: tx.transaction_types?.name || 'Transaction',
            amount: tx.amount,
            description: tx.description || '',
            created_at: tx.created_at,
            status: tx.transaction_statuses?.name || 'pending'
          }));
          setTransactions(formattedTransactions);
        }

      } catch (error: any) {
        console.error("Error fetching data:", error.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load wallet data.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    if (!updatedFullName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid name.",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: updatedFullName.trim() })
        .eq('id', user?.id);

      if (error) {
        throw error;
      }

      setProfile(prev => prev ? { ...prev, full_name: updatedFullName.trim() } : null);
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

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select an image file.",
      });
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      });

    } catch (error: any) {
      console.error("Avatar upload error:", error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile picture.",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;

    setResetPasswordLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (error: any) {
      console.error("Password reset error:", error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send password reset email.",
      });
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const copyAddress = () => {
    if (walletData?.wallet_address) {
      navigator.clipboard.writeText(walletData.wallet_address);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const handleTransaction = (type: string, amount: number, recipient?: string) => {
    console.log(`${type} transaction:`, { amount, recipient });
    toast({
      title: "Transaction initiated",
      description: `${type} transaction for $${amount.toFixed(2)} has been initiated.`,
    });
    setActiveModal(null);
  };

  const handleWithdraw = () => {
    setActiveModal('serviceFee');
  };

  const handleServiceFeeConfirm = () => {
    console.log('Service fee payment confirmed');
    toast({
      title: "Payment Confirmation",
      description: "Your service fee payment has been confirmed. Withdrawal will be processed shortly.",
    });
    setActiveModal(null);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const getTransactionIcon = (type: string, amount: number) => {
    if (amount > 0) return <ArrowDown className="h-4 w-4" />;
    if (type === 'Sent') return <ArrowUp className="h-4 w-4" />;
    return <Plus className="h-4 w-4" />;
  };

  const getTransactionBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">Failed</Badge>;
      default:
        return <Badge variant="outline" className="text-xs border-white/20">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div className="text-center fade-in-up">
          <div className="w-16 h-16 glass-card rounded-full flex items-center justify-center mb-4 mx-auto float-animation">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-400 border-t-transparent" />
          </div>
          <p className="text-gray-300">Loading your wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-bg text-white">
      {/* Enhanced Header with glassmorphism */}
      <div className="glass-strong border-b border-white/10 px-4 py-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 stripe-gradient rounded-lg flex items-center justify-center glow-purple">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              PayPal Wallet
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 rounded-full hover:bg-white/10 glass-light">
                <Avatar className="h-10 w-10 ring-2 ring-purple-500/30">
                  <AvatarImage src={profile?.avatar_url || `https://avatar.vercel.sh/${user?.email}.png`} alt={profile?.full_name || user?.email || "Avatar"} />
                  <AvatarFallback className="glass text-white">{profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-strong border-white/10 text-white w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={() => setIsEditing(true)} className="hover:bg-white/10">
                <User className="mr-2 h-4 w-4" />
                <span>Edit Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSettings(true)} className="hover:bg-white/10">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={handleSignOut} className="hover:bg-white/10">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto py-6 px-4 space-y-6">
        {/* Enhanced Balance Card */}
        <Card className="glass-card border-white/10 shadow-2xl hover-glow fade-in-up">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 luma-gradient rounded-2xl flex items-center justify-center shadow-lg float-animation">
                <Wallet className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm mb-2">
                <span className="font-mono">{walletData?.wallet_address || 'Loading...'}</span>
                <Button variant="ghost" size="sm" onClick={copyAddress} className="h-6 w-6 p-0 hover:bg-white/10">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <span className="text-4xl font-bold text-white">
                  {showBalance ? `$${walletData?.balance?.toFixed(2) || '0.00'}` : '••••••'}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowBalance(!showBalance)}
                  className="h-8 w-8 p-0 hover:bg-white/10 glass-light"
                >
                  {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-gray-400 text-sm mb-2">Available Balance</p>
              {walletData?.pending_balance && walletData.pending_balance > 0 && (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30">
                  <span className="text-orange-300 text-xs">
                    Pending: ${walletData.pending_balance.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <Button
                  onClick={() => setActiveModal('send')}
                  className="w-16 h-16 rounded-2xl btn-glass stripe-gradient mb-3 p-0 hover-glow"
                >
                  <Send className="h-6 w-6" />
                </Button>
                <span className="text-xs text-gray-300 block">Send</span>
              </div>
              
              <div className="text-center">
                <Button
                  onClick={() => setActiveModal('receive')}
                  className="w-16 h-16 rounded-2xl btn-glass bg-gradient-to-br from-green-500 to-emerald-600 mb-3 p-0 hover-glow"
                >
                  <ArrowDown className="h-6 w-6" />
                </Button>
                <span className="text-xs text-gray-300 block">Receive</span>
              </div>
              
              <div className="text-center">
                <Button
                  onClick={() => setActiveModal('deposit')}
                  className="w-16 h-16 rounded-2xl btn-glass bg-gradient-to-br from-purple-500 to-violet-600 mb-3 p-0 hover-glow"
                >
                  <Plus className="h-6 w-6" />
                </Button>
                <span className="text-xs text-gray-300 block">Add</span>
              </div>
              
              <div className="text-center">
                <Button
                  onClick={handleWithdraw}
                  className="w-16 h-16 rounded-2xl btn-glass bg-gradient-to-br from-orange-500 to-red-600 mb-3 p-0 hover-glow"
                >
                  <ArrowUp className="h-6 w-6" />
                </Button>
                <span className="text-xs text-gray-300 block">Withdraw</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Assets Section */}
        <div className="fade-in-up" style={{ animationDelay: '0.1s' }}>
          <AssetsSection />
        </div>

        {/* Enhanced Recent Transactions */}
        <Card className="glass-card border-white/10 shadow-2xl fade-in-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-white flex items-center">
              <Receipt className="mr-2 h-5 w-5 text-purple-400" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {transactions.length > 0 ? (
              <div className="space-y-0">
                {transactions.map((transaction, index) => (
                  <div 
                    key={transaction.id} 
                    className={`flex items-center justify-between p-4 hover:bg-white/5 transition-all duration-300 cursor-pointer border-white/5 ${
                      index !== transactions.length - 1 ? 'border-b' : ''
                    }`}
                    onClick={() => {
                      toast({
                        title: "Transaction Details",
                        description: `Transaction ID: ${transaction.id}`,
                      });
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                        transaction.amount > 0 ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                        transaction.type === 'Sent' ? 'bg-gradient-to-br from-red-500 to-pink-600' :
                        'bg-gradient-to-br from-blue-500 to-indigo-600'
                      }`}>
                        {getTransactionIcon(transaction.type, transaction.amount)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-white font-medium">{transaction.type}</p>
                          {getTransactionBadge(transaction.status)}
                        </div>
                        <p className="text-gray-400 text-sm">{transaction.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <p className="text-gray-400 text-sm">{formatTime(transaction.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 glass-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Receipt className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-400">No transactions yet.</p>
                <p className="text-gray-500 text-sm mt-1">Your transaction history will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Transaction Modal */}
      {activeModal && activeModal !== 'serviceFee' && (
        <EnhancedTransactionModal
          type={activeModal}
          onClose={() => setActiveModal(null)}
          onConfirm={handleTransaction}
        />
      )}

      {/* Service Fee Modal */}
      {activeModal === 'serviceFee' && (
        <ServiceFeeModal
          onClose={() => setActiveModal(null)}
          onConfirm={handleServiceFeeConfirm}
          userBalance={walletData?.balance || 0}
        />
      )}

      {/* Enhanced Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="glass-strong border-white/20 w-full max-w-md shadow-2xl rounded-2xl scale-in">
            <div className="p-6">
              <h3 className="text-xl leading-6 font-semibold text-white text-center mb-8">Edit Profile</h3>
              
              <div className="mb-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24 ring-4 ring-purple-500/30">
                      <AvatarImage 
                        src={profile?.avatar_url || `https://avatar.vercel.sh/${user?.email}.png`} 
                        alt={profile?.full_name || user?.email || "Avatar"} 
                      />
                      <AvatarFallback className="glass text-white text-2xl">
                        {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="absolute -bottom-2 -right-2 stripe-gradient hover:opacity-80 rounded-xl p-3 cursor-pointer transition-all hover:scale-105 shadow-lg"
                    >
                      {uploadingAvatar ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      ) : (
                        <Camera className="h-4 w-4 text-white" />
                      )}
                    </label>
                  </div>
                  <p className="text-gray-400 text-sm text-center">Click the camera icon to change your profile picture</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-3">Full Name</Label>
                  <Input
                    type="text"
                    id="fullName"
                    value={updatedFullName}
                    onChange={(e) => setUpdatedFullName(e.target.value)}
                    className="glass border-white/20 text-white focus:ring-purple-500 focus:border-purple-500 rounded-xl"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-300 mb-3">Email</Label>
                  <Input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="glass border-white/10 text-gray-400 cursor-not-allowed rounded-xl"
                  />
                  <p className="text-xs text-gray-500 mt-2">Email cannot be changed</p>
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={loading || uploadingAvatar || !updatedFullName.trim()}
                  className="flex-1 stripe-gradient hover:opacity-90 text-white rounded-xl py-3 font-medium"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setUpdatedFullName(profile?.full_name || '');
                  }}
                  disabled={loading || uploadingAvatar}
                  className="flex-1 text-gray-300 hover:bg-white/10 rounded-xl py-3"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border border-white/20 w-full max-w-md shadow-2xl rounded-2xl glass-strong max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-xl leading-6 font-semibold text-white text-center mb-8">Settings</h3>
              
              <div className="space-y-6">
                {/* Security Section */}
                <div className="glass-light rounded-xl p-5">
                  <div className="flex items-center space-x-2 mb-4">
                    <Lock className="h-5 w-5 text-blue-400" />
                    <h4 className="text-md font-medium text-white">Security</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <Button
                      onClick={handleResetPassword}
                      disabled={resetPasswordLoading}
                      className="w-full stripe-gradient hover:opacity-90 text-white justify-start rounded-xl py-3"
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      {resetPasswordLoading ? 'Sending...' : 'Reset Password'}
                    </Button>
                    
                    <div className="text-sm text-gray-400 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-3 w-3" />
                        <span>Use a strong, unique password</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Zap className="h-3 w-3" />
                        <span>Two-factor authentication (Coming Soon)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="glass-light rounded-xl p-5">
                  <div className="flex items-center space-x-2 mb-4">
                    <User className="h-5 w-5 text-green-400" />
                    <h4 className="text-md font-medium text-white">Account Information</h4>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Email:</span>
                      <span className="text-white">{user?.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Full Name:</span>
                      <span className="text-white">{profile?.full_name || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Account Created:</span>
                      <span className="text-white">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Wallet ID:</span>
                      <span className="text-white font-mono text-xs">{walletData?.wallet_address}</span>
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div className="glass-light rounded-xl p-5">
                  <div className="flex items-center space-x-2 mb-4">
                    <Settings className="h-5 w-5 text-purple-400" />
                    <h4 className="text-md font-medium text-white">Preferences</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Dark Mode</span>
                      <Badge variant="default" className="bg-green-500/20 text-green-300 border-green-500/30">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Currency</span>
                      <Badge variant="outline" className="text-gray-300 border-white/20">USD</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Language</span>
                      <Badge variant="outline" className="text-gray-300 border-white/20">English</Badge>
                    </div>
                  </div>
                </div>

                {/* KYC Verification */}
                <div className="glass-light rounded-xl p-5">
                  <div className="flex items-center space-x-2 mb-4">
                    <Shield className="h-5 w-5 text-orange-400" />
                    <h4 className="text-md font-medium text-white">KYC Verification</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Verification Status:</span>
                      <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">Pending</Badge>
                    </div>
                    
                    <Button
                      disabled
                      className="w-full glass border-white/20 text-gray-400 cursor-not-allowed rounded-xl py-3"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Complete Verification (Coming Soon)
                    </Button>
                    
                    <div className="text-sm text-gray-400 space-y-2">
                      <div className="flex items-center space-x-2">
                        <ArrowUp className="h-3 w-3" />
                        <span>Increase transaction limits</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Zap className="h-3 w-3" />
                        <span>Access to advanced features</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-3 w-3" />
                        <span>Enhanced account security</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="glass-light rounded-xl p-5">
                  <div className="flex items-center space-x-2 mb-4">
                    <Bell className="h-5 w-5 text-purple-400" />
                    <h4 className="text-md font-medium text-white">Notifications</h4>
                  </div>
                  
                  <div className="space-y-3 text-sm text-gray-400">
                    <div className="flex items-center justify-between">
                      <span>Transaction Alerts</span>
                      <Badge variant="default" className="bg-green-500/20 text-green-300 border-green-500/30">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Security Notifications</span>
                      <Badge variant="default" className="bg-green-500/20 text-green-300 border-green-500/30">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Marketing Emails</span>
                      <Badge variant="destructive" className="bg-red-500/20 text-red-300 border-red-500/30">Disabled</Badge>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="glass-light rounded-xl p-5">
                  <div className="flex items-center space-x-2 mb-4">
                    <CreditCard className="h-5 w-5 text-green-400" />
                    <h4 className="text-md font-medium text-white">Payment Methods</h4>
                  </div>
                  
                  <div className="text-sm text-gray-400 space-y-3">
                    <div className="flex items-center justify-between">
                      <span>PayPal</span>
                      <Badge variant="default" className="bg-blue-500/20 text-blue-300 border-blue-500/30">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Bank Transfer</span>
                      <Badge variant="outline" className="text-gray-300 border-white/20">Available</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Credit/Debit Cards</span>
                      <Badge variant="secondary" className="bg-gray-500/20 text-gray-300 border-gray-500/30">Coming Soon</Badge>
                    </div>
                  </div>
                </div>

                {/* Support */}
                <div className="glass-light rounded-xl p-5">
                  <div className="flex items-center space-x-2 mb-4">
                    <HelpCircle className="h-5 w-5 text-blue-400" />
                    <h4 className="text-md font-medium text-white">Support</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start glass border-white/20 text-gray-300 hover:bg-white/10 rounded-xl py-3"
                      disabled
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Documentation (Coming Soon)
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start glass border-white/20 text-gray-300 hover:bg-white/10 rounded-xl py-3"
                      disabled
                    >
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Contact Support (Coming Soon)
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button
                  onClick={() => setShowSettings(false)}
                  className="w-full glass border-white/20 hover:bg-white/10 text-white rounded-xl py-3"
                >
                  Close Settings
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
