import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ServerCrash, Image as ImageIcon } from 'lucide-react';

// Mock shop data structure
interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  ownerId: string;
}

// Mock API function to fetch a shop by its slug
const fetchShopBySlug = async (slug: string): Promise<Shop | null> => {
  console.log(`Fetching shop with slug: ${slug}`);
  // In a real application, this would be a fetch call to your backend API
  // e.g., const response = await fetch(`/api/shops/slug/${slug}`);
  // For now, we'll return a mock shop to demonstrate the page.
  if (slug === 'example-shop') {
    return {
      id: 'shop1',
      name: 'The Example Emporium',
      slug: 'example-shop',
      description: 'A wonderful place to find all sorts of example items. This is a public-facing page for your secure shop.',
      imageUrl: 'https://via.placeholder.com/800x400.png?text=Shop+Image',
      ownerId: 'user123',
    };
  }
  return null;
};

const PublicShopPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError('Shop slug is missing.');
      setLoading(false);
      return;
    }

    const getShopData = async () => {
      try {
        setLoading(true);
        const shopData = await fetchShopBySlug(slug);
        if (shopData) {
          setShop(shopData);
        } else {
          setError(`Shop not found. Try navigating to /shop/example-shop to see a demo.`);
        }
      } catch (err) {
        setError('Failed to fetch shop data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    getShopData();
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-background bg-mesh-dark flex items-center justify-center"><p className="text-xl text-foreground">Loading Shop...</p></div>;

  if (error) return (
    <div className="min-h-screen bg-background bg-mesh-dark flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-lg"><ServerCrash className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
    </div>
  );

  if (!shop) return null;

  return (
    <div className="min-h-screen bg-background bg-mesh-dark p-4 sm:p-8">
      <div className="max-w-4xl mx-auto animate-fade-in">
        <Card className="border-primary/20 shadow-secure overflow-hidden">
          <div className="bg-muted/20 h-64 flex items-center justify-center">
            {shop.imageUrl ? <img src={shop.imageUrl} alt={shop.name} className="w-full h-full object-cover" /> : <div className="text-muted-foreground flex flex-col items-center gap-2"><ImageIcon className="w-12 h-12" /><span>No Image</span></div>}
          </div>
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">{shop.name}</CardTitle>
            <CardDescription className="font-mono text-sm">/shop/{shop.slug}</CardDescription>
          </CardHeader>
          <CardContent><p className="text-foreground/80">{shop.description}</p></CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicShopPage;