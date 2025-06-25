
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { X, Send, ArrowDown, Plus, ArrowUp, User, Wallet, Mail, QrCode } from 'lucide-react';

interface EnhancedTransactionModalProps {
  type: 'send' | 'receive' | 'deposit' | 'withdraw';
  onClose: () => void;
  onConfirm: (type: string, amount: number, recipient?: string) => void;
}

const EnhancedTransactionModal = ({ type, onClose, onConfirm }: EnhancedTransactionModalProps) => {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [recipientType, setRecipientType] = useState<'email' | 'wallet'>('email');
  const [loading, setLoading] = useState(false);

  const getModalConfig = () => {
    switch (type) {
      case 'send':
        return {
          title: 'Send Money',
          icon: <Send className="h-6 w-6" />,
          gradient: 'stripe-gradient',
          buttonText: 'Send Money'
        };
      case 'receive':
        return {
          title: 'Receive Money',
          icon: <ArrowDown className="h-6 w-6" />,
          gradient: 'bg-gradient-to-br from-green-500 to-emerald-600',
          buttonText: 'Generate Request'
        };
      case 'deposit':
        return {
          title: 'Add Money',
          icon: <Plus className="h-6 w-6" />,
          gradient: 'bg-gradient-to-br from-purple-500 to-violet-600',
          buttonText: 'Add Money'
        };
      case 'withdraw':
        return {
          title: 'Withdraw Money',
          icon: <ArrowUp className="h-6 w-6" />,
          gradient: 'bg-gradient-to-br from-orange-500 to-red-600',
          buttonText: 'Withdraw Money'
        };
      default:
        return {
          title: 'Transaction',
          icon: <Wallet className="h-6 w-6" />,
          gradient: 'bg-gradient-to-br from-gray-500 to-gray-600',
          buttonText: 'Continue'
        };
    }
  };

  const config = getModalConfig();

  const validateRecipient = (value: string, type: 'email' | 'wallet') => {
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    } else {
      // Simple wallet ID validation (starts with '0x' and has 8+ characters)
      return value.startsWith('0x') && value.length >= 10;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
      });
      return;
    }

    if (type === 'send' && !recipient) {
      toast({
        variant: "destructive",
        title: "Recipient Required",
        description: "Please enter a recipient email or wallet ID.",
      });
      return;
    }

    if (type === 'send' && !validateRecipient(recipient, recipientType)) {
      toast({
        variant: "destructive",
        title: "Invalid Recipient",
        description: `Please enter a valid ${recipientType === 'email' ? 'email address' : 'wallet ID'}.`,
      });
      return;
    }

    setLoading(true);
    try {
      onConfirm(type, parseFloat(amount), recipient || undefined);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: "An error occurred while processing your transaction.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-strong border-white/20 shadow-2xl scale-in">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-white flex items-center">
              <div className={`w-12 h-12 rounded-xl ${config.gradient} flex items-center justify-center mr-3 shadow-lg`}>
                {config.icon}
              </div>
              {config.title}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-3">
              <Label htmlFor="amount" className="text-sm font-medium text-gray-300">
                Amount (USD)
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">$</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="glass border-white/20 text-white pl-10 focus:ring-purple-500 focus:border-purple-500 rounded-xl text-lg py-3"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Recipient Input (for send transactions) */}
            {type === 'send' && (
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-300">Send To</Label>
                
                {/* Recipient Type Selector */}
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant={recipientType === 'email' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRecipientType('email')}
                    className={`flex-1 rounded-xl ${recipientType === 'email' ? 'stripe-gradient' : 'glass border-white/20 hover:bg-white/10'}`}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button
                    type="button"
                    variant={recipientType === 'wallet' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRecipientType('wallet')}
                    className={`flex-1 rounded-xl ${recipientType === 'wallet' ? 'stripe-gradient' : 'glass border-white/20 hover:bg-white/10'}`}
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Wallet ID
                  </Button>
                </div>

                {/* Recipient Input */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    {recipientType === 'email' ? 
                      <Mail className="h-4 w-4 text-gray-400" /> : 
                      <Wallet className="h-4 w-4 text-gray-400" />
                    }
                  </div>
                  <Input
                    type={recipientType === 'email' ? 'email' : 'text'}
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="glass border-white/20 text-white pl-12 focus:ring-purple-500 focus:border-purple-500 rounded-xl py-3"
                    placeholder={recipientType === 'email' ? 'user@example.com' : '0x742d35A8f...'}
                  />
                </div>
                
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Badge variant="outline" className="text-gray-400 border-white/20">
                    <User className="h-3 w-3 mr-1" />
                    Platform transactions only
                  </Badge>
                </div>
              </div>
            )}

            {/* Receive Information */}
            {type === 'receive' && (
              <div className="glass-light rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Your Wallet ID:</span>
                  <Badge variant="outline" className="text-gray-300 border-white/20 font-mono">
                    0x742d35A8f
                  </Badge>
                </div>
                <div className="flex items-center justify-center py-6">
                  <div className="bg-white p-6 rounded-xl">
                    <QrCode className="h-20 w-20 text-gray-800" />
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  Share this QR code or wallet ID to receive payments
                </p>
              </div>
            )}

            {/* Action Button */}
            <Button
              type="submit"
              disabled={loading}
              className={`w-full ${config.gradient} hover:opacity-90 text-white rounded-xl py-3 font-medium text-base shadow-lg`}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Processing...</span>
                </div>
              ) : (
                config.buttonText
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTransactionModal;
