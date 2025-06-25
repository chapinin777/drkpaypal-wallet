
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Bitcoin, Wallet } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  value: number;
  change24h: number;
  price: number;
}

const AssetsSection = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate real-time market data
    const fetchMarketData = () => {
      const mockAssets: Asset[] = [
        {
          id: '1',
          name: 'US Dollar',
          symbol: 'USD',
          balance: 1250.00,
          value: 1250.00,
          change24h: 0,
          price: 1.00
        },
        {
          id: '2',
          name: 'Bitcoin',
          symbol: 'BTC',
          balance: 0.0234,
          value: 2340.50,
          change24h: 2.4,
          price: 100000
        },
        {
          id: '3',
          name: 'Ethereum',
          symbol: 'ETH',
          balance: 0.87,
          value: 3480.00,
          change24h: -1.2,
          price: 4000
        }
      ];
      setAssets(mockAssets);
      setLoading(false);
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            <Wallet className="mr-2 h-5 w-5" />
            Assets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white flex items-center justify-between">
          <div className="flex items-center">
            <Wallet className="mr-2 h-5 w-5" />
            Assets
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Total Value</p>
            <p className="text-lg font-bold text-white">${totalValue.toFixed(2)}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {assets.map((asset, index) => (
            <div 
              key={asset.id}
              className={`flex items-center justify-between p-4 hover:bg-gray-700/50 transition-colors cursor-pointer ${
                index !== assets.length - 1 ? 'border-b border-gray-700' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  {asset.symbol === 'USD' ? <DollarSign className="h-5 w-5 text-white" /> :
                   asset.symbol === 'BTC' ? <Bitcoin className="h-5 w-5 text-white" /> :
                   <span className="text-white font-bold text-xs">{asset.symbol}</span>}
                </div>
                <div>
                  <p className="text-white font-medium">{asset.name}</p>
                  <p className="text-gray-400 text-sm">{asset.balance} {asset.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">${asset.value.toFixed(2)}</p>
                <div className="flex items-center space-x-1">
                  <p className="text-gray-400 text-sm">${asset.price.toLocaleString()}</p>
                  {asset.change24h !== 0 && (
                    <Badge 
                      variant={asset.change24h > 0 ? "default" : "destructive"}
                      className={`text-xs ${
                        asset.change24h > 0 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {asset.change24h > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {Math.abs(asset.change24h)}%
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssetsSection;
