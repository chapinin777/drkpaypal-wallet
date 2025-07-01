
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, X, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
      // Simulate one-time deposit credit
      toast({
        title: "Deposit Successful!",
        description: `$${tier.receive} has been credited to your account`,
        variant: "default"
      });
      setIsOpen(false);
    } catch (error) {
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
