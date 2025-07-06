import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Save, ArrowLeft, Store } from 'lucide-react';
import ShopItemManager from '@/components/ShopItemManager';

interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string;
  isPublic: boolean;
  ownerId: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    weight: string;
    description: string;
  }>;
}

const ShopEditor = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [shopStyle, setShopStyle] = useState('default');
  const [deliveryCities, setDeliveryCities] = useState<string[]>([]);
  const [newCity, setNewCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (shopId && shopId !== 'new') {
      setIsEditing(true);
      fetchShop();
    }
  }, [shopId]);

  const fetchShop = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/shops/user/${user?.id}`);
      const shops = await response.json();
      const currentShop = shops.find((s: Shop) => s.id === shopId);
      
      if (currentShop) {
        setShop(currentShop);
        setName(currentShop.name);
        setSlug(currentShop.slug);
        setDescription(currentShop.description);
        setIsPublic(currentShop.isPublic);
        setAccessCode(currentShop.accessCode || '');
        setShopStyle(currentShop.shopStyle || 'default');
        setDeliveryCities(currentShop.deliveryCities || []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch shop details",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    if (!name || !slug) {
      toast({
        title: "Error",
        description: "Name and slug are required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const url = isEditing 
        ? `http://localhost:3001/api/shops/${shopId}`
        : 'http://localhost:3001/api/shops';
      
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing 
        ? { name, description, isPublic, accessCode, shopStyle, deliveryCities }
        : { name, slug, description, isPublic, accessCode, shopStyle, deliveryCities, ownerId: user?.id };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: isEditing ? "Shop updated successfully" : "Shop created successfully"
        });
        navigate('/shop-management');
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save shop",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-mesh-dark p-4 sm:p-8">
      <div className="max-w-4xl mx-auto animate-fade-in">
        <header className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate('/shop-management')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-3">
            <Store />
            {isEditing ? 'Edit Shop' : 'Create New Shop'}
          </h1>
        </header>

        <div className="space-y-6">
          <Card className="border-primary/20 shadow-secure">
            <CardHeader>
              <CardTitle>Shop Details</CardTitle>
              <CardDescription>Configure your shop's basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Shop Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter shop name"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Shop Slug</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="shop-url-slug"
                    disabled={isEditing}
                  />
                  {slug && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Your shop will be available at: /shop/{slug}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your shop..."
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublic"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <Label htmlFor="isPublic">Make shop public</Label>
                </div>
                
                <div>
                  <Label htmlFor="shopStyle">Shop Style</Label>
                  <select
                    id="shopStyle"
                    value={shopStyle}
                    onChange={(e) => setShopStyle(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="default">Default</option>
                    <option value="modern">Modern</option>
                    <option value="vintage">Vintage</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </div>
              </div>

              {!isPublic && (
                <div>
                  <Label htmlFor="accessCode">Access Code (for private shops)</Label>
                  <Input
                    id="accessCode"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Enter access code for private access"
                  />
                </div>
              )}

              <div>
                <Label>Delivery Cities</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Add delivery city"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newCity.trim() && !deliveryCities.includes(newCity.trim())) {
                          setDeliveryCities([...deliveryCities, newCity.trim()]);
                          setNewCity('');
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (newCity.trim() && !deliveryCities.includes(newCity.trim())) {
                        setDeliveryCities([...deliveryCities, newCity.trim()]);
                        setNewCity('');
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {deliveryCities.map((city, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => setDeliveryCities(deliveryCities.filter((_, i) => i !== index))}>
                      {city} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <Button onClick={handleSave} disabled={loading} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : (isEditing ? 'Update Shop' : 'Create Shop')}
              </Button>
            </CardContent>
          </Card>

          {isEditing && shop && (
            <ShopItemManager shopId={shop.id} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopEditor;