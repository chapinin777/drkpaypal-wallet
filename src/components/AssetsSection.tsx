
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  TrendingUp, 
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AssetManagement from './AssetManagement';

interface Wallet {
  id: string;
  balance: number;
  available_balance: number;
  currency: {
    code: string;
    name: string;
    symbol: string;
  };
}

interface AssetsSectionProps {
  refreshKey?: number;
}

const AssetsSection = ({ refreshKey }: AssetsSectionProps) => {
  const [assets, setAssets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const fetchAssets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user's wallets with currency info
      const { data: wallets, error: walletsError } = await supabase
        .from('wallets')
        .select(`
          id,
          balance,
          available_balance,
          currency:currencies(code, name, symbol)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (walletsError) throw walletsError;

      // Get user preferred assets
      const { data: preferredAssets } = await supabase
        .from('user_preferred_assets')
        .select('currency_id, is_visible')
        .eq('user_id', user.id);

      // Filter wallets based on preferences
      const visibleAssets = wallets?.filter(wallet => {
        const preference = preferredAssets?.find(p => p.currency_id === wallet.currency?.id);
        return preference ? preference.is_visible : true; // Default to visible
      }) || [];

      setAssets(visibleAssets as Wallet[]);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [refreshKey]);

  if (loading) {
    return (
      <Card className="glass-card border-white/10 shadow-2xl">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 glass-light rounded w-3/4 shimmer"></div>
            <div className="h-4 glass-light rounded w-1/2 shimmer"></div>
            <div className="h-4 glass-light rounded w-2/3 shimmer"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showSettings) {
    return <AssetManagement />;
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card border-white/10 shadow-2xl hover-glow">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            <Wallet className="mr-2 h-5 w-5 text-purple-400" />
            Your Assets
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="text-gray-400 hover:text-white"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {assets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No assets found</p>
              <p className="text-sm text-gray-500 mt-2">
                Configure your asset preferences to see your balances
              </p>
            </div>
          ) : (
            assets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between p-4 glass-light rounded-xl hover:bg-white/10 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {asset.currency?.symbol || asset.currency?.code?.substring(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">
                      {asset.currency?.name || 'Unknown Currency'}
                    </h3>
                    <p className="text-gray-400 text-sm">{asset.currency?.code}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-white font-bold text-lg">
                    ${Number(asset.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +2.3%
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetsSection;
