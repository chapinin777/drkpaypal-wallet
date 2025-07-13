
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, ExternalLink, RefreshCw } from 'lucide-react';
import { coinGeckoService, NewsArticle } from '@/services/coingeckoApi';

const CryptoNews = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const newsData = await coinGeckoService.getCryptoNews(8);
      setArticles(newsData);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  if (loading) {
    return (
      <Card className="glass-card border-white/10">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 glass-light rounded w-3/4 shimmer"></div>
                <div className="h-3 glass-light rounded w-1/2 shimmer"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-white/10 shadow-2xl hover-glow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-white flex items-center">
          <Newspaper className="mr-2 h-5 w-5 text-blue-400" />
          Crypto News & Trends
        </CardTitle>
        <RefreshCw 
          className={`h-4 w-4 text-gray-400 cursor-pointer hover:text-white ${loading ? 'animate-spin' : ''}`}
          onClick={fetchNews}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        {articles.map((article) => (
          <div
            key={article.id}
            className="p-4 glass-light rounded-xl hover:bg-white/10 transition-all"
          >
            <div className="flex items-start space-x-4">
              {article.image_url && (
                <img 
                  src={article.image_url} 
                  alt={article.title}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2">
                  {article.title}
                </h3>
                <p className="text-gray-400 text-xs line-clamp-2 mb-3">
                  {article.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-xs">
                    {article.source} • {new Date(article.published_at).toLocaleDateString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                    onClick={() => window.open(article.url, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CryptoNews;
