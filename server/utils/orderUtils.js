const Database = require('./database');

const ORDER_STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted', 
  PREPARING: 'preparing',
  DELIVERING: 'delivering',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUSED: 'refused'
};

const STATUS_DESCRIPTIONS = {
  [ORDER_STATUSES.PENDING]: 'Order has been placed and is waiting for merchant confirmation',
  [ORDER_STATUSES.ACCEPTED]: 'Order has been accepted by the merchant',
  [ORDER_STATUSES.PREPARING]: 'Order is being prepared',
  [ORDER_STATUSES.DELIVERING]: 'Order is out for delivery',
  [ORDER_STATUSES.DELIVERED]: 'Order has been delivered',
  [ORDER_STATUSES.CANCELLED]: 'Order has been cancelled',
  [ORDER_STATUSES.REFUSED]: 'Order has been refused by the merchant'
};

const createOrderTimestamp = (status) => ({
  status,
  timestamp: new Date().toISOString(),
  relativeTime: null
});

const calculateDeliveryTime = (order) => {
  if (!order.statusHistory) return null;
  
  const acceptedTime = order.statusHistory.find(h => h.status === ORDER_STATUSES.ACCEPTED)?.timestamp;
  const deliveredTime = order.statusHistory.find(h => h.status === ORDER_STATUSES.DELIVERED)?.timestamp;
  
  if (acceptedTime && deliveredTime) {
    const timeDiff = new Date(deliveredTime) - new Date(acceptedTime);
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }
  
  return null;
};

const updateOrderStatus = async (orderId, newStatus, customStatus = null) => {
  const orders = await Database.getOrders();
  const orderIndex = orders.findIndex(o => o.id === orderId);
  
  if (orderIndex === -1) {
    throw new Error('Order not found');
  }
  
  const order = orders[orderIndex];
  const finalStatus = customStatus || newStatus;
  
  // Initialize status history if not exists
  if (!order.statusHistory) {
    order.statusHistory = [createOrderTimestamp(order.status || ORDER_STATUSES.PENDING)];
  }
  
  // Add new status to history
  order.statusHistory.push(createOrderTimestamp(finalStatus));
  order.status = finalStatus;
  order.updatedAt = new Date().toISOString();
  
  // Calculate delivery time if delivered
  if (finalStatus === ORDER_STATUSES.DELIVERED) {
    order.deliveryTime = calculateDeliveryTime(order);
  }
  
  await Database.saveOrders(orders);
  return order;
};

module.exports = {
  ORDER_STATUSES,
  STATUS_DESCRIPTIONS,
  updateOrderStatus,
  calculateDeliveryTime,
  createOrderTimestamp
};