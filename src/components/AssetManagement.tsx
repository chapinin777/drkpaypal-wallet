
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Settings, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
}

interface UserPreferredAsset {
  id: string;
  currency_id: string;
  is_visible: boolean;
  currency?: Currency;
}

const AssetManagement = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [userAssets, setUserAssets] = useState<UserPreferredAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Fetch all currencies
      const { data: currenciesData, error: currenciesError } = await supabase
        .from('currencies')
        .select('*')
        .eq('is_active', true);

      if (currenciesError) throw currenciesError;

      // Fetch user preferences
      const { data: userAssetsData, error: userAssetsError } = await supabase
        .from('user_preferred_assets')
        .select(`
          *,
          currency:currencies(*)
        `)
        .eq('user_id', user.id);

      if (userAssetsError) throw userAssetsError;

      setCurrencies(currenciesData || []);
      setUserAssets(userAssetsData || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: "Error",
        description: "Failed to load asset preferences",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAssetVisibility = async (currencyId: string, currentVisibility: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const existingAsset = userAssets.find(asset => asset.currency_id === currencyId);

      if (existingAsset) {
        // Update existing preference
        const { error } = await supabase
          .from('user_preferred_assets')
          .update({ is_visible: !currentVisibility })
          .eq('id', existingAsset.id);

        if (error) throw error;
      } else {
        // Create new preference
        const { error } = await supabase
          .from('user_preferred_assets')
          .insert({
            user_id: user.id,
            currency_id: currencyId,
            is_visible: !currentVisibility
          });

        if (error) throw error;
      }

      await fetchData();
      toast({
        title: "Settings Updated",
        description: "Asset visibility preferences saved"
      });
    } catch (error) {
      console.error('Failed to update asset preference:', error);
      toast({
        title: "Error",
        description: "Failed to update asset preference",
        variant: "destructive"
      });
    }
  };

  const isAssetVisible = (currencyId: string) => {
    const asset = userAssets.find(asset => asset.currency_id === currencyId);
    return asset ? asset.is_visible : true; // Default to visible
  };

  if (loading) {
    return (
      <Card className="glass-card border-white/10 shadow-2xl">
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
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white flex items-center">
          <Settings className="mr-2 h-5 w-5 text-purple-400" />
          Asset Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-400 text-sm">
          Choose which assets to display in your portfolio
        </p>
        
        {currencies.map((currency) => (
          <div 
            key={currency.id}
            className="flex items-center justify-between p-3 glass-light rounded-lg hover:bg-white/10 transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">{currency.symbol}</span>
              </div>
              <div>
                <p className="text-white font-medium">{currency.name}</p>
                <p className="text-gray-400 text-sm">{currency.code}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isAssetVisible(currency.id) ? (
                <Eye className="h-4 w-4 text-green-400" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-400" />
              )}
              <Switch
                checked={isAssetVisible(currency.id)}
                onCheckedChange={() => toggleAssetVisibility(currency.id, isAssetVisible(currency.id))}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AssetManagement;
