
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface PayPalDepositButtonProps {
  amount: number;
  onSuccess?: () => void;
}

const PayPalDepositButton = ({ amount, onSuccess }: PayPalDepositButtonProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  const handlePayPalDeposit = async () => {
    if (!user || !amount || amount <= 0) return;

    // Alert desktop users about popup requirements
    if (!isMobile) {
      const userConfirmed = window.confirm(
        "This will open a PayPal payment window. Please make sure to allow popups for this site in your browser settings."
      );
      if (!userConfirmed) return;
    }

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
        if (isMobile) {
          // On mobile, redirect to PayPal instead of opening popup
          window.location.href = data.approvalUrl;
        } else {
          // On desktop, open PayPal in a new window
          const paypalWindow = window.open(data.approvalUrl, '_blank', 'width=500,height=600');
          
          if (!paypalWindow) {
            toast({
              variant: "destructive",
              title: "Popup Blocked",
              description: "Please allow popups for this site and try again.",
            });
            return;
          }
        }
        
        toast({
          title: "PayPal Payment",
          description: isMobile 
            ? "You will be redirected to PayPal to complete your payment."
            : "Complete your payment in the PayPal window that opened.",
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
