
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, X, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PricingTier {
  deposit: number;
  receive: number;
  roi: number;
}

interface FloatingPricingButtonProps {
  onBalanceUpdate?: () => void;
}

const FloatingPricingButton = ({ onBalanceUpdate }: FloatingPricingButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const pricingTiers: PricingTier[] = [
    { deposit: 20, receive: 380, roi: 1800 },
    { deposit: 50, receive: 950, roi: 1800 },
    { deposit: 100, receive: 1900, roi: 1800 },
    { deposit: 200, receive: 3800, roi: 1800 },
    { deposit: 500, receive: 9500, roi: 1800 },
    { deposit: 1000, receive: 19000, roi: 1800 }
  ];

  const handleDeposit = async (tier: PricingTier) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get USD currency
      const { data: usdCurrency, error: currencyError } = await supabase
        .from('currencies')
        .select('id')
        .eq('code', 'USD')
        .single();

      if (currencyError || !usdCurrency) throw new Error('USD currency not found');

      // Get user's USD wallet
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('id, balance, available_balance')
        .eq('user_id', user.id)
        .eq('currency_id', usdCurrency.id)
        .single();

      if (walletError || !wallet) throw new Error('Wallet not found');

      // Get transaction type and status
      const { data: transactionType } = await supabase
        .from('transaction_types')
        .select('id')
        .eq('code', 'deposit')
        .single();

      const { data: statusPending } = await supabase
        .from('transaction_statuses')
        .select('id')
        .eq('code', 'pending')
        .single();

      const { data: statusCompleted } = await supabase
        .from('transaction_statuses')
        .select('id')
        .eq('code', 'completed')
        .single();

      if (!transactionType || !statusPending || !statusCompleted) {
        throw new Error('Transaction configuration not found');
      }

      // First create pending transaction
      const { data: pendingTransaction, error: pendingError } = await supabase
        .from('transactions')
        .insert({
          to_wallet_id: wallet.id,
          transaction_type_id: transactionType.id,
          status_id: statusPending.id,
          currency_id: usdCurrency.id,
          amount: tier.receive,
          net_amount: tier.receive,
          fee: 0,
          description: `One-time credit deposit of $${tier.deposit} (Pending)`,
          metadata: {
            pricing_tier: {
              deposit: tier.deposit,
              receive: tier.receive,
              roi: tier.roi
            }
          }
        })
        .select()
        .single();

      if (pendingError) throw pendingError;

      // Show pending status
      toast({
        title: "Transaction Pending",
        description: `$${tier.receive} credit is being processed...`,
        variant: "default"
      });

      // Simulate processing time, then complete the transaction
      setTimeout(async () => {
        try {
          // Update transaction to completed
          await supabase
            .from('transactions')
            .update({
              status_id: statusCompleted.id,
              description: `One-time credit deposit of $${tier.deposit}`,
              completed_at: new Date().toISOString()
            })
            .eq('id', pendingTransaction.id);

          // Update wallet balance
          await supabase
            .from('wallets')
            .update({ 
              balance: wallet.balance + tier.receive,
              available_balance: wallet.available_balance + tier.receive,
              updated_at: new Date().toISOString()
            })
            .eq('id', wallet.id);

          toast({
            title: "Deposit Successful!",
            description: `$${tier.receive} has been credited to your account`,
            variant: "default"
          });

          // Trigger balance refresh
          if (onBalanceUpdate) {
            onBalanceUpdate();
          }
        } catch (error) {
          console.error('Failed to complete transaction:', error);
          toast({
            title: "Transaction Error",
            description: "Failed to complete deposit. Please contact support.",
            variant: "destructive"
          });
        }
      }, 2000);

      setIsOpen(false);
    } catch (error) {
      console.error('Deposit failed:', error);
      toast({
        title: "Deposit Failed",
        description: error instanceof Error ? error.message : "Unable to process deposit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 glass-card border-purple-500/30 hover:border-purple-400/50 shadow-2xl hover-glow bg-gradient-to-r from-purple-600 to-blue-600 text-white h-14 w-14 rounded-full p-0"
      >
        <DollarSign className="h-6 w-6" />
      </Button>

      {/* Pricing Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="glass-card border-white/10 shadow-2xl max-w-md w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-white flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-green-400" />
                Investment Plans
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {pricingTiers.map((tier, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 glass-light rounded-lg hover:bg-white/10 transition-all cursor-pointer ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => handleDeposit(tier)}
                >
                  <div>
                    <p className="text-white font-semibold">${tier.deposit} Deposit</p>
                    <p className="text-gray-400 text-sm">Get ${tier.receive}</p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    +{tier.roi}% ROI
                  </Badge>
                </div>
              ))}
              <div className="mt-4 p-3 glass-light rounded-lg">
                <p className="text-xs text-gray-400 text-center">
                  One-time credit on deposit. Service fees apply on withdrawal.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default FloatingPricingButton;
