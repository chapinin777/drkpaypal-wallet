import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, DollarSign, TrendingUp, Clock } from 'lucide-react';
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

export default function PlanSelectionModal({ open, onOpenChange, onPlanSelected }: PlanSelectionModalProps) {
  const [plans, setPlans] = useState<ServiceFee[]>([]);
  const [loading, setLoading] = useState(false);
  const [subscribing, setSubscribing] = useState<string | null>(null);
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

  const handleSubscribeToPlan = async (serviceFeeId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to a plan.",
        variant: "destructive",
      });
      return;
    }

    setSubscribing(serviceFeeId);
    try {
      const { data, error } = await supabase.functions.invoke('subscribe-to-plan', {
        body: { serviceFeeId }
      });

      if (error) throw error;

      toast({
        title: "Plan Activated!",
        description: data.message,
      });

      onPlanSelected?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to subscribe to plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubscribing(null);
    }
  };

  const getPlanTier = (feeAmount: number) => {
    if (feeAmount <= 25) return { name: 'Basic', color: 'bg-blue-500' };
    if (feeAmount <= 100) return { name: 'Standard', color: 'bg-purple-500' };
    if (feeAmount <= 1000) return { name: 'Premium', color: 'bg-gold-500' };
    return { name: 'Elite', color: 'bg-gradient-to-r from-gold-500 to-amber-500' };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">
            Choose Your Investment Plan
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            Select a plan to start earning daily returns. Your first deposit happens immediately, 
            then automatically every 24 hours.
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {plans.map((plan) => {
            const tier = getPlanTier(plan.fee_amount);
            const dailyReturn = (plan.account_balance * (plan.roi_percentage / 100)) / 365;
            
            return (
              <Card key={plan.id} className="relative hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">${plan.fee_amount}</CardTitle>
                    <Badge className={`${tier.color} text-white`}>
                      {tier.name}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Initial Deposit: <strong>${plan.account_balance}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Daily Return: <strong>${dailyReturn.toFixed(2)}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">ROI: <strong>{plan.roi_percentage}%</strong></span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={() => handleSubscribeToPlan(plan.id)}
                      disabled={subscribing === plan.id}
                      className="w-full"
                    >
                      {subscribing === plan.id ? (
                        "Activating..."
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Subscribe Now
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground text-center">
                    Auto-deposits every 24 hours
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2">How it works:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Choose your plan and pay the subscription fee</li>
            <li>• Receive your first deposit immediately</li>
            <li>• Earn daily returns from your deposit balance</li>
            <li>• Automatic deposits every 24 hours</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}