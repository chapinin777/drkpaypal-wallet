
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
}

interface SwapPair {
  id: string;
  from_currency_id: string;
  to_currency_id: string;
  exchange_rate: number;
}

const SwapSection = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [swapPairs, setSwapPairs] = useState<SwapPair[]>([]);
  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(0);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrencies();
    fetchSwapPairs();
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

  const fetchSwapPairs = async () => {
    const { data, error } = await supabase
      .from('swap_pairs')
      .select('*')
      .eq('is_active', true);
    
    if (data && !error) {
      setSwapPairs(data);
    }
  };

  const calculateSwapAmount = () => {
    const pair = swapPairs.find(p => 
      p.from_currency_id === fromCurrency && p.to_currency_id === toCurrency
    );
    
    if (pair && fromAmount) {
      const amount = parseFloat(fromAmount) * pair.exchange_rate;
      setToAmount(amount.toFixed(8));
      setExchangeRate(pair.exchange_rate);
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

      // Add to transaction queue
      const { error } = await supabase
        .from('transaction_queue')
        .insert({
          user_id: user.id,
          transaction_type: 'swap',
          from_currency_id: fromCurrency,
          to_currency_id: toCurrency,
          amount: parseFloat(fromAmount),
          metadata: {
            exchange_rate: exchangeRate,
            to_amount: parseFloat(toAmount)
          }
        });

      if (error) throw error;

      toast({
        title: "Swap Initiated",
        description: `Swapping ${fromAmount} to ${toAmount}`,
        variant: "default"
      });

      setFromAmount('');
      setToAmount('');
    } catch (error) {
      console.error('Swap failed:', error);
      toast({
        title: "Swap Failed",
        description: "Unable to process swap. Please try again.",
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
            <p className="text-gray-400 text-sm">
              Exchange Rate: 1 = {exchangeRate.toFixed(8)}
            </p>
          </div>
        )}

        <Button 
          onClick={handleSwap}
          disabled={isSwapping || !fromCurrency || !toCurrency || !fromAmount}
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
