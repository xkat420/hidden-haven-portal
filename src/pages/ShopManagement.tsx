import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, ExternalLink, Store, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// In a larger app, this would be in a shared types file (e.g., src/types/index.ts)
interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  ownerId: string;
}

// Mock API function to fetch shops for the logged-in user
const fetchUserShops = async (userId: string): Promise<Shop[]> => {
  console.log(`Fetching shops for user: ${userId}`);
  // Real API call to backend
  const response = await fetch(`http://localhost:3001/api/shops/user/${userId}`);
  const shops = await response.json();
  return shops;
};

const ShopManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const getShops = async () => {
      try {
        setLoading(true);
        const userShops = await fetchUserShops(user.id);
        setShops(userShops);
      } catch (err) {
        setError("Failed to load your shops. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    getShops();
  }, [user]);

  // Handle create, edit, and delete
  const handleCreateShop = () => navigate('/shop-editor/new');
  const handleEditShop = (shopId: string) => navigate(`/shop-editor/${shopId}`);
  const handleDeleteShop = async (shopId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/shops/${shopId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setShops(shops.filter(shop => shop.id !== shopId));
      }
    } catch (error) {
      setError("Failed to delete shop. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background bg-mesh-dark p-4 sm:p-8">
      <div className="max-w-6xl mx-auto animate-fade-in">
        <header className="flex flex-wrap gap-4 justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-3"><Store />Shop Management</h1>
          <Button onClick={handleCreateShop} variant="secure" className="shadow-glow"><PlusCircle className="w-4 h-4 mr-2" />Create New Shop</Button>
        </header>

        {loading && <div className="flex justify-center items-center p-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /><p className="ml-4 text-lg">Loading your shops...</p></div>}
        {error && <Alert variant="destructive" className="max-w-lg mx-auto"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

        {!loading && !error && shops.length === 0 && (
            <Card className="text-center border-primary/20 shadow-secure py-12"><CardHeader><CardTitle>No Shops Found</CardTitle><CardDescription>You haven't created any shops yet. Get started by creating one!</CardDescription></CardHeader><CardContent><Button onClick={handleCreateShop} variant="secure" size="lg" className="shadow-glow"><PlusCircle className="w-5 h-5 mr-2" />Create Your First Shop</Button></CardContent></Card>
        )}

        {!loading && !error && shops.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shops.map((shop) => (
              <Card key={shop.id} className="border-primary/20 shadow-secure flex flex-col">
                <CardHeader><CardTitle className="truncate">{shop.name}</CardTitle><CardDescription className="font-mono text-xs cursor-pointer hover:underline" onClick={() => navigate(`/shop/${shop.slug}`)}>/shop/{shop.slug}</CardDescription></CardHeader>
                <CardContent className="flex-grow"><p className="text-sm text-muted-foreground line-clamp-3">{shop.description}</p></CardContent>
                <div className="p-4 mt-auto border-t border-border/20 flex items-center justify-between gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/shop/${shop.slug}`)} className="flex-1"><ExternalLink className="w-4 h-4 mr-2" />View</Button>
                  <Button variant="outline" size="sm" onClick={() => handleEditShop(shop.id)} className="flex-1"><Edit className="w-4 h-4 mr-2" />Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteShop(shop.id)} className="flex-1"><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopManagement;