import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, DollarSign, TrendingUp, Clock, Zap, Shield, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface ServiceFee {
  id: string;
  fee_amount: number;
  account_balance: number;
  roi_percentage: number;
}

interface PlanSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlanSelected?: () => void;
}

const predefinedRates = [
  { fee: 20, balance: 380 },
  { fee: 25, balance: 475 },
  { fee: 30, balance: 570 },
  { fee: 50, balance: 950 },
  { fee: 100, balance: 1900 },
  { fee: 200, balance: 3800 },
  { fee: 500, balance: 9500 },
  { fee: 1000, balance: 19000 },
  { fee: 5000, balance: 95000 },
  { fee: 10000, balance: 190000 },
];

export default function PlanSelectionModal({ open, onOpenChange, onPlanSelected }: PlanSelectionModalProps) {
  const [plans, setPlans] = useState<ServiceFee[]>([]);
  const [loading, setLoading] = useState(false);
  const [depositing, setDepositing] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (open) {
      fetchPlans();
    }
  }, [open]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('service_fees')
        .select('*')
        .eq('is_active', true)
        .order('fee_amount', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Error",
        description: "Failed to load plans. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInstantDeposit = async (amount: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a deposit.",
        variant: "destructive",
      });
      return;
    }

    setDepositing(amount);
    try {
      // Get USD currency and user wallet
      const { data: currencies } = await supabase
        .from('currencies')
        .select('id')
        .eq('code', 'USD')
        .single();

      if (!currencies) throw new Error('USD currency not found');

      const { data: wallets } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', user.id)
        .eq('currency_id', currencies.id)
        .single();

      if (!wallets) throw new Error('Wallet not found');

      // Get transaction types and statuses
      const { data: depositType } = await supabase
        .from('transaction_types')
        .select('id')
        .eq('code', 'deposit')
        .single();

      const { data: completedStatus } = await supabase
        .from('transaction_statuses')
        .select('id')
        .eq('code', 'completed')
        .single();

      // Update wallet balance
      await supabase
        .from('wallets')
        .update({ balance: amount })
        .eq('id', wallets.id);

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          to_wallet_id: wallets.id,
          transaction_type_id: depositType.id,
          status_id: completedStatus.id,
          currency_id: currencies.id,
          amount: amount,
          net_amount: amount,
          fee: 0,
          description: `Instant deposit of $${amount}`,
          metadata: { instant_deposit: true }
        });

      toast({
        title: "Deposit Successful!",
        description: `$${amount} has been added to your wallet instantly.`,
      });

      onPlanSelected?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error making instant deposit:', error);
      toast({
        title: "Deposit Failed",
        description: error.message || "Failed to make deposit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDepositing(null);
    }
  };

  const handleCustomDeposit = () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }
    handleInstantDeposit(amount);
  };

  const getBadgeStyle = (fee: number) => {
    if (fee <= 100) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    if (fee <= 1000) return 'bg-gradient-to-r from-purple-500 to-pink-500';
    return 'bg-gradient-to-r from-amber-500 to-orange-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Rates We Offer 🔥🔥
          </DialogTitle>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4 text-green-500" />
              <span>High-reward ratio</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4 text-blue-500" />
              <span>Capital protected</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-orange-500" />
              <span>Limited availability</span>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-6">
          {predefinedRates.map((rate) => (
            <Card 
              key={rate.fee} 
              className="relative hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50 cursor-pointer group"
              onClick={() => handleInstantDeposit(rate.balance)}
            >
              <CardContent className="p-4 text-center">
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold text-white mb-2 ${getBadgeStyle(rate.fee)}`}>
                  ${rate.fee} Fee
                </div>
                <div className="text-lg font-bold text-foreground">${rate.balance.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Instant Deposit</div>
                
                {depositing === rate.balance && (
                  <div className="absolute inset-0 bg-primary/10 rounded-lg flex items-center justify-center">
                    <div className="text-sm font-medium">Depositing...</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Custom Amount</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCustom(!showCustom)}
            >
              {showCustom ? 'Hide' : 'Show'}
            </Button>
          </div>
          
          {showCustom && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="custom-amount" className="sr-only">Custom Amount</Label>
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder="Enter amount..."
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="text-center"
                  />
                </div>
                <Button 
                  onClick={handleCustomDeposit}
                  disabled={!customAmount || depositing !== null}
                  className="px-6"
                >
                  Deposit
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Custom deposits require withdrawal fees based on balance ranges
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-semibold mb-2 text-center">🛡 Secure & Transparent</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium mb-1">How it works:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Click any rate to deposit instantly</li>
                <li>• Funds available immediately</li>
                <li>• Withdraw anytime with service fee</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">Withdrawal Fees:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Based on your current balance</li>
                <li>• Ranges from $20 to $10,000</li>
                <li>• Secure and protected</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}