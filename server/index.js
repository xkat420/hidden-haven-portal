const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult, param } = require('express-validator');
const fs = require('fs').promises;

const app = express();
const PORT = 3001;
const DB_PATH = './users.json';
const SHOPS_PATH = './shops.json';
const MESSAGES_PATH = './messages.json';
const ORDERS_PATH = './orders.json';

// Security configurations
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const VALID_INVITE_CODES = process.env.INVITE_CODES ? 
  process.env.INVITE_CODES.split(',') : 
  ['SECRET-CODE-123', 'ALPHA-INVITE-789'];

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.'
});

app.use(limiter);

// CORS configuration - restrict to specific origins in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Comprehensive logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('ERROR CAUGHT:', err);
  console.error('Error stack:', err.stack);
  console.error('Request:', req.method, req.path);
  console.error('Body:', req.body);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  console.log('Auth middleware called for:', req.path);
  const authHeader = req.headers['authorization'];
  console.log('Auth header:', authHeader);
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Token extracted:', token);

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('JWT verification error:', err);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    console.log('JWT verified, user:', user);
    req.user = user;
    next();
  });
};

// Input validation middleware
const handleValidationErrors = (req, res, next) => {
  console.log('Validation middleware called');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  console.log('Validation passed');
  next();
};

/**
 * A simple health-check endpoint to verify the server is running.
 */
app.get('/', (req, res) => {
  res.status(200).send('Secure server is up and running!');
});

const readUsers = async () => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      return [];
    }
    throw error;
  }
};

const writeUsers = async (users) => {
  await fs.writeFile(DB_PATH, JSON.stringify(users, null, 2));
};

// Shop database functions
const readShops = async () => {
  try {
    const data = await fs.readFile(SHOPS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      return [];
    }
    throw error;
  }
};

const writeShops = async (shops) => {
  await fs.writeFile(SHOPS_PATH, JSON.stringify(shops, null, 2));
};

// Messages database functions
const readMessages = async () => {
  try {
    const data = await fs.readFile(MESSAGES_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      return [];
    }
    throw error;
  }
};

const writeMessages = async (messages) => {
  await fs.writeFile(MESSAGES_PATH, JSON.stringify(messages, null, 2));
};

// Orders database functions
const readOrders = async () => {
  try {
    const data = await fs.readFile(ORDERS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      return [];
    }
    throw error;
  }
};

const writeOrders = async (orders) => {
  await fs.writeFile(ORDERS_PATH, JSON.stringify(orders, null, 2));
};

