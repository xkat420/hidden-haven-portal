import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ExternalLink } from 'lucide-react';

interface ShopPreview {
  name: string;
  description: string;
  image?: string;
  slug: string;
}

interface ShopLinkPreviewProps {
  slug: string;
  url: string;
}

export const ShopLinkPreview = ({ slug, url }: ShopLinkPreviewProps) => {
  const [shop, setShop] = useState<ShopPreview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopPreview = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/shops/public/${slug}`);
        if (response.ok) {
          const shopData = await response.json();
          setShop({
            name: shopData.name,
            description: shopData.description,
            image: shopData.backgroundImage,
            slug: shopData.slug
          });
        }
      } catch (error) {
        console.error('Failed to fetch shop preview:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopPreview();
  }, [slug]);

  if (loading) {
    return (
      <Card className="max-w-sm my-2 animate-pulse">
        <CardContent className="p-3">
          <div className="h-4 bg-muted rounded mb-2"></div>
          <div className="h-3 bg-muted rounded w-3/4"></div>
        </CardContent>
      </Card>
    );
  }

  if (!shop) {
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-primary hover:underline"
      >
        {url}
        <ExternalLink className="w-3 h-3" />
      </a>
    );
  }

  return (
    <Card className="max-w-sm my-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
      <CardContent className="p-3">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block"
        >
          {shop.image && (
            <div className="w-full h-20 bg-muted rounded mb-2 overflow-hidden">
              <img 
                src={shop.image} 
                alt={shop.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{shop.name}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {shop.description}
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              Shop
            </Badge>
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <ExternalLink className="w-3 h-3" />
            View Shop
          </div>
        </a>
      </CardContent>
    </Card>
  );
};