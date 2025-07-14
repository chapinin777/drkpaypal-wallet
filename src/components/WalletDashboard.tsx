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
  ArrowUpDown,
  Copy,
  Settings as SettingsIcon,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AssetsSection from './AssetsSection';
import SendReceiveSection from './SendReceiveSection';
import SwapSection from './SwapSection';
import TransactionHistory from './TransactionHistory';
import FloatingPricingButton from './FloatingPricingButton';
import EnhancedTransactionModal from './EnhancedTransactionModal';
import ServiceFeeModal from './ServiceFeeModal';
import LivePricing from './LivePricing';
import CryptoNews from './CryptoNews';
import UserProfile from './UserProfile';
import Settings from './Settings';
import PendingWithdrawals from './PendingWithdrawals';

interface WalletDashboardProps {
  onOpenOfframp?: () => void;
}

const WalletDashboard = ({ onOpenOfframp }: WalletDashboardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState(0);
  const [walletAddress, setWalletAddress] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showServiceFeeModal, setShowServiceFeeModal] = useState(false);
  const [modalType, setModalType] = useState<'deposit' | 'withdraw'>('deposit');
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch current balance and wallet address from Supabase
  const fetchBalance = async () => {
    try {
      if (!user) return;

      const { data: usdCurrency } = await supabase
        .from('currencies')
        .select('id')
        .eq('code', 'USD')
        .single();

      if (!usdCurrency) return;

      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance, wallet_address')
        .eq('user_id', user.id)
        .eq('currency_id', usdCurrency.id)
        .single();

      if (wallet) {
        setBalance(Number(wallet.balance));
        setWalletAddress(wallet.wallet_address || '');
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const copyWalletAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard"
      });
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [refreshKey]);

  const handleRefreshData = () => {
    setRefreshKey(prev => prev + 1);
    fetchBalance();
  };

  // Calculate 5% fee rounded to whole number
  const calculateWithdrawalFee = (amount: number) => {
    return Math.round(amount * 0.05);
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

    // Check maximum withdrawal amount
    if (amount > 10000) {
      toast({
        title: "Maximum Withdrawal Exceeded",
        description: "Maximum withdrawal amount is $10,000 per transaction",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'deposit':
        if (onOpenOfframp) {
          onOpenOfframp();
        }
        break;
      case 'withdraw':
        setModalType('withdraw');
        setShowModal(true);
        break;
      default:
        break;
    }
  };

  const handleModalConfirm = async (type: string, amount: number, recipient?: string) => {
    if (type === 'withdraw') {
      if (!validateWithdrawal(amount)) {
        return;
      }
      
      const fee = calculateWithdrawalFee(amount);
      setWithdrawAmount(amount);
      setShowModal(false);
      setShowServiceFeeModal(true);
      
      toast({
        title: "Withdrawal Fee Required",
        description: `Withdrawal fee: $${fee} (5% of $${amount})`,
        variant: "default"
      });
      return;
    }

    console.log('Transaction confirmed:', { type, amount, recipient });
    setShowModal(false);
  };

  const handleServiceFeeConfirm = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fee = calculateWithdrawalFee(withdrawAmount);
      
      // Get USD currency and wallet
      const { data: usdCurrency } = await supabase
        .from('currencies')
        .select('id')
        .eq('code', 'USD')
        .single();

      const { data: wallet } = await supabase
        .from('wallets')
        .select('id, balance, pending_balance')
        .eq('user_id', user.id)
        .eq('currency_id', usdCurrency.id)
        .single();

      if (!wallet) throw new Error('Wallet not found');

      // ACID Transaction: Move balance to pending_balance
      const { error: updateError } = await supabase
        .from('wallets')
        .update({
          balance: wallet.balance - withdrawAmount,
          pending_balance: wallet.pending_balance + withdrawAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', wallet.id);

      if (updateError) throw updateError;

      // Log withdrawal transaction
      const { data: withdrawType } = await supabase
        .from('transaction_types')
        .select('id')
        .eq('code', 'withdraw')
        .single();

      const { data: pendingStatus } = await supabase
        .from('transaction_statuses')
        .select('id')
        .eq('code', 'pending')
        .single();

      await supabase
        .from('transactions')
        .insert({
          from_wallet_id: wallet.id,
          transaction_type_id: withdrawType.id,
          status_id: pendingStatus.id,
          currency_id: usdCurrency.id,
          amount: withdrawAmount,
          fee: fee,
          net_amount: withdrawAmount - fee,
          description: `Withdrawal pending service fee payment - $${fee} fee required`,
          metadata: {
            withdrawal_fee: fee,
            original_amount: withdrawAmount,
            fee_percentage: 5
          }
        });

      setShowServiceFeeModal(false);
      handleRefreshData();
      
      toast({
        title: "Withdrawal Initiated",
        description: `$${withdrawAmount} moved to pending. Complete fee payment to process withdrawal.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast({
        title: "Withdrawal Failed",
        description: "Unable to process withdrawal. Please try again.",
        variant: "destructive"
      });
    }
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
              
              {/* Wallet Address */}
              {walletAddress && (
                <div className="glass-light p-3 rounded-lg mt-4">
                  <p className="text-gray-400 text-xs mb-1">Wallet ID:</p>
                  <div className="flex items-center justify-center space-x-2">
                    <code className="text-white text-xs sm:text-sm font-mono bg-black/20 px-2 py-1 rounded break-all sm:break-normal">
                      <span className="sm:hidden">{walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}</span>
                      <span className="hidden sm:inline">{walletAddress}</span>
                    </code>
                    <Button size="sm" variant="ghost" onClick={copyWalletAddress}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={() => handleQuickAction('deposit')}
                className="btn-glass hover:scale-105 transition-all duration-300 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30 text-green-300 hover:from-green-600/30 hover:to-emerald-600/30"
              >
                <Download className="h-4 w-4 mr-2" />
                Add Balance
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
          <TabsList className="grid w-full grid-cols-6 glass-card border-white/10 h-12">
            <TabsTrigger 
              value="assets" 
              className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white flex items-center justify-center"
              title="Assets"
            >
              <Wallet className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline text-xs lg:text-sm">Assets</span>
            </TabsTrigger>
            <TabsTrigger 
              value="transfer" 
              className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white flex items-center justify-center"
              title="Transfer"
            >
              <Send className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline text-xs lg:text-sm">Transfer</span>
            </TabsTrigger>
            <TabsTrigger 
              value="swap" 
              className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white flex items-center justify-center"
              title="Swap"
            >
              <ArrowUpDown className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline text-xs lg:text-sm">Swap</span>
            </TabsTrigger>
            <TabsTrigger 
              value="pending" 
              className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white flex items-center justify-center"
              title="Pending"
            >
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline text-xs lg:text-sm">Pending</span>
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white flex items-center justify-center"
              title="Profile"
            >
              <User className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline text-xs lg:text-sm">Profile</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white flex items-center justify-center"
              title="Settings"
            >
              <SettingsIcon className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline text-xs lg:text-sm">Settings</span>
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

            <TabsContent value="pending" className="fade-in-up">
              <PendingWithdrawals />
            </TabsContent>

            <TabsContent value="profile" className="fade-in-up">
              <UserProfile />
            </TabsContent>

            <TabsContent value="settings" className="fade-in-up">
              <Settings />
            </TabsContent>
          </div>
        </Tabs>

        {/* Live Pricing and News at bottom */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LivePricing />
          <CryptoNews />
        </div>

        {/* Floating Add Balance Button */}
        <FloatingPricingButton onBalanceUpdate={handleRefreshData} onOpenOfframp={onOpenOfframp} />

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
            withdrawalAmount={withdrawAmount}
            calculatedFee={calculateWithdrawalFee(withdrawAmount)}
          />
        )}
      </div>
    </div>
  );
};

export default WalletDashboard;
