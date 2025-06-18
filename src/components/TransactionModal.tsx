
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface TransactionModalProps {
  type: 'send' | 'receive' | 'deposit' | 'withdraw';
  onClose: () => void;
  onConfirm: (type: string, amount: number, recipient?: string) => void;
}

const TransactionModal = ({ type, onClose, onConfirm }: TransactionModalProps) => {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const getTitle = () => {
    switch (type) {
      case 'send': return 'Send Money';
      case 'receive': return 'Receive Money';
      case 'deposit': return 'Deposit Funds';
      case 'withdraw': return 'Withdraw Funds';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'send': return 'Send money to another wallet';
      case 'receive': return 'Generate QR code or share details';
      case 'deposit': return 'Add funds to your wallet';
      case 'withdraw': return 'Transfer funds to your bank';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      onConfirm(type, numAmount, recipient);
    }
  };

  const generateReceiveCode = () => {
    return Math.random().toString(36).substring(2, 15).toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl text-gray-800">{getTitle()}</CardTitle>
            <p className="text-gray-600 text-sm mt-1">{getDescription()}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X size={16} />
          </Button>
        </CardHeader>
        
        <CardContent>
          {type === 'receive' ? (
            <div className="text-center space-y-4">
              <div className="w-32 h-32 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center">
                <div className="text-4xl">📱</div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Your receive code:</p>
                <div className="bg-blue-50 p-3 rounded-xl">
                  <p className="font-mono text-lg font-semibold text-blue-700">
                    {generateReceiveCode()}
                  </p>
                </div>
              </div>
              <Button 
                onClick={onClose}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl"
              >
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-12 border-gray-200 focus:border-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
              
              {type === 'send' && (
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Email or Code</Label>
                  <Input
                    id="recipient"
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="h-12 border-gray-200 focus:border-blue-500"
                    placeholder="email@example.com or ABC123"
                    required
                  />
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl"
                >
                  Confirm
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionModal;
