
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { coinGeckoService } from '@/services/coingeckoApi';

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
}

const SwapSection = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrencies();
  }, []);

  useEffect(() => {
    if (fromCurrency && toCurrency && fromAmount) {
      calculateSwapAmount();
    }
  }, [fromCurrency, toCurrency, fromAmount]);

  const fetchCurrencies = async () => {
    const { data, error } = await supabase
      .from('currencies')
      .select('*')
      .eq('is_active', true);
    
    if (data && !error) {
      setCurrencies(data);
    }
  };

  const calculateSwapAmount = async () => {
    if (!fromCurrency || !toCurrency || !fromAmount) return;

    setIsLoadingRate(true);
    try {
      const fromCurrencyData = currencies.find(c => c.id === fromCurrency);
      const toCurrencyData = currencies.find(c => c.id === toCurrency);
      
      if (!fromCurrencyData || !toCurrencyData) return;

      // Get real-time exchange rate from CoinGecko
      const rate = await coinGeckoService.getExchangeRate(
        fromCurrencyData.code,
        toCurrencyData.code
      );
      
      const amount = parseFloat(fromAmount) * rate;
      setToAmount(amount.toFixed(8));
      setExchangeRate(rate);
    } catch (error) {
      console.error('Failed to get exchange rate:', error);
      toast({
        title: "Rate Fetch Failed",
        description: "Unable to get current exchange rate. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingRate(false);
    }
  };

  const handleSwap = async () => {
    if (!fromCurrency || !toCurrency || !fromAmount) {
      toast({
        title: "Missing Information",
        description: "Please select currencies and enter amount",
        variant: "destructive"
      });
      return;
    }

    setIsSwapping(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // ACID Transaction: Check and update balances atomically
      const { data: fromWallet } = await supabase
        .from('wallets')
        .select('id, balance')
        .eq('user_id', user.id)
        .eq('currency_id', fromCurrency)
        .single();

      if (!fromWallet) throw new Error('From wallet not found');

      const swapAmount = parseFloat(fromAmount);
      if (fromWallet.balance < swapAmount) {
        throw new Error('Insufficient balance');
      }

      // Get transaction type and status IDs
      const { data: swapType } = await supabase
        .from('transaction_types')
        .select('id')
        .eq('code', 'swap')
        .single();

      const { data: completedStatus } = await supabase
        .from('transaction_statuses')
        .select('id')
        .eq('code', 'completed')
        .single();

      // ACID Transaction: Update both wallets and create transaction record
      const { error: swapError } = await supabase.rpc('execute_swap_transaction', {
        p_user_id: user.id,
        p_from_currency_id: fromCurrency,
        p_to_currency_id: toCurrency,
        p_from_amount: swapAmount,
        p_to_amount: parseFloat(toAmount),
        p_exchange_rate: exchangeRate,
        p_transaction_type_id: swapType?.id,
        p_status_id: completedStatus?.id
      });

      if (swapError) throw swapError;

      toast({
        title: "Swap Successful",
        description: `Swapped ${fromAmount} to ${toAmount}`,
        variant: "default"
      });

      setFromAmount('');
      setToAmount('');
      setExchangeRate(0);
    } catch (error) {
      console.error('Swap failed:', error);
      toast({
        title: "Swap Failed",
        description: error instanceof Error ? error.message : "Unable to process swap. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const swapCurrencies = () => {
    const tempFrom = fromCurrency;
    const tempFromAmount = fromAmount;
    
    setFromCurrency(toCurrency);
    setToCurrency(tempFrom);
    setFromAmount(toAmount);
    setToAmount(tempFromAmount);
  };

  return (
    <Card className="glass-card border-white/10 shadow-2xl hover-glow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white flex items-center">
          <RefreshCw className="mr-2 h-5 w-5 text-blue-400" />
          Swap Assets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-white text-sm">From</label>
          <div className="flex space-x-2">
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="glass-light border-white/20 text-white">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/20">
                {currencies.map((currency) => (
                  <SelectItem key={currency.id} value={currency.id} className="text-white">
                    {currency.symbol} {currency.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="glass-light border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={swapCurrencies}
            className="text-white hover:bg-white/10 rounded-full"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-white text-sm">To</label>
          <div className="flex space-x-2">
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="glass-light border-white/20 text-white">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/20">
                {currencies.map((currency) => (
                  <SelectItem key={currency.id} value={currency.id} className="text-white">
                    {currency.symbol} {currency.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="0.00"
              value={toAmount}
              readOnly
              className="glass-light border-white/20 text-white bg-white/5"
            />
          </div>
        </div>

        {exchangeRate > 0 && (
          <div className="glass-light p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">
                Live Exchange Rate: 1 = {exchangeRate.toFixed(8)}
              </p>
              {isLoadingRate && (
                <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Powered by CoinGecko • Real-time rates
            </p>
          </div>
        )}

        <Button 
          onClick={handleSwap}
          disabled={isSwapping || !fromCurrency || !toCurrency || !fromAmount || isLoadingRate}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isSwapping ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing Swap...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Swap Now
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SwapSection;
