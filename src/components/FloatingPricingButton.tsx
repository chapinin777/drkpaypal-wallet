
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DollarSign, Plus } from 'lucide-react';
import PlanSelectionModal from './PlanSelectionModal';

interface FloatingPricingButtonProps {
  onBalanceUpdate?: () => void;
  onOpenOfframp?: () => void;
}

const FloatingPricingButton = ({ onBalanceUpdate, onOpenOfframp }: FloatingPricingButtonProps) => {
  const [showPlans, setShowPlans] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  const handlePlanSelected = () => {
    onBalanceUpdate?.();
    setShowButtons(false);
  };

  return (
    <>
      <div className="fixed bottom-6 left-6 z-50">
        {showButtons && (
          <div className="flex flex-col gap-3 mb-3">
            <Button
              onClick={() => setShowPlans(true)}
              className="glass-card border-green-500/30 hover:border-green-400/50 shadow-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white h-12 w-12 rounded-full p-0"
              title="Subscribe to Auto-Deposit Plan"
            >
              <DollarSign className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => {
                onOpenOfframp?.();
                setShowButtons(false);
              }}
              className="glass-card border-blue-500/30 hover:border-blue-400/50 shadow-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white h-12 w-12 rounded-full p-0"
              title="Manual Deposit"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        )}
        
        <Button
          onClick={() => setShowButtons(!showButtons)}
          className="glass-card border-purple-500/30 hover:border-purple-400/50 shadow-2xl hover-glow bg-gradient-to-r from-purple-600 to-blue-600 text-white h-14 w-14 rounded-full p-0"
        >
          <DollarSign className="h-6 w-6" />
        </Button>
      </div>

      <PlanSelectionModal 
        open={showPlans} 
        onOpenChange={setShowPlans}
        onPlanSelected={handlePlanSelected}
      />
    </>
  );
};

export default FloatingPricingButton;
