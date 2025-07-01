
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, 
  CreditCard, 
  Send, 
  Download, 
  TrendingUp,
  RefreshCw,
  ArrowUpDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AssetsSection from './AssetsSection';
import SendReceiveSection from './SendReceiveSection';
import SwapSection from './SwapSection';
import TransactionHistory from './TransactionHistory';
import FloatingPricingButton from './FloatingPricingButton';
import EnhancedTransactionModal from './EnhancedTransactionModal';
import ServiceFeeModal from './ServiceFeeModal';

const WalletDashboard = () => {
  const [balance, setBalance] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showServiceFeeModal, setShowServiceFeeModal] = useState(false);
  const [modalType, setModalType] = useState<'deposit' | 'withdraw'>('deposit');
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  // Fetch current balance
  const fetchBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: usdCurrency } = await supabase
        .from('currencies')
        .select('id')
        .eq('code', 'USD')
        .single();

      if (!usdCurrency) return;

      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .eq('currency_id', usdCurrency.id)
        .single();

      if (wallet) {
        setBalance(Number(wallet.balance));
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [refreshKey]);

  const handleRefreshData = () => {
    setRefreshKey(prev => prev + 1);
    fetchBalance();
  };

  const validateWithdrawal = (amount: number) => {
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive"
      });
      return false;
    }

    if (amount > balance) {
      toast({
        title: "Insufficient Balance",
        description: "Withdrawal amount exceeds available balance",
        variant: "destructive"
      });
      return false;
    }

    // Check minimum withdrawal amount
    if (amount < 10) {
      toast({
        title: "Minimum Withdrawal",
        description: "Minimum withdrawal amount is $10",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'deposit':
        setModalType('deposit');
        setShowModal(true);
        break;
      case 'withdraw':
        setModalType('withdraw');
        setShowModal(true);
        break;
      default:
        break;
    }
  };

  const handleModalConfirm = (type: string, amount: number, recipient?: string) => {
    if (type === 'withdraw') {
      if (!validateWithdrawal(amount)) {
        return;
      }
      
      setWithdrawAmount(amount);
      setShowModal(false);
      setShowServiceFeeModal(true);
      return;
    }

    console.log('Transaction confirmed:', { type, amount, recipient });
    setShowModal(false);
    toast({
      title: "Transaction Processed",
      description: `${type} of $${amount} has been processed`,
      variant: "default"
    });
  };

  const handleServiceFeeConfirm = () => {
    setShowServiceFeeModal(false);
    toast({
      title: "Service Fee Payment",
      description: "Please complete the service fee payment to process your withdrawal",
      variant: "default"
    });
  };

  return (
    <div className="min-h-screen mesh-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 fade-in-up">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Digital Wallet
          </h1>
          <p className="text-gray-400 text-lg">
            Manage your assets with confidence
          </p>
        </div>

        {/* Balance Card */}
        <Card className="glass-card border-white/10 shadow-2xl hover-glow scale-in">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-gray-400 text-sm font-normal flex items-center justify-center gap-2">
              Total Balance
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshData}
                className="text-gray-400 hover:text-white p-1 h-auto"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h2>
              <div className="flex items-center justify-center space-x-2 text-green-400">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">+12.5% this month</span>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={() => handleQuickAction('deposit')}
                className="btn-glass hover:scale-105 transition-all duration-300 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30 text-green-300 hover:from-green-600/30 hover:to-emerald-600/30"
              >
                <Download className="h-4 w-4 mr-2" />
                Deposit
              </Button>
              <Button 
                onClick={() => handleQuickAction('withdraw')}
                className="btn-glass hover:scale-105 transition-all duration-300 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/30 text-purple-300 hover:from-purple-600/30 hover:to-blue-600/30"
              >
                <Send className="h-4 w-4 mr-2" />
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="assets" className="w-full">
          <TabsList className="grid w-full grid-cols-4 glass-card border-white/10 h-12">
            <TabsTrigger 
              value="assets" 
              className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Assets
            </TabsTrigger>
            <TabsTrigger 
              value="transfer" 
              className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Transfer
            </TabsTrigger>
            <TabsTrigger 
              value="swap" 
              className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Swap
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="assets" className="fade-in-up">
              <AssetsSection refreshKey={refreshKey} />
            </TabsContent>

            <TabsContent value="transfer" className="fade-in-up">
              <SendReceiveSection />
            </TabsContent>

            <TabsContent value="swap" className="fade-in-up">
              <SwapSection />
            </TabsContent>

            <TabsContent value="history" className="fade-in-up">
              <TransactionHistory refreshKey={refreshKey} />
            </TabsContent>
          </div>
        </Tabs>

        {/* Floating Pricing Button */}
        <FloatingPricingButton onBalanceUpdate={handleRefreshData} />

        {/* Transaction Modal */}
        {showModal && (
          <EnhancedTransactionModal
            type={modalType}
            onClose={() => setShowModal(false)}
            onConfirm={handleModalConfirm}
          />
        )}

        {/* Service Fee Modal */}
        {showServiceFeeModal && (
          <ServiceFeeModal
            onClose={() => setShowServiceFeeModal(false)}
            onConfirm={handleServiceFeeConfirm}
            userBalance={balance}
          />
        )}
      </div>
    </div>
  );
};

export default WalletDashboard;
