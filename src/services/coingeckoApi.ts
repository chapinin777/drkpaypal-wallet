
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

export interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  published_at: string;
  image_url?: string;
}

class CoinGeckoService {
  private async fetchApi(endpoint: string): Promise<any> {
    const response = await fetch(`${COINGECKO_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }
    return response.json();
  }

  async getCoinPrices(coinIds: string[] = ['bitcoin', 'ethereum', 'tether']): Promise<CoinPrice[]> {
    try {
      const data = await this.fetchApi(
        `/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}&order=market_cap_desc&sparkline=false`
      );
      return data.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        market_cap: coin.market_cap,
        total_volume: coin.total_volume,
        image: coin.image
      }));
    } catch (error) {
      console.error('Failed to fetch coin prices:', error);
      return [];
    }
  }

  async getExchangeRate(fromSymbol: string, toSymbol: string): Promise<number> {
    try {
      const coinMap: { [key: string]: string } = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'USDT': 'tether',
        'USD': 'usd'
      };

      const fromId = coinMap[fromSymbol.toUpperCase()];
      const toId = coinMap[toSymbol.toUpperCase()];

      if (fromSymbol.toUpperCase() === 'USD') {
        const data = await this.fetchApi(`/simple/price?ids=${toId}&vs_currencies=usd`);
        return 1 / data[toId].usd;
      }

      if (toSymbol.toUpperCase() === 'USD') {
        const data = await this.fetchApi(`/simple/price?ids=${fromId}&vs_currencies=usd`);
        return data[fromId].usd;
      }

      // For crypto-to-crypto, get both USD rates and calculate
      const data = await this.fetchApi(`/simple/price?ids=${fromId},${toId}&vs_currencies=usd`);
      const fromPrice = data[fromId].usd;
      const toPrice = data[toId].usd;
      return fromPrice / toPrice;
    } catch (error) {
      console.error('Failed to get exchange rate:', error);
      return 1;
    }
  }

  async getCryptoNews(limit: number = 10): Promise<NewsArticle[]> {
    try {
      // Using CoinGecko's news endpoint (if available) or fallback to trending
      const data = await this.fetchApi('/news');
      return data.data.slice(0, limit).map((article: any) => ({
        id: article.id || Math.random().toString(),
        title: article.title,
        description: article.description || article.content?.substring(0, 200) + '...',
        url: article.url,
        source: article.author || 'CoinGecko',
        published_at: article.created_at || new Date().toISOString(),
        image_url: article.thumb_2x
      }));
    } catch (error) {
      // Fallback to trending coins as "news"
      console.log('News endpoint not available, using trending data');
      try {
        const trending = await this.fetchApi('/search/trending');
        return trending.coins.slice(0, limit).map((coin: any, index: number) => ({
          id: `trending-${coin.item.id}`,
          title: `${coin.item.name} (${coin.item.symbol}) Trending`,
          description: `${coin.item.name} is currently trending in the crypto market with rank #${coin.item.market_cap_rank || 'N/A'}.`,
          url: `https://www.coingecko.com/en/coins/${coin.item.id}`,
          source: 'CoinGecko Trending',
          published_at: new Date().toISOString(),
          image_url: coin.item.large
        }));
      } catch (fallbackError) {
        console.error('Failed to fetch trending data:', fallbackError);
        return [];
      }
    }
  }
}

export const coinGeckoService = new CoinGeckoService();
