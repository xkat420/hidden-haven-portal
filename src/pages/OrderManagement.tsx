import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Order {
  id: string;
  shopId: string;
  customerEmail: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    cartQuantity: number;
  }>;
  total: number;
  paymentMethod: string;
  deliveryOption: string;
  deliveryAddress: string;
  status: string;
  createdAt: string;
}

const OrderManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { sendNotification } = useNotifications();
  const [orders, setOrders] = useState<Order[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserShops();
  }, [user]);

  const fetchUserShops = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/shops/user/${user?.id}`);
      const userShops = await response.json();
      setShops(userShops);
      
      // Fetch orders for all user shops
      const allOrders: Order[] = [];
      for (const shop of userShops) {
        const orderResponse = await fetch(`http://localhost:3001/api/orders/shop/${shop.id}`);
        const shopOrders = await orderResponse.json();
        allOrders.push(...shopOrders);
      }
      setOrders(allOrders);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(orders.map(order => 
          order.id === orderId ? updatedOrder : order
        ));
        
        toast({
          title: "Success",
          description: `Order status updated to ${status}`
        });

        // Send browser notification for significant status changes
        if (['accepted', 'preparing', 'delivering', 'delivered'].includes(status)) {
          sendNotification({
            title: 'Order Status Updated',
            body: `Order #${orderId} is now ${status}`,
            data: { orderId, status, type: 'order-update' }
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setOrders(orders.filter(order => order.id !== orderId));
        toast({
          title: "Success",
          description: "Order deleted successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted': case 'preparing': return <Package className="w-4 h-4" />;
      case 'delivering': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': case 'refused': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) return <div className="p-8">Loading orders...</div>;

  return (
    <div className="min-h-screen bg-background bg-mesh-dark p-4 sm:p-8">
      <div className="max-w-6xl mx-auto animate-fade-in">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-primary bg-clip-text text-transparent">
          Order Management
        </h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="border-primary/20 shadow-secure">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      Order #{order.id}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {order.customerEmail} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Items:</h4>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.name} x{item.cartQuantity}</span>
                          <span>${(item.price * item.cartQuantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total: ${order.total.toFixed(2)}</span>
                      <span>{order.paymentMethod} • {order.deliveryOption}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {order.status === 'pending' && (
                      <>
                        <Button size="sm" onClick={() => updateOrderStatus(order.id, 'accepted')}>
                          Accept
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => updateOrderStatus(order.id, 'refused')}>
                          Refuse
                        </Button>
                      </>
                    )}
                    {order.status === 'accepted' && (
                      <Button size="sm" onClick={() => updateOrderStatus(order.id, 'preparing')}>
                        Start Preparing
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button size="sm" onClick={() => updateOrderStatus(order.id, 'delivering')}>
                        Out for Delivery
                      </Button>
                    )}
                    {order.status === 'delivering' && (
                      <Button size="sm" onClick={() => updateOrderStatus(order.id, 'delivered')}>
                        Mark Delivered
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => deleteOrder(order.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {orders.length === 0 && (
            <Card className="border-primary/20 shadow-secure">
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No orders yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;