import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, AlertCircle, ArrowRight, Clock } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';

interface OrdersSummary {
  pendingOrders: number;
  totalOrders: number;
  recentOrders: Array<{
    id: string;
    customerEmail: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
}

interface OrdersOverviewProps {
  userId: string;
  navigate: NavigateFunction;
}

const OrdersOverview = ({ userId, navigate }: OrdersOverviewProps) => {
  const [ordersSummary, setOrdersSummary] = useState<OrdersSummary>({
    pendingOrders: 0,
    totalOrders: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrdersSummary();
  }, [userId]);

  const fetchOrdersSummary = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/orders/user/${userId}/summary`);
      const data = await response.json();
      setOrdersSummary(data);
    } catch (error) {
      console.error('Failed to fetch orders summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'accepted': case 'preparing': return 'bg-blue-500';
      case 'delivering': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': case 'refused': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card className="border-primary/20 shadow-secure flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="animate-spin" /> Orders
          </CardTitle>
          <CardDescription>Loading orders...</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 shadow-secure flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package /> Orders Overview
          {ordersSummary.pendingOrders > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {ordersSummary.pendingOrders}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Manage your shop orders and track their status.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{ordersSummary.pendingOrders}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{ordersSummary.totalOrders}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
        </div>

        {ordersSummary.recentOrders.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Orders:</h4>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {ordersSummary.recentOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`}></div>
                    <span className="truncate max-w-20">{order.customerEmail}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>${order.total}</span>
                    <Clock className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button 
          onClick={() => navigate('/order-management')} 
          variant="secure" 
          className="w-full shadow-glow"
        >
          Manage Orders
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default OrdersOverview;