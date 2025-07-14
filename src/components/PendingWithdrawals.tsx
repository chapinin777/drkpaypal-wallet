import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Clock, DollarSign, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PendingWithdrawal {
  id: string;
  amount: number;
  fee: number;
  net_amount: number;
  created_at: string;
  description: string;
}

const PendingWithdrawals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingWithdrawals, setPendingWithdrawals] = useState<PendingWithdrawal[]>([]);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPendingData = async () => {
    if (!user) return;
    
    try {
      // Get pending balance
      const { data: usdCurrency } = await supabase
        .from('currencies')
        .select('id')
        .eq('code', 'USD')
        .single();

      if (usdCurrency) {
        const { data: wallet } = await supabase
          .from('wallets')
          .select('pending_balance')
          .eq('user_id', user.id)
          .eq('currency_id', usdCurrency.id)
          .single();

        if (wallet) {
          setPendingBalance(Number(wallet.pending_balance));
        }

        // Get pending transactions
        const { data: pendingTransactions } = await supabase
          .from('transactions')
          .select(`
            id,
            amount,
            fee,
            net_amount,
            created_at,
            description,
            from_wallet_id,
            wallets!inner(user_id),
            transaction_statuses!inner(code)
          `)
          .eq('wallets.user_id', user.id)
          .eq('transaction_statuses.code', 'pending')
          .order('created_at', { ascending: false });

        if (pendingTransactions) {
          setPendingWithdrawals(pendingTransactions);
        }
      }
    } catch (error) {
      console.error('Error fetching pending data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingData();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card className="glass-card border-white/10 shadow-2xl hover-glow">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-white/10 shadow-2xl hover-glow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Withdrawals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pending Balance Summary */}
        <div className="glass-light p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-400" />
              <span className="text-white font-medium">Pending Balance</span>
            </div>
            <span className="text-2xl font-bold text-orange-400">
              ${pendingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Pending Transactions List */}
        {pendingWithdrawals.length === 0 ? (
          <div className="text-center py-6">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400">No pending withdrawals</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingWithdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="glass-light p-4 rounded-lg border border-orange-500/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                    Pending
                  </Badge>
                  <span className="text-gray-400 text-sm">
                    {formatDate(withdrawal.created_at)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white">Amount:</span>
                    <span className="text-white font-medium">
                      ${withdrawal.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Fee:</span>
                    <span className="text-red-400">
                      -${withdrawal.fee.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-white/10 pt-2">
                    <span className="text-white font-medium">Net Amount:</span>
                    <span className="text-green-400 font-medium">
                      ${withdrawal.net_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  {withdrawal.description && (
                    <p className="text-gray-400 text-sm mt-2">
                      {withdrawal.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {pendingWithdrawals.length > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-blue-300 text-sm">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              Complete the service fee payment to process your pending withdrawals.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingWithdrawals;