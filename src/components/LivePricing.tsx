
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { coinGeckoService, CoinPrice } from '@/services/coingeckoApi';

const LivePricing = () => {
  const [prices, setPrices] = useState<CoinPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const priceData = await coinGeckoService.getCoinPrices(['bitcoin', 'ethereum', 'tether', 'binancecoin']);
      setPrices(priceData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch prices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    // Update prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && prices.length === 0) {
    return (
      <Card className="glass-card border-white/10">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 glass-light rounded w-3/4 shimmer"></div>
            <div className="h-4 glass-light rounded w-1/2 shimmer"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-white/10 shadow-2xl hover-glow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-white flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-green-400" />
          Live Crypto Prices
        </CardTitle>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <RefreshCw 
            className={`h-4 w-4 text-gray-400 cursor-pointer hover:text-white ${loading ? 'animate-spin' : ''}`}
            onClick={fetchPrices}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {prices.map((coin) => (
          <div
            key={coin.id}
            className="flex items-center justify-between p-4 glass-light rounded-xl hover:bg-white/10 transition-all"
          >
            <div className="flex items-center space-x-4">
              <img 
                src={coin.image} 
                alt={coin.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h3 className="text-white font-semibold">{coin.name}</h3>
                <p className="text-gray-400 text-sm">{coin.symbol}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-white font-bold text-lg">
                ${coin.current_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <Badge 
                className={`${
                  coin.price_change_percentage_24h >= 0 
                    ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                    : 'bg-red-500/20 text-red-300 border-red-500/30'
                }`}
              >
                {coin.price_change_percentage_24h >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default LivePricing;
