import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Package, Clock, CheckCircle, XCircle, History, MessageSquare, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatMessageTimestamp } from '@/utils/messageUtils';

interface StatusHistory {
  status: string;
  timestamp: string;
  note?: string;
}

interface Order {
  id: string;
  shopId: string;
  shopName: string;
  ownerName: string;
  ownerId: string;
  customerEmail: string;
  customerId: string;
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

const OrdersStatus = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      // Get all user's shops first
      const shopsResponse = await fetch(`http://localhost:3001/api/shops/user/${user?.id}`);
      const userShops = await shopsResponse.json();
      
      // Fetch orders for all user's shops
      const allOrders = [];
      for (const shop of userShops) {
        const ordersResponse = await fetch(`http://localhost:3001/api/orders/shop/${shop.id}`);
        const shopOrders = await ordersResponse.json();
        allOrders.push(...shopOrders);
      }
      
      setOrders(allOrders);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch shop orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-5 h-5 text-warning" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'cancelled':
      case 'refused':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'preparing':
        return <Package className="w-5 h-5 text-primary" />;
      default:
        return <Package className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'secondary';
      case 'accepted':
      case 'preparing':
        return 'default';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Package className="w-16 h-16 mx-auto text-primary animate-pulse" />
          <p className="text-xl text-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Package className="w-8 h-8 text-primary" />
            </div>
            Orders from Your Shops
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage orders placed at your shops and their status
          </p>
        </header>

        {orders.length === 0 ? (
          <Card className="border-primary/20 shadow-secure">
            <CardContent className="p-12 text-center space-y-4">
              <Package className="w-20 h-20 mx-auto text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">No Orders from Customers Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  No customers have placed orders at your shops yet. Share your shop links to start receiving orders!
                </p>
              </div>
              <Button asChild className="mt-4">
                <Link to="/shop-management">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Manage Shops
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <Card key={order.id} className="border-primary/20 shadow-secure hover:shadow-glow transition-all duration-300">
                <CardHeader className="border-b border-border/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-3">
                        {getStatusIcon(order.status)}
                        <span className="text-xl">Order #{order.id}</span>
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span>Customer: <strong>{order.customerEmail}</strong></span>
                        <span>•</span>
                        <span>{formatMessageTimestamp(order.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <Badge variant={getStatusVariant(order.status)} className="w-fit">
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <p className="text-2xl font-bold text-primary">${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6 p-6">
                  {/* Order Items */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Items Ordered
                    </h4>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-2">
                            <div className="flex-1">
                              <span className="font-medium">{item.name}</span>
                              <span className="text-muted-foreground ml-2">×{item.cartQuantity}</span>
                            </div>
                            <span className="font-semibold">${(item.price * item.cartQuantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Payment & Delivery</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payment Method:</span>
                          <span className="capitalize font-medium">
                            {order.paymentMethod.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Delivery Option:</span>
                          <span className="font-medium">{order.deliveryOption}</span>
                        </div>
                        {order.deliveryAddress && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Address:</span>
                            <span className="font-medium text-right max-w-xs">
                              {order.deliveryAddress}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <h4 className="font-semibold">Actions</h4>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/messages?contact=${order.customerId || order.customerEmail}`}>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Message Customer
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/order-management`}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Manage Order
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Owner Note */}
                  {order.ownerNote && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Note from Seller</h4>
                      <div className="bg-accent/50 border border-accent p-4 rounded-lg">
                        <p className="text-sm">{order.ownerNote}</p>
                      </div>
                    </div>
                  )}

                  {/* Status History */}
                  {order.statusHistory && order.statusHistory.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <History className="w-4 h-4" />
                        Order Timeline
                      </h4>
                      <div className="space-y-3">
                        {order.statusHistory.map((status, index) => (
                          <div key={index} className="flex items-center gap-4 p-3 bg-card/50 rounded-lg border border-border/50">
                            <div className="flex-shrink-0">
                              {getStatusIcon(status.status)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                  {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatMessageTimestamp(status.timestamp)}
                                </span>
                              </div>
                              {status.note && (
                                <p className="text-sm text-muted-foreground mt-1">{status.note}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersStatus;