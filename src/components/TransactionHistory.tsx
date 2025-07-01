
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  created_at: string;
  completed_at: string | null;
  transaction_type: {
    name: string;
    code: string;
  };
  status: {
    name: string;
    code: string;
  };
  currency: {
    code: string;
    symbol: string;
  };
}

interface TransactionHistoryProps {
  refreshKey?: number;
}

const TransactionHistory = ({ refreshKey }: TransactionHistoryProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user's wallets first
      const { data: wallets } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', user.id);

      if (!wallets || wallets.length === 0) {
        setTransactions([]);
        return;
      }

      const walletIds = wallets.map(w => w.id);

      // Get transactions for user's wallets
      const { data: transactionData, error } = await supabase
        .from('transactions')
        .select(`
          id,
          amount,
          description,
          created_at,
          completed_at,
          transaction_type:transaction_types(name, code),
          status:transaction_statuses(name, code),
          currency:currencies(code, symbol)
        `)
        .or(`from_wallet_id.in.(${walletIds.join(',')}),to_wallet_id.in.(${walletIds.join(',')})`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setTransactions(transactionData as Transaction[] || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [refreshKey]);

  const getStatusIcon = (statusCode: string) => {
    switch (statusCode) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (statusCode: string) => {
    switch (statusCode) {
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getTransactionIcon = (typeCode: string) => {
    switch (typeCode) {
      case 'deposit':
      case 'receive':
        return <ArrowDownLeft className="h-4 w-4 text-green-400" />;
      case 'withdraw':
      case 'send':
        return <ArrowUpRight className="h-4 w-4 text-red-400" />;
      default:
        return <History className="h-4 w-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <Card className="glass-card border-white/10 shadow-2xl">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 glass-light rounded w-3/4 shimmer"></div>
            <div className="h-4 glass-light rounded w-1/2 shimmer"></div>
            <div className="h-4 glass-light rounded w-2/3 shimmer"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-white/10 shadow-2xl hover-glow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white flex items-center">
          <History className="mr-2 h-5 w-5 text-purple-400" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No transactions found</p>
            <p className="text-sm text-gray-500 mt-2">
              Your transaction history will appear here
            </p>
          </div>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 glass-light rounded-xl hover:bg-white/10 transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  {getTransactionIcon(transaction.transaction_type?.code)}
                </div>
                <div>
                  <p className="text-white font-medium">
                    {transaction.description || transaction.transaction_type?.name}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {new Date(transaction.created_at).toLocaleDateString()} at{' '}
                    {new Date(transaction.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="text-right flex items-center space-x-3">
                <div>
                  <p className="text-white font-bold">
                    {transaction.transaction_type?.code === 'withdraw' || transaction.transaction_type?.code === 'send' ? '-' : '+'}
                    ${Number(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <Badge className={getStatusColor(transaction.status?.code)}>
                    {getStatusIcon(transaction.status?.code)}
                    <span className="ml-1">{transaction.status?.name}</span>
                  </Badge>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