app.post('/api/register', 
  authLimiter,
  [
    body('username').trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must be 3-50 characters and contain only letters, numbers, and underscores'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('inviteCode').trim().notEmpty().withMessage('Invitation code is required')
  ],
  handleValidationErrors,
  async (req, res) => {
  try {
    const { username, password, inviteCode } = req.body;

    if (!VALID_INVITE_CODES.includes(inviteCode)) {
      return res.status(400).json({ message: 'Invalid invitation code.' });
    }

    const users = await readUsers();
    const userExists = users.find(user => user.username === username);

    if (userExists) {
      return res.status(409).json({ message: 'An account with this username already exists.' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: Date.now().toString(),
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await writeUsers(users);

    console.log(`New user registered: ${username}`);
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

app.post('/api/login',
  authLimiter,
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  handleValidationErrors,
  async (req, res) => {
  try {
    const { username, password } = req.body;

    const users = await readUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userData } = user;

    res.status(200).json({
      message: 'Login successful!',
      user: userData,
      token
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

// Shop API endpoints
app.post('/api/shops', 
  authenticateToken,
  [
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Shop name must be 1-100 characters'),
    body('slug').trim().isLength({ min: 1, max: 50 }).matches(/^[a-zA-Z0-9-]+$/).withMessage('Slug must contain only letters, numbers, and hyphens'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description must be under 500 characters')
  ],
  handleValidationErrors,
  async (req, res) => {
  try {
    const { name, slug, description, isPublic } = req.body;
    const ownerId = req.user.id; // Get from authenticated user
    
    const shops = await readShops();
    const shopExists = shops.find(shop => shop.slug === slug);

    if (shopExists) {
      return res.status(409).json({ message: 'Shop with this slug already exists.' });
    }

    const newShop = {
      id: Date.now().toString(),
      name,
      slug,
      description: description || '',
      isPublic: isPublic || false,
      ownerId,
      items: [],
      accessCode: null,
      shopStyle: 'default',
      deliveryCities: [],
      paymentMethods: ['credit-card', 'bitcoin', 'cash'],
      deliveryOptions: ['Ship2', 'Deaddrop'],
      cryptoWallets: {},
      shopColors: {
        primary: '#000000',
        secondary: '#ffffff',
        accent: '#888888'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    shops.push(newShop);
    await writeShops(shops);

    res.status(201).json(newShop);
  } catch (error) {
    console.error('Shop Creation Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

app.get('/api/shops/user/:userId', 
  authenticateToken,
  param('userId').isString().withMessage('Invalid user ID'),
  handleValidationErrors,
  async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Users can only access their own shops
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    
    const shops = await readShops();
    const userShops = shops.filter(shop => shop.ownerId === userId);
    res.json(userShops);
  } catch (error) {
    console.error('Get User Shops Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

// Public endpoint for viewing shops by slug
app.get('/api/shops/slug/:slug', 
  param('slug').matches(/^[a-zA-Z0-9-]+$/).withMessage('Invalid slug format'),
  handleValidationErrors,
  async (req, res) => {
  try {
    const { slug } = req.params;
    const shops = await readShops();
    const shop = shops.find(s => s.slug === slug);
    
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found.' });
    }

    res.json(shop);
  } catch (error) {
    console.error('Get Shop Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

app.put('/api/shops/:id', 
  authenticateToken,
  [
    param('id').isString().withMessage('Invalid shop ID'),
    body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Shop name must be 1-100 characters'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description must be under 500 characters')
  ],
  handleValidationErrors,
  async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isPublic, accessCode, shopStyle, deliveryCities, paymentMethods, deliveryOptions, cryptoWallets, shopColors } = req.body;
    
    const shops = await readShops();
    const shopIndex = shops.findIndex(shop => shop.id === id);

    if (shopIndex === -1) {
      return res.status(404).json({ message: 'Shop not found.' });
    }

    // Check ownership
    if (shops[shopIndex].ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only edit your own shops.' });
    }

    shops[shopIndex] = {
      ...shops[shopIndex],
      name: name || shops[shopIndex].name,
      description: description !== undefined ? description : shops[shopIndex].description,
      isPublic: isPublic !== undefined ? isPublic : shops[shopIndex].isPublic,
      accessCode: accessCode !== undefined ? accessCode : shops[shopIndex].accessCode,
      shopStyle: shopStyle !== undefined ? shopStyle : shops[shopIndex].shopStyle,
      deliveryCities: deliveryCities !== undefined ? deliveryCities : shops[shopIndex].deliveryCities,
      paymentMethods: paymentMethods !== undefined ? paymentMethods : shops[shopIndex].paymentMethods,
      deliveryOptions: deliveryOptions !== undefined ? deliveryOptions : shops[shopIndex].deliveryOptions,
      cryptoWallets: cryptoWallets !== undefined ? cryptoWallets : shops[shopIndex].cryptoWallets,
      shopColors: shopColors !== undefined ? shopColors : shops[shopIndex].shopColors,
      updatedAt: new Date().toISOString()
    };

    await writeShops(shops);
    res.json(shops[shopIndex]);
  } catch (error) {
    console.error('Update Shop Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

app.delete('/api/shops/:id', 
  authenticateToken,
  param('id').isString().withMessage('Invalid shop ID'),
  handleValidationErrors,
  async (req, res) => {
  try {
    const { id } = req.params;
    const shops = await readShops();
    const shop = shops.find(shop => shop.id === id);
    
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found.' });
    }

    // Check ownership
    if (shop.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own shops.' });
    }

    const filteredShops = shops.filter(shop => shop.id !== id);
    await writeShops(filteredShops);
    res.json({ message: 'Shop deleted successfully.' });
  } catch (error) {
    console.error('Delete Shop Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

app.post('/api/shops/:id/items',
  authenticateToken,
  [
    param('id').isString().withMessage('Invalid shop ID'),
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Item name must be 1-100 characters'),
    body('price').isNumeric().withMessage('Price must be a valid number'),
    body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('weight').optional().isLength({ max: 50 }).withMessage('Weight must be under 50 characters'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description must be under 500 characters')
  ],
  handleValidationErrors,
  async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, quantity, weight, description } = req.body;
    
    const shops = await readShops();
    const shopIndex = shops.findIndex(shop => shop.id === id);

    if (shopIndex === -1) {
      return res.status(404).json({ message: 'Shop not found.' });
    }

    // Check ownership
    if (shops[shopIndex].ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only add items to your own shops.' });
    }

    const newItem = {
      id: Date.now().toString(),
      name,
      price: parseFloat(price),
      quantity: parseInt(quantity) || 0,
      weight: weight || '',
      description: description || '',
      imageUrl: req.body.imageUrl || '',
      createdAt: new Date().toISOString()
    };

    shops[shopIndex].items.push(newItem);
    shops[shopIndex].updatedAt = new Date().toISOString();
    
    await writeShops(shops);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Add Item Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

app.put('/api/shops/:shopId/items/:itemId',
  authenticateToken,
  [
    param('shopId').isString().withMessage('Invalid shop ID'),
    param('itemId').isString().withMessage('Invalid item ID'),
    body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Item name must be 1-100 characters'),
    body('price').optional().isNumeric().withMessage('Price must be a valid number'),
    body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('weight').optional().isLength({ max: 50 }).withMessage('Weight must be under 50 characters'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description must be under 500 characters')
  ],
  handleValidationErrors,
  async (req, res) => {
  try {
    const { shopId, itemId } = req.params;
    const { name, price, quantity, weight, description, imageUrl } = req.body;
    
    const shops = await readShops();
    const shopIndex = shops.findIndex(shop => shop.id === shopId);

    if (shopIndex === -1) {
      return res.status(404).json({ message: 'Shop not found.' });
    }

    // Check ownership
    if (shops[shopIndex].ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only edit items in your own shops.' });
    }

    const itemIndex = shops[shopIndex].items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    shops[shopIndex].items[itemIndex] = {
      ...shops[shopIndex].items[itemIndex],
      name: name || shops[shopIndex].items[itemIndex].name,
      price: price !== undefined ? parseFloat(price) : shops[shopIndex].items[itemIndex].price,
      quantity: quantity !== undefined ? parseInt(quantity) : shops[shopIndex].items[itemIndex].quantity,
      weight: weight !== undefined ? weight : shops[shopIndex].items[itemIndex].weight,
      description: description !== undefined ? description : shops[shopIndex].items[itemIndex].description,
      imageUrl: imageUrl !== undefined ? imageUrl : shops[shopIndex].items[itemIndex].imageUrl
    };

    shops[shopIndex].updatedAt = new Date().toISOString();
    await writeShops(shops);
    res.json(shops[shopIndex].items[itemIndex]);
  } catch (error) {
    console.error('Update Item Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

app.delete('/api/shops/:shopId/items/:itemId',
  authenticateToken,
  [
    param('shopId').isString().withMessage('Invalid shop ID'),
    param('itemId').isString().withMessage('Invalid item ID')
  ],
  handleValidationErrors,
  async (req, res) => {
  try {
    const { shopId, itemId } = req.params;
    
    const shops = await readShops();
    const shopIndex = shops.findIndex(shop => shop.id === shopId);

    if (shopIndex === -1) {
      return res.status(404).json({ message: 'Shop not found.' });
    }

    // Check ownership
    if (shops[shopIndex].ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only delete items from your own shops.' });
    }

    const originalLength = shops[shopIndex].items.length;
    shops[shopIndex].items = shops[shopIndex].items.filter(item => item.id !== itemId);
    
    if (shops[shopIndex].items.length === originalLength) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    shops[shopIndex].updatedAt = new Date().toISOString();
    await writeShops(shops);
    res.json({ message: 'Item deleted successfully.' });
  } catch (error) {
    console.error('Delete Item Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

// Messages API endpoints  
app.get('/api/messages',
  authenticateToken,
  async (req, res) => {
  try {
    const messages = await readMessages();
    // Users can only see messages they sent or received
    const userMessages = messages.filter(msg => 
      msg.senderId === req.user.id || msg.receiverId === req.user.id
    );
    res.json(userMessages);
  } catch (error) {
    console.error('Get Messages Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

app.post('/api/messages',
  authenticateToken,
  [
    body('receiverId').trim().notEmpty().withMessage('Receiver ID is required'),
    body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Content must be 1-1000 characters'),
    body('type').optional().isIn(['text', 'image', 'file']).withMessage('Invalid message type')
  ],
  handleValidationErrors,
  async (req, res) => {
  try {
    const { receiverId, content, type } = req.body;
    const senderId = req.user.id; // Get from authenticated user
    
    const messages = await readMessages();
    const newMessage = {
      id: Date.now().toString(),
      senderId,
      receiverId,
      content,
      type: type || 'text',
      createdAt: new Date().toISOString(),
      read: false
    };

    messages.push(newMessage);
    await writeMessages(messages);
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

app.get('/api/messages/:userId',
  authenticateToken,
  param('userId').isString().withMessage('Invalid user ID'),
  handleValidationErrors,
  async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Users can only access messages where they are sender or receiver
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    
    const messages = await readMessages();
    const userMessages = messages.filter(msg => 
      msg.senderId === userId || msg.receiverId === userId
    );
    res.json(userMessages);
  } catch (error) {
    console.error('Get User Messages Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

// Orders API endpoints
// Public endpoint for creating orders (customers can place orders without authentication)
app.post('/api/orders',
  [
    body('shopId').trim().notEmpty().withMessage('Shop ID is required'),
    body('items').isArray({ min: 1 }).withMessage('Items array is required and must not be empty'),
    body('total').isNumeric().withMessage('Total must be a valid number'),
    body('paymentMethod').isIn(['credit-card', 'bitcoin', 'cash']).withMessage('Invalid payment method'),
    body('deliveryOption').isIn(['Ship2', 'Deaddrop']).withMessage('Invalid delivery option'),
    body('customerEmail').optional().isEmail().withMessage('Valid email is required'),
    body('deliveryAddress').optional().trim().isLength({ max: 500 }).withMessage('Delivery address must be under 500 characters')
  ],
  handleValidationErrors,
  async (req, res) => {
  try {
    const { shopId, customerId, customerEmail, items, total, paymentMethod, deliveryOption, deliveryCity, deliveryAddress, cryptoWallet } = req.body;
    
    // Verify the shop exists
    const shops = await readShops();
    const shop = shops.find(s => s.id === shopId);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found.' });
    }

    const orders = await readOrders();
    const newOrder = {
      id: Date.now().toString(),
      shopId,
      customerId: customerId || null,
      customerEmail: customerEmail || 'guest@example.com',
      items,
      total: parseFloat(total),
      paymentMethod,
      deliveryOption,
      deliveryCity: deliveryCity || '',
      deliveryAddress: deliveryAddress || '',
      cryptoWallet: cryptoWallet || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    orders.push(newOrder);
    await writeOrders(orders);
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

app.get('/api/orders/shop/:shopId',
  authenticateToken,
  param('shopId').isString().withMessage('Invalid shop ID'),
  handleValidationErrors,
  async (req, res) => {
  try {
    const { shopId } = req.params;
    
    // Verify user owns the shop
    const shops = await readShops();
    const shop = shops.find(s => s.id === shopId);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found.' });
    }
    
    if (shop.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only view orders for your own shops.' });
    }
    
    const orders = await readOrders();
    const shopOrders = orders.filter(order => order.shopId === shopId);
    res.json(shopOrders);
  } catch (error) {
    console.error('Get Shop Orders Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

app.get('/api/orders/customer/:customerId',
  authenticateToken,
  param('customerId').isString().withMessage('Invalid customer ID'),
  handleValidationErrors,
  async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Users can only access their own orders
    if (req.user.id !== customerId) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    
    const orders = await readOrders();
    const customerOrders = orders.filter(order => order.customerId === customerId);
    res.json(customerOrders);
  } catch (error) {
    console.error('Get Customer Orders Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

app.put('/api/orders/:id/status',
  authenticateToken,
  [
    param('id').isString().withMessage('Invalid order ID'),
    body('status').isIn(['pending', 'accepted', 'preparing', 'delivering', 'delivered', 'cancelled', 'refused']).withMessage('Invalid status')
  ],
  handleValidationErrors,
  async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const orders = await readOrders();
    const orderIndex = orders.findIndex(order => order.id === id);

    if (orderIndex === -1) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Verify user owns the shop for this order
    const shops = await readShops();
    const shop = shops.find(s => s.id === orders[orderIndex].shopId);
    if (!shop || shop.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only update orders for your own shops.' });
    }

    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date().toISOString();
    
    await writeOrders(orders);
    res.json(orders[orderIndex]);
  } catch (error) {
    console.error('Update Order Status Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

app.delete('/api/orders/:id',
  authenticateToken,
  param('id').isString().withMessage('Invalid order ID'),
  handleValidationErrors,
  async (req, res) => {
  try {
    const { id } = req.params;
    const orders = await readOrders();
    const order = orders.find(order => order.id === id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Verify user owns the shop for this order
    const shops = await readShops();
    const shop = shops.find(s => s.id === order.shopId);
    if (!shop || shop.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only delete orders for your own shops.' });
    }

    const filteredOrders = orders.filter(order => order.id !== id);
    await writeOrders(filteredOrders);
    res.json({ message: 'Order deleted successfully.' });
  } catch (error) {
    console.error('Delete Order Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

app.listen(PORT, () => {
  console.log(`Secure server running on http://localhost:${PORT}`);
});