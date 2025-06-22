
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Send, ArrowDown, Plus } from 'lucide-react';
import PayPalDepositButton from './PayPalDepositButton';

interface TransactionModalProps {
  type: 'send' | 'receive' | 'deposit' | 'withdraw';
  onClose: () => void;
  onConfirm: (type: string, amount: number, recipient?: string) => void;
}

const TransactionModal = ({ type, onClose, onConfirm }: TransactionModalProps) => {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const handleConfirm = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      onConfirm(type, numAmount, recipient || undefined);
    }
  };

  const getModalTitle = () => {
    switch (type) {
      case 'send': return 'Send Money';
      case 'receive': return 'Request Money';
      case 'deposit': return 'Add Money';
      case 'withdraw': return 'Withdraw Money';
      default: return 'Transaction';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'send': return <Send className="h-6 w-6" />;
      case 'receive': return <ArrowDown className="h-6 w-6" />;
      case 'deposit': return <Plus className="h-6 w-6" />;
      case 'withdraw': return <ArrowDown className="h-6 w-6" />;
      default: return <Send className="h-6 w-6" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              {getIcon()}
            </div>
            <h2 className="text-xl font-semibold text-white">{getModalTitle()}</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="amount" className="text-gray-300">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {(type === 'send' || type === 'receive') && (
            <div>
              <Label htmlFor="recipient" className="text-gray-300">
                {type === 'send' ? 'Send to' : 'Request from'}
              </Label>
              <Input
                id="recipient"
                type="email"
                placeholder="email@example.com"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            {type === 'deposit' ? (
              <PayPalDepositButton
                amount={parseFloat(amount) || 0}
                onSuccess={onClose}
              />
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Confirm {getModalTitle()}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
