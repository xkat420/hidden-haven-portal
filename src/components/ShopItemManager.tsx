import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Package } from 'lucide-react';

interface ShopItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  weight: string;
  description: string;
}

interface ShopItemManagerProps {
  shopId: string;
}

const ShopItemManager = ({ shopId }: ShopItemManagerProps) => {
  const { toast } = useToast();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    weight: '',
    description: ''
  });

  useEffect(() => {
    fetchItems();
  }, [shopId]);

  const fetchItems = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/shops/slug/shop-${shopId}`);
      const shop = await response.json();
      setItems(shop.items || []);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      quantity: '',
      weight: '',
      description: ''
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast({
        title: "Error",
        description: "Name and price are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const url = editingItem 
        ? `http://localhost:3001/api/shops/${shopId}/items/${editingItem.id}`
        : `http://localhost:3001/api/shops/${shopId}/items`;
      
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: editingItem ? "Item updated successfully" : "Item added successfully"
        });
        fetchItems();
        resetForm();
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
        description: "Failed to save item",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (item: ShopItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      quantity: item.quantity.toString(),
      weight: item.weight,
      description: item.description
    });
    setShowForm(true);
  };

  const handleDelete = async (itemId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/shops/${shopId}/items/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Item deleted successfully"
        });
        fetchItems();
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
        description: "Failed to delete item",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="border-primary/20 shadow-secure">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Shop Items
            </CardTitle>
            <CardDescription>Manage your shop's inventory</CardDescription>
          </div>
          <Button onClick={() => setShowForm(true)} variant="secure">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <Card className="mb-6 border-muted">
            <CardHeader>
              <CardTitle className="text-lg">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="itemName">Item Name</Label>
                    <Input
                      id="itemName"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter item name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight/Unit</Label>
                    <Input
                      id="weight"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      placeholder="e.g. 100g, 1kg, 1 piece"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="itemDescription">Description</Label>
                  <Textarea
                    id="itemDescription"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the item..."
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" variant="secure">
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No items in your shop yet.</p>
            <p className="text-sm">Add some items to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card key={item.id} className="border-muted">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg truncate">{item.name}</CardTitle>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">${item.price}</span>
                    {item.weight && (
                      <span className="text-sm text-muted-foreground">{item.weight}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm">Qty: {item.quantity}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(item)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDelete(item.id)}
                      className="flex-1"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShopItemManager;