
import { Button } from '@/components/ui/button';
import { DollarSign } from 'lucide-react';

interface FloatingPricingButtonProps {
  onBalanceUpdate?: () => void;
  onOpenOfframp?: () => void;
}

const FloatingPricingButton = ({ onBalanceUpdate, onOpenOfframp }: FloatingPricingButtonProps) => {
  const handleAddBalance = () => {
    if (onOpenOfframp) {
      onOpenOfframp();
    }
  };

  return (
    <Button
      onClick={handleAddBalance}
      className="fixed bottom-6 left-6 z-50 glass-card border-purple-500/30 hover:border-purple-400/50 shadow-2xl hover-glow bg-gradient-to-r from-purple-600 to-blue-600 text-white h-14 w-14 rounded-full p-0"
    >
      <DollarSign className="h-6 w-6" />
    </Button>
  );
};

export default FloatingPricingButton;
