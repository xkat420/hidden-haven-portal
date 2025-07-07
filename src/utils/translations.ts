// Simple English-only translations - removing multi-language support
export const translations = {
  // Navigation
  dashboard: 'Dashboard',
  messages: 'Messages',
  userSettings: 'User Settings',
  shopManagement: 'Shop Management',
  orderManagement: 'Order Management',
  
  // Common
  login: 'Login',
  logout: 'Logout',
  register: 'Register',
  cancel: 'Cancel',
  save: 'Save',
  delete: 'Delete',
  edit: 'Edit',
  loading: 'Loading...',
  
  // Orders
  orders: 'Orders',
  pending: 'Pending',
  accepted: 'Accepted',
  preparing: 'Preparing',
  delivering: 'Delivering',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refused: 'Refused',
  
  // Order descriptions
  pendingDesc: 'Order has been placed and is waiting for merchant confirmation',
  acceptedDesc: 'Order has been accepted by the merchant',
  preparingDesc: 'Order is being prepared',
  deliveringDesc: 'Order is out for delivery',
  deliveredDesc: 'Order has been delivered',
  cancelledDesc: 'Order has been cancelled',
  refusedDesc: 'Order has been refused by the merchant',
  
  // Shop
  shopName: 'Shop Name',
  addToCart: 'Add to Cart',
  checkout: 'Checkout',
  customerEmail: 'Customer Email',
  paymentMethod: 'Payment Method',
  deliveryOption: 'Delivery Option',
  
  // Settings
  notifications: 'Notifications',
  emailNotifications: 'Email Notifications',
  browserNotifications: 'Browser Notifications',
  messageNotifications: 'Message Notifications',
  language: 'Language'
};

export type TranslationKey = keyof typeof translations;