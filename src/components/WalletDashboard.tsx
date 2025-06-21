
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
import ServiceFeeModal from '@/components/ServiceFeeModal';

interface WalletData {
  balance: number;
  wallet_address: string;
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
  const [updatedFullName, setUpdatedFullName] = useState('');
  const [showBalance, setShowBalance] = useState(true);
  const [activeModal, setActiveModal] = useState<'send' | 'receive' | 'deposit' | 'withdraw' | 'serviceFee' | null>(null);

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
          .select('balance, wallet_address')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (walletError) {
          console.error("Wallet fetch error:", walletError);
          // Set default wallet data if no wallet exists yet
          setWalletData({
            balance: 1250.00,
            wallet_address: '0x742d35A8f'
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
          // Set default transactions for demo
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
      description: `${type} transaction for $${amount} has been initiated.`,
    });
    setActiveModal(null);
  };

  const handleWithdraw = () => {
    // Show service fee modal for withdrawals
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading wallet...</p>
        </div>
      </div>
    );
  }

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
                <span>{walletData?.wallet_address || 'Loading...'}</span>
                <Button variant="ghost" size="sm" onClick={copyAddress} className="h-6 w-6 p-0">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-3xl font-bold text-white">
                  {showBalance ? `$${walletData?.balance?.toLocaleString() || '0.00'}` : '••••••'}
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
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <Button
                  onClick={() => setActiveModal('send')}
                  className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 mb-2 p-0"
                >
                  <Send className="h-5 w-5" />
                </Button>
                <span className="text-xs text-gray-300 block">Send</span>
              </div>
              
              <div className="text-center">
                <Button
                  onClick={() => setActiveModal('receive')}
                  className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 mb-2 p-0"
                >
                  <ArrowDown className="h-5 w-5" />
                </Button>
                <span className="text-xs text-gray-300 block">Receive</span>
              </div>
              
              <div className="text-center">
                <Button
                  onClick={() => setActiveModal('deposit')}
                  className="w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 mb-2 p-0"
                >
                  <Plus className="h-5 w-5" />
                </Button>
                <span className="text-xs text-gray-300 block">Add</span>
              </div>
              
              <div className="text-center">
                <Button
                  onClick={handleWithdraw}
                  className="w-14 h-14 rounded-full bg-orange-600 hover:bg-orange-700 mb-2 p-0"
                >
                  <ArrowUp className="h-5 w-5" />
                </Button>
                <span className="text-xs text-gray-300 block">Withdraw</span>
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
                        transaction.amount > 0 ? 'bg-green-600' :
                        transaction.type === 'Sent' ? 'bg-red-600' :
                        'bg-blue-600'
                      }`}>
                        {transaction.amount > 0 ? <ArrowDown className="h-4 w-4" /> :
                         transaction.type === 'Sent' ? <ArrowUp className="h-4 w-4" /> :
                         <Plus className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-white font-medium">{transaction.type}</p>
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
              <div className="p-6 text-center">
                <p className="text-gray-400">No transactions yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction Modals */}
      {activeModal && activeModal !== 'serviceFee' && (
        <TransactionModal
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
