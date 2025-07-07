import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Package, Clock, CheckCircle, XCircle, History, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StatusHistory {
  status: string;
  timestamp: string;
  relativeTime?: string;
}

interface Order {
  id: string;
  shopId: string;
  shopName: string;
  ownerName: string;
  ownerId: string;
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
  statusHistory?: StatusHistory[];
  deliveryTime?: string;
  ownerNote?: string;
  createdAt: string;
  updatedAt: string;
}

const CustomerOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerOrders();
  }, [user]);

  const fetchCustomerOrders = async () => {
    try {
      console.log('Fetching orders for user:', user?.email);
      const response = await fetch(`http://localhost:3001/api/orders/customer/${encodeURIComponent(user?.email || '')}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }
      
      const customerOrders = await response.json();
      console.log('Received orders:', customerOrders);
      
      setOrders(Array.isArray(customerOrders) ? customerOrders : []);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
      case 'refused':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'default';
      case 'accepted':
      case 'preparing':
        return 'secondary';
      case 'delivering':
        return 'outline';
      case 'delivered':
        return 'default';
      case 'cancelled':
      case 'refused':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background bg-mesh-dark flex items-center justify-center">
        <p className="text-xl text-foreground">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-mesh-dark p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Package className="w-6 h-6 text-primary" />
            </div>
            My Orders
          </h1>
          <p className="text-muted-foreground mt-2">Track your order status and history</p>
        </header>

        {orders.length === 0 ? (
          <Card className="border-primary/20 shadow-secure">
            <CardContent className="p-8 text-center">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground">You haven't placed any orders yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="border-primary/20 shadow-secure">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        Order #{order.id}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        From {order.shopName} • {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <p className="text-lg font-bold mt-1">${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold mb-2">Items:</h4>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.name} x{item.cartQuantity}</span>
                          <span>${(item.price * item.cartQuantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <h4 className="font-semibold mb-1">Payment Method:</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {order.paymentMethod.replace('-', ' ')}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Delivery:</h4>
                      <p className="text-sm text-muted-foreground">
                        {order.deliveryOption}
                        {order.deliveryAddress && ` - ${order.deliveryAddress}`}
                      </p>
                    </div>
                  </div>

                  {/* Owner Note */}
                  {order.ownerNote && (
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-1">Note from seller:</h4>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                        {order.ownerNote}
                      </p>
                    </div>
                  )}

                  {/* Status History */}
                  {order.statusHistory && order.statusHistory.length > 1 && (
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <History className="w-4 h-4" />
                        Status History
                      </h4>
                      <div className="space-y-2">
                        {order.statusHistory.map((status, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <Badge variant="outline">
                              {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                            </Badge>
                            <span className="text-muted-foreground">
                              {formatDate(status.timestamp)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 border-t flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/messages?contact=${order.ownerId}`}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message Seller
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;