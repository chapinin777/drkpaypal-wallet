
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface PayPalDepositButtonProps {
  amount: number;
  onSuccess?: () => void;
}

const PayPalDepositButton = ({ amount, onSuccess }: PayPalDepositButtonProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayPalDeposit = async () => {
    if (!user || !amount || amount <= 0) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('paypal-deposit', {
        body: {
          amount: amount,
          userId: user.id,
        },
      });

      if (error) throw error;

      if (data.success && data.approvalUrl) {
        // Open PayPal in a new window
        window.open(data.approvalUrl, '_blank', 'width=500,height=600');
        
        toast({
          title: "PayPal Payment",
          description: "Complete your payment in the PayPal window that opened.",
        });

        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error('Failed to create PayPal order');
      }

    } catch (error: any) {
      console.error('PayPal deposit error:', error);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error.message || "Failed to process PayPal payment",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayPalDeposit}
      disabled={isLoading || !amount || amount <= 0}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        'Pay with PayPal'
      )}
    </Button>
  );
};

export default PayPalDepositButton;
