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
  EyeOff,
  Home,
  History,
  User
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
  const [activeTab, setActiveTab] = useState('home');

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
        // Fetch recent transactions
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

  const renderHomeTab = () => (
    <div className="space-y-6">
      {/* Wallet Cards */}
      <div className="space-y-4">
        {wallets.map((wallet, index) => (
          <Card 
            key={wallet.id} 
            className="bg-slate-800/50 border-slate-700 backdrop-blur-sm slide-up"
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
                  ? formatCurrency(wallet.available_balance, wallet.currency.symbol)
                  : '••••••'
                }
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Available • Pending: {formatCurrency(wallet.pending_balance, wallet.currency.symbol)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          className="h-20 flex-col space-y-2 blue-gradient hover:scale-105 transition-all duration-300 text-white slide-up"
          onClick={() => handleQuickAction('send')}
        >
          <Send className="h-6 w-6" />
          <span className="text-sm font-medium">Send</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex-col space-y-2 border-slate-600 text-gray-300 hover:text-white hover:bg-slate-700 transition-all duration-300 slide-up"
          onClick={() => handleQuickAction('deposit')}
        >
          <Download className="h-6 w-6" />
          <span className="text-sm font-medium">Add Funds</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex-col space-y-2 border-slate-600 text-gray-300 hover:text-white hover:bg-slate-700 transition-all duration-300 slide-up"
        >
          <CreditCard className="h-6 w-6" />
          <span className="text-sm font-medium">Cards</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex-col space-y-2 border-slate-600 text-gray-300 hover:text-white hover:bg-slate-700 transition-all duration-300 slide-up"
          onClick={() => handleQuickAction('withdraw')}
        >
          <LogOut className="h-6 w-6" />
          <span className="text-sm font-medium">Withdraw</span>
        </Button>
      </div>
    </div>
  );

  const renderTransactionsTab = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <Wallet className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No transactions yet</p>
          <p className="text-sm text-gray-600">Start by adding funds to your wallet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction, index) => (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-600 rounded-lg"
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
                  <p className="font-medium text-white">{transaction.transaction_type.name}</p>
                  <p className="text-sm text-gray-500">
                    {transaction.description || 'No description'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(transaction.created_at)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-white">
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
    </div>
  );

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-xl font-bold text-white">{profile?.full_name || 'User'}</h2>
        <p className="text-gray-400">{profile?.email}</p>
      </div>

      <div className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full h-12 border-slate-600 text-gray-300 hover:text-white hover:bg-slate-700 justify-start"
        >
          <Settings className="h-5 w-5 mr-3" />
          Settings
        </Button>
        <Button 
          variant="outline" 
          className="w-full h-12 border-slate-600 text-gray-300 hover:text-white hover:bg-slate-700 justify-start"
        >
          <Bell className="h-5 w-5 mr-3" />
          Notifications
        </Button>
        <Button 
          variant="outline" 
          onClick={handleSignOut}
          className="w-full h-12 border-slate-600 text-gray-300 hover:text-red-400 hover:bg-slate-700 justify-start"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen dark-gradient pb-20">
      {/* Header */}
      <div className="bg-slate-800/70 backdrop-blur-sm border-b border-slate-700 shadow-lg sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 fade-in">
              <div className="relative">
                <Wallet className="h-8 w-8 text-blue-400" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-white bg-clip-text text-transparent">
                  DrkPaypal Wallet
                </h1>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-400">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {activeTab === 'home' && renderHomeTab()}
        {activeTab === 'transactions' && renderTransactionsTab()}
        {activeTab === 'profile' && renderProfileTab()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-sm border-t border-slate-700 z-50">
        <div className="flex justify-around py-2">
          <Button
            variant="ghost"
            className={`flex-col space-y-1 h-16 px-3 ${
              activeTab === 'home' 
                ? 'text-blue-400 bg-blue-400/10' 
                : 'text-gray-400 hover:text-blue-400'
            }`}
            onClick={() => setActiveTab('home')}
          >
            <Home className="h-6 w-6" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex-col space-y-1 h-16 px-3 ${
              activeTab === 'transactions' 
                ? 'text-blue-400 bg-blue-400/10' 
                : 'text-gray-400 hover:text-blue-400'
            }`}
            onClick={() => setActiveTab('transactions')}
          >
            <History className="h-6 w-6" />
            <span className="text-xs">History</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex-col space-y-1 h-16 px-3 ${
              activeTab === 'profile' 
                ? 'text-blue-400 bg-blue-400/10' 
                : 'text-gray-400 hover:text-blue-400'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            <User className="h-6 w-6" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
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
