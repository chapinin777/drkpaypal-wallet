
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, QrCode, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import QRCodeDisplay from './QRCodeDisplay';

const SendReceiveSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sendAmount, setSendAmount] = useState('');
  const [sendRecipient, setSendRecipient] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  // Fetch user's wallet address
  useEffect(() => {
    const fetchWalletAddress = async () => {
      if (!user) return;
      
      try {
        const { data: usdCurrency } = await supabase
          .from('currencies')
          .select('id')
          .eq('code', 'USD')
          .single();

        const { data: wallet } = await supabase
          .from('wallets')
          .select('wallet_address')
          .eq('user_id', user.id)
          .eq('currency_id', usdCurrency.id)
          .single();

        if (wallet?.wallet_address) {
          setWalletAddress(wallet.wallet_address);
        }
      } catch (error) {
        console.error('Error fetching wallet address:', error);
      }
    };

    fetchWalletAddress();
  }, [user]);

  const handleSend = async () => {
    if (!sendAmount || !sendRecipient) {
      toast({
        title: "Missing Information",
        description: "Please enter both amount and recipient",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(sendAmount);
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get USD currency and user's wallet
      const { data: usdCurrency } = await supabase
        .from('currencies')
        .select('id')
        .eq('code', 'USD')
        .single();

      const { data: wallet } = await supabase
        .from('wallets')
        .select('id, balance')
        .eq('user_id', user.id)
        .eq('currency_id', usdCurrency.id)
        .single();

      if (!wallet) throw new Error('Wallet not found');

      // Check if user has sufficient balance
      if (wallet.balance < amount) {
        toast({
          title: "Insufficient Balance",
          description: "You don't have enough balance for this transaction",
          variant: "destructive"
        });
        return;
      }

      // Deduct amount from user's balance
      const { error: updateError } = await supabase
        .from('wallets')
        .update({
          balance: wallet.balance - amount,
          available_balance: wallet.balance - amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', wallet.id);

      if (updateError) throw updateError;

      // Create transaction record
      const { data: sendType } = await supabase
        .from('transaction_types')
        .select('id')
        .eq('code', 'send')
        .single();

      const { data: completedStatus } = await supabase
        .from('transaction_statuses')
        .select('id')
        .eq('code', 'completed')
        .single();

      await supabase
        .from('transactions')
        .insert({
          from_wallet_id: wallet.id,
          transaction_type_id: sendType?.id,
          status_id: completedStatus?.id,
          currency_id: usdCurrency.id,
          amount: amount,
          fee: 0,
          net_amount: amount,
          description: `Sent to ${sendRecipient}`,
          metadata: {
            recipient: sendRecipient,
            recipient_type: sendRecipient.includes('@') ? 'email' : 'wallet_id'
          }
        });
      
      toast({
        title: "Transaction Sent",
        description: `$${amount} sent successfully to ${sendRecipient}`,
        variant: "default"
      });
      
      setSendAmount('');
      setSendRecipient('');
    } catch (error) {
      console.error('Send transaction failed:', error);
      toast({
        title: "Transaction Failed",
        description: "Unable to process transaction. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard"
    });
  };

  return (
    <Card className="glass-card border-white/10 shadow-2xl hover-glow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">
          Send & Receive
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="send" className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass-light">
            <TabsTrigger value="send" className="text-white data-[state=active]:bg-purple-600">
              <Send className="h-4 w-4 mr-2" />
              Send
            </TabsTrigger>
            <TabsTrigger value="receive" className="text-white data-[state=active]:bg-purple-600">
              <QrCode className="h-4 w-4 mr-2" />
              Receive
            </TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="recipient" className="text-white">Recipient</Label>
              <Input
                id="recipient"
                placeholder="Email or wallet address"
                value={sendRecipient}
                onChange={(e) => setSendRecipient(e.target.value)}
                className="glass-light border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-white">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                className="glass-light border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            <Button 
              onClick={handleSend}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Transaction
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="receive" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="receiveAmount" className="text-white">Amount (Optional)</Label>
              <Input
                id="receiveAmount"
                type="number"
                placeholder="0.00"
                value={receiveAmount}
                onChange={(e) => setReceiveAmount(e.target.value)}
                className="glass-light border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            
            <div className="text-center space-y-4">
              <QRCodeDisplay 
                address={walletAddress} 
                amount={receiveAmount ? parseFloat(receiveAmount) : undefined}
              />
              
              <div className="glass-light p-3 rounded-lg">
                <p className="text-gray-400 text-sm mb-2">Your Wallet Address:</p>
                <div className="flex items-center space-x-2">
                  <code className="text-white text-sm font-mono bg-black/20 px-2 py-1 rounded flex-1">
                    {walletAddress}
                  </code>
                  <Button size="sm" variant="ghost" onClick={copyAddress}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SendReceiveSection;
