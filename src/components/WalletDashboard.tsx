
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
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
          currency:currencies(symbol, code),
          from_wallet:wallets!from_wallet_id(user_id),
          to_wallet:wallets!to_wallet_id(user_id)
        `)
        .or(`from_wallet.user_id.eq.${user?.id},to_wallet.user_id.eq.${user?.id}`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionsError) throw transactionsError;
      setTransactions(transactionsData || []);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Wallet className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading your wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Wallet className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">PayPal Wallet</h1>
                <p className="text-sm text-gray-500">Welcome back, {profile?.full_name || 'User'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wallet Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {wallets.map((wallet) => (
            <Card key={wallet.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {wallet.currency.name} Wallet
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  className="h-4 w-4"
                >
                  {balanceVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {balanceVisible 
                    ? formatCurrency(wallet.available_balance, wallet.currency.symbol)
                    : '****'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Available • Pending: {formatCurrency(wallet.pending_balance, wallet.currency.symbol)}
                </p>
                <div className="flex space-x-2 mt-4">
                  <Button size="sm" className="flex-1">
                    <Send className="h-4 w-4 mr-1" />
                    Send
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Add New Wallet Card */}
          <Card className="border-dashed border-2 border-gray-300 hover:border-blue-500 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center h-full py-8">
              <Plus className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Add New Currency</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Button className="h-16 flex-col space-y-1">
            <Send className="h-5 w-5" />
            <span className="text-xs">Send Money</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col space-y-1">
            <Download className="h-5 w-5" />
            <span className="text-xs">Add Funds</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col space-y-1">
            <CreditCard className="h-5 w-5" />
            <span className="text-xs">Payment Methods</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col space-y-1">
            <Settings className="h-5 w-5" />
            <span className="text-xs">Settings</span>
          </Button>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest wallet activity</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No transactions yet</p>
                <p className="text-sm text-gray-400">Start by adding funds to your wallet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
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
    </div>
  );
};

export default WalletDashboard;
