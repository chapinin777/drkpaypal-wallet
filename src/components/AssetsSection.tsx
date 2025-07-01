
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, DollarSign, Bitcoin, Wallet, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AssetManagement from './AssetManagement';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  value: number;
  change24h: number;
  price: number;
  wallet_address?: string;
}

const AssetsSection = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      // Fetch user's wallets with preferred assets
      const { data: walletsData, error: walletsError } = await supabase
        .from('wallets')
        .select(`
          *,
          currency:currencies(*),
          user_preferred_assets!inner(is_visible)
        `)
        .eq('is_active', true)
        .eq('user_preferred_assets.is_visible', true);

      if (walletsError) throw walletsError;

      // Transform wallet data to assets format
      const transformedAssets: Asset[] = (walletsData || []).map(wallet => ({
        id: wallet.id,
        name: wallet.currency.name,
        symbol: wallet.currency.code,
        balance: wallet.balance,
        value: wallet.balance, // For simplicity, assuming 1:1 for USD
        change24h: wallet.currency.code === 'USD' ? 0 : Math.random() * 10 - 5, // Mock data
        price: wallet.currency.code === 'USD' ? 1 : 
               wallet.currency.code === 'BTC' ? 100000 : 4000,
        wallet_address: wallet.wallet_address
      }));

      setAssets(transformedAssets);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      // Fallback to mock data
      const mockAssets: Asset[] = [
        {
          id: '1',
          name: 'US Dollar',
          symbol: 'USD',
          balance: 1250.00,
          value: 1250.00,
          change24h: 0,
          price: 1.00,
          wallet_address: '0x742d35Cc6634C0532925a3b8d76c3E'
        },
        {
          id: '2',
          name: 'Bitcoin',
          symbol: 'BTC',
          balance: 0.0234,
          value: 2340.50,
          change24h: 2.4,
          price: 100000,
          wallet_address: '0x8f3c7E9a4d6B2c1A5e8F9d2C3b4A6E7'
        }
      ];
      setAssets(mockAssets);
    } finally {
      setLoading(false);
    }
  };

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  if (loading) {
    return (
      <Card className="glass-card border-white/10 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            <Wallet className="mr-2 h-5 w-5 text-purple-400" />
            Assets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 glass-light rounded w-3/4 shimmer"></div>
            <div className="h-4 glass-light rounded w-1/2 shimmer"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showSettings) {
    return <AssetManagement />;
  }

  return (
    <Card className="glass-card border-white/10 shadow-2xl hover-glow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white flex items-center justify-between">
          <div className="flex items-center">
            <Wallet className="mr-2 h-5 w-5 text-purple-400" />
            Assets
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="text-white hover:bg-white/10"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <div className="text-right">
              <p className="text-sm text-gray-400">Total Value</p>
              <p className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                ${totalValue.toFixed(2)}
              </p>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {assets.map((asset, index) => (
            <div 
              key={asset.id}
              className={`flex items-center justify-between p-4 hover:bg-white/5 transition-all duration-300 cursor-pointer border-white/5 ${
                index !== assets.length - 1 ? 'border-b' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                  asset.symbol === 'USD' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                  asset.symbol === 'BTC' ? 'bg-gradient-to-br from-orange-500 to-yellow-600' :
                  'bg-gradient-to-br from-blue-500 to-indigo-600'
                }`}>
                  {asset.symbol === 'USD' ? <DollarSign className="h-6 w-6 text-white" /> :
                   asset.symbol === 'BTC' ? <Bitcoin className="h-6 w-6 text-white" /> :
                   <span className="text-white font-bold text-sm">{asset.symbol}</span>}
                </div>
                <div>
                  <p className="text-white font-medium">{asset.name}</p>
                  <p className="text-gray-400 text-sm font-mono">{asset.balance} {asset.symbol}</p>
                  {asset.wallet_address && (
                    <p className="text-gray-500 text-xs font-mono">
                      {asset.wallet_address.slice(0, 10)}...
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">${asset.value.toFixed(2)}</p>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-400 text-sm">${asset.price.toLocaleString()}</p>
                  {asset.change24h !== 0 && (
                    <Badge 
                      variant={asset.change24h > 0 ? "default" : "destructive"}
                      className={`text-xs ${
                        asset.change24h > 0 
                          ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                          : 'bg-red-500/20 text-red-300 border-red-500/30'
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
