
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

const FloatingPricingButton = () => {
  const [isOpen, setIsOpen] = useState(false);
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get USD currency
      const { data: usdCurrency } = await supabase
        .from('currencies')
        .select('id')
        .eq('code', 'USD')
        .single();

      if (!usdCurrency) throw new Error('USD currency not found');

      // Get user's USD wallet
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id, balance')
        .eq('user_id', user.id)
        .eq('currency_id', usdCurrency.id)
        .single();

      if (!wallet) throw new Error('Wallet not found');

      // Update wallet balance
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ 
          balance: wallet.balance + tier.receive,
          available_balance: wallet.balance + tier.receive
        })
        .eq('id', wallet.id);

      if (updateError) throw updateError;

      // Add transaction record
      const { data: transactionType } = await supabase
        .from('transaction_types')
        .select('id')
        .eq('code', 'deposit')
        .single();

      const { data: statusCompleted } = await supabase
        .from('transaction_statuses')
        .select('id')
        .eq('code', 'completed')
        .single();

      if (transactionType && statusCompleted) {
        await supabase
          .from('transactions')
          .insert({
            to_wallet_id: wallet.id,
            transaction_type_id: transactionType.id,
            status_id: statusCompleted.id,
            currency_id: usdCurrency.id,
            amount: tier.receive,
            net_amount: tier.receive,
            fee: 0,
            description: `One-time credit deposit of $${tier.deposit}`,
            metadata: {
              pricing_tier: {
                deposit: tier.deposit,
                receive: tier.receive,
                roi: tier.roi
              }
            }
          });
      }

      toast({
        title: "Deposit Successful!",
        description: `$${tier.receive} has been credited to your account`,
        variant: "default"
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Deposit failed:', error);
      toast({
        title: "Deposit Failed",
        description: "Unable to process deposit. Please try again.",
        variant: "destructive"
      });
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
                  className="flex items-center justify-between p-3 glass-light rounded-lg hover:bg-white/10 transition-all cursor-pointer"
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
