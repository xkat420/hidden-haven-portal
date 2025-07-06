import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ServerCrash, ShoppingCart, Plus, Minus, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShopItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  weight: string;
  description: string;
  imageUrl?: string;
}

interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string;
  isPublic: boolean;
  ownerId: string;
  items: ShopItem[];
  accessCode?: string;
  shopStyle?: string;
  deliveryCities?: string[];
}

interface CartItem extends ShopItem {
  cartQuantity: number;
}

// Real API function to fetch a shop by its slug
const fetchShopBySlug = async (slug: string): Promise<Shop | null> => {
  try {
    const response = await fetch(`http://localhost:3001/api/shops/slug/${slug}`);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch shop:', error);
    return null;
  }
};

const PublicShopPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [accessCode, setAccessCode] = useState('');
  const [needsAccessCode, setNeedsAccessCode] = useState(false);
  const [deliveryCity, setDeliveryCity] = useState('');

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
          if (!shopData.isPublic && shopData.accessCode) {
            setNeedsAccessCode(true);
            setLoading(false);
            return;
          }
          setShop(shopData);
        } else {
          setError('Shop not found.');
        }
      } catch (err) {
        setError('Failed to fetch shop data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    getShopData();
  }, [slug]);

  const handleAccessCode = async () => {
    try {
      const shopData = await fetchShopBySlug(slug!);
      if (shopData && shopData.accessCode === accessCode) {
        setShop(shopData);
        setNeedsAccessCode(false);
        toast({
          title: "Access granted",
          description: "Welcome to the shop!"
        });
      } else {
        toast({
          title: "Invalid access code",
          description: "Please check your access code and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify access code.",
        variant: "destructive"
      });
    }
  };

  const addToCart = (item: ShopItem, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, cartQuantity: cartItem.cartQuantity + quantity }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, cartQuantity: quantity }];
      }
    });
    toast({
      title: "Added to cart",
      description: `${item.name} added to your cart`
    });
  };

  const updateCartQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === itemId ? { ...item, cartQuantity: newQuantity } : item
        )
      );
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.cartQuantity), 0);
  };

  if (loading) return (
    <div className="min-h-screen bg-background bg-mesh-dark flex items-center justify-center">
      <p className="text-xl text-foreground">Loading Shop...</p>
    </div>
  );

  if (needsAccessCode) return (
    <div className="min-h-screen bg-background bg-mesh-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-primary/20 shadow-secure">
        <CardHeader>
          <CardTitle>Private Shop Access</CardTitle>
          <CardDescription>This shop requires an access code to view.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter access code"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAccessCode()}
          />
          <Button onClick={handleAccessCode} className="w-full">
            Access Shop
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-background bg-mesh-dark flex items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-lg">
        <ServerCrash className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </div>
  );

  if (!shop) return null;

  return (
    <div className="min-h-screen bg-background bg-mesh-dark p-4 sm:p-8">
      <div className="max-w-7xl mx-auto animate-fade-in">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Main Shop Content */}
          <div className="lg:col-span-3">
            <Card className="border-primary/20 shadow-secure overflow-hidden mb-6">
              <CardHeader>
                <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {shop.name}
                </CardTitle>
                <CardDescription className="font-mono text-sm">
                  /shop/{shop.slug}
                </CardDescription>
                <p className="text-foreground/80">{shop.description}</p>
                {shop.deliveryCities && shop.deliveryCities.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Delivery to: {shop.deliveryCities.join(', ')}</span>
                  </div>
                )}
              </CardHeader>
            </Card>

            {/* Shop Items */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {shop.items?.map((item) => (
                <Card key={item.id} className="border-primary/20 shadow-secure">
                  {item.imageUrl && (
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-primary">${item.price}</span>
                      {item.weight && (
                        <Badge variant="outline">{item.weight}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm">Stock: {item.quantity}</span>
                    </div>
                    <Button
                      onClick={() => addToCart(item)}
                      disabled={item.quantity === 0}
                      className="w-full"
                      variant="secure"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Shopping Cart Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-primary/20 shadow-secure sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Shopping Cart ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Your cart is empty
                  </p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">${item.price} each</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartQuantity(item.id, item.cartQuantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="px-2 text-sm">{item.cartQuantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartQuantity(item.id, item.cartQuantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-bold text-lg mb-4">
                        <span>Total: ${getTotalPrice().toFixed(2)}</span>
                      </div>
                      
                      {shop.deliveryCities && shop.deliveryCities.length > 0 && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-2">
                            Delivery City
                          </label>
                          <select
                            value={deliveryCity}
                            onChange={(e) => setDeliveryCity(e.target.value)}
                            className="w-full p-2 border rounded"
                          >
                            <option value="">Select city</option>
                            {shop.deliveryCities.map(city => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      
                      <Button className="w-full" variant="secure">
                        Checkout
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicShopPage;