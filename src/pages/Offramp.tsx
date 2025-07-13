
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, CreditCard } from 'lucide-react';
import PayPalDepositButton from '@/components/PayPalDepositButton';

interface OfframpProps {
  onClose?: () => void;
}

const Offramp = ({ onClose }: OfframpProps) => {
  const [amount, setAmount] = useState('');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
      setAmount(value);
    }
  };

  const handleSuccess = () => {
    setAmount('');
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 2000);
  };

  return (
    <div className="min-h-[600px] mesh-bg p-6 rounded-lg relative">
      {/* Close Button */}
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:bg-white/10 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center fade-in-up">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Add Balance
          </h1>
          <p className="text-gray-300 mt-2">
            Securely add funds to your wallet using PayPal
          </p>
        </div>

        {/* PayPal Deposit Card */}
        <Card className="glass-card border-white/10 shadow-2xl hover-glow scale-in">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-blue-400" />
              PayPal Deposit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-gray-300">
                Amount (USD)
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={handleAmountChange}
                className="glass-card border-white/20 text-white placeholder-gray-400"
                min="1"
                step="0.01"
              />
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                <strong>PayPal Integration:</strong> Securely add funds to your wallet using PayPal. 
                Funds will be available immediately after successful payment.
              </p>
            </div>

            <PayPalDepositButton 
              amount={Number(amount)} 
              onSuccess={handleSuccess}
            />

            <div className="text-xs text-gray-500 text-center">
              <p>Secure payment processing via PayPal</p>
              <p>Funds are processed instantly upon successful payment</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Offramp;
