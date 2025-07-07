const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = 3001;
const DB_PATH = './users.json';
const SHOPS_PATH = './shops.json';
const MESSAGES_PATH = './messages.json';
const ORDERS_PATH = './orders.json';
const UPLOADS_DIR = './uploads';

// Create uploads directory if it doesn't exist
fs.mkdir(UPLOADS_DIR, { recursive: true }).catch(console.error);

// A simple, hardcoded list of valid invitation codes.
const VALID_INVITE_CODES = ['SECRET-CODE-123', 'ALPHA-INVITE-789'];

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Email transporter setup for contact@louve.pro
const emailTransporter = nodemailer.createTransporter({
  host: 'mail.privateemail.com',
  port: 465,
  secure: true, // SSL/TLS
  auth: {
    user: 'contact@louve.pro',
    pass: 'YOUR_EMAIL_PASSWORD' // Replace with your actual password
  }
});

// Configure CORS to allow both typical ports
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Add debugging middleware for all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

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

app.post('/api/register', async (req, res) => {
  try {
    const { username, password, inviteCode } = req.body;

    if (!username || !password || !inviteCode) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }
    if (!VALID_INVITE_CODES.includes(inviteCode)) {
      return res.status(400).json({ message: 'Invalid invitation code.' });
    }

    const users = await readUsers();
    const userExists = users.find(user => user.username === username);

    if (userExists) {
      return res.status(409).json({ message: 'An account with this username already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: Date.now().toString(),
      username,
      password: hashedPassword,
      displayName: username,
      email: '',
      profileImage: '',
      emailConfirmed: false,
      emailNotifications: true,
      messageNotifications: true,
      showMessageContent: true,
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

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const users = await readUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
      // Use a generic message for security to prevent username enumeration
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // Use a generic message for security
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Login successful. Prepare user data to send back.
    // IMPORTANT: Never send the password hash back to the client.
    const { password: _, ...userData } = user;

    res.status(200).json({
      message: 'Login successful!',
      user: userData
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

// User profile management endpoints
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const users = await readUsers();
    const user = users.find(u => u.id === id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    const { password: _, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error('Get User Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, displayName, email, emailNotifications, messageNotifications, showMessageContent } = req.body;
    
    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if username is being changed and if it's already taken
    if (username && username !== users[userIndex].username) {
      const existingUser = users.find(u => u.username === username && u.id !== id);
      if (existingUser) {
        return res.status(409).json({ message: 'Username already taken.' });
      }
    }

    users[userIndex] = {
      ...users[userIndex],
      username: username || users[userIndex].username,
      displayName: displayName !== undefined ? displayName : users[userIndex].displayName,
      email: email !== undefined ? email : users[userIndex].email,
      emailNotifications: emailNotifications !== undefined ? emailNotifications : users[userIndex].emailNotifications,
      messageNotifications: messageNotifications !== undefined ? messageNotifications : users[userIndex].messageNotifications,
      showMessageContent: showMessageContent !== undefined ? showMessageContent : users[userIndex].showMessageContent,
      updatedAt: new Date().toISOString()
    };

    await writeUsers(users);
    const { password: _, ...userData } = users[userIndex];
    res.json(userData);
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

app.post('/api/users/:id/upload-avatar', upload.single('avatar'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    users[userIndex].profileImage = imageUrl;
    users[userIndex].updatedAt = new Date().toISOString();

    await writeUsers(users);
    res.json({ imageUrl });
  } catch (error) {
    console.error('Upload Avatar Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

app.post('/api/users/:id/confirm-email', async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Generate confirmation code
    const confirmationCode = Math.random().toString(36).substring(2, 15);
    
    users[userIndex].email = email;
    users[userIndex].emailConfirmationCode = confirmationCode;
    users[userIndex].updatedAt = new Date().toISOString();

    await writeUsers(users);

    // Send confirmation email
    try {
      await emailTransporter.sendMail({
        from: 'noreply@hiddenhaven.com',
        to: email,
        subject: 'Confirm your email address',
        html: `
          <h2>Confirm your email address</h2>
          <p>Please click the link below to confirm your email address:</p>
          <a href="http://localhost:8080/confirm-email?code=${confirmationCode}&user=${id}">Confirm Email</a>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue anyway - email might be configured incorrectly
    }

    res.json({ message: 'Confirmation email sent.' });
  } catch (error) {
    console.error('Email Confirmation Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

app.post('/api/confirm-email', async (req, res) => {
  try {
    const { code, userId } = req.body;
    
    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === userId && u.emailConfirmationCode === code);
    
    if (userIndex === -1) {
      return res.status(400).json({ message: 'Invalid confirmation code.' });
    }

    users[userIndex].emailConfirmed = true;
    delete users[userIndex].emailConfirmationCode;
    users[userIndex].updatedAt = new Date().toISOString();

    await writeUsers(users);
    res.json({ message: 'Email confirmed successfully.' });
  } catch (error) {
    console.error('Email Confirmation Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

// Shop access code endpoint
app.post('/api/shops/:slug/verify-access', async (req, res) => {
  try {
    const { slug } = req.params;
    const { accessCode } = req.body;
    
    const shops = await readShops();
    const shop = shops.find(s => s.slug === slug);
    
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found.' });
    }

    if (shop.isPublic || !shop.accessCode) {
      return res.json({ authorized: true });
    }

    if (shop.accessCode === accessCode) {
      return res.json({ authorized: true });
    }

    return res.status(401).json({ authorized: false, message: 'Invalid access code.' });
  } catch (error) {
    console.error('Shop Access Verification Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

// Shop API endpoints
app.post('/api/shops', async (req, res) => {
  try {
    const { name, slug, description, isPublic, ownerId } = req.body;
    
    if (!name || !slug || !ownerId) {
      return res.status(400).json({ message: 'Name, slug, and owner ID are required.' });
    }

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

app.get('/api/shops/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const shops = await readShops();
    const userShops = shops.filter(shop => shop.ownerId === userId);
    res.json(userShops);
  } catch (error) {
    console.error('Get User Shops Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

app.get('/api/shops/slug/:slug', async (req, res) => {
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

app.put('/api/shops/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isPublic, accessCode, shopStyle, deliveryCities, paymentMethods, deliveryOptions, cryptoWallets, shopColors } = req.body;
    
    const shops = await readShops();
    const shopIndex = shops.findIndex(shop => shop.id === id);

    if (shopIndex === -1) {
      return res.status(404).json({ message: 'Shop not found.' });
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

app.delete('/api/shops/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const shops = await readShops();
    const filteredShops = shops.filter(shop => shop.id !== id);
    
    if (shops.length === filteredShops.length) {
      return res.status(404).json({ message: 'Shop not found.' });
    }

    await writeShops(filteredShops);
    res.json({ message: 'Shop deleted successfully.' });
  } catch (error) {
    console.error('Delete Shop Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

app.post('/api/shops/:id/items', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, quantity, weight, description } = req.body;
    
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required.' });
    }

    const shops = await readShops();
    const shopIndex = shops.findIndex(shop => shop.id === id);

    if (shopIndex === -1) {
      return res.status(404).json({ message: 'Shop not found.' });
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

app.put('/api/shops/:shopId/items/:itemId', async (req, res) => {
  try {
    const { shopId, itemId } = req.params;
    const { name, price, quantity, weight, description, imageUrl } = req.body;
    
    const shops = await readShops();
    const shopIndex = shops.findIndex(shop => shop.id === shopId);

    if (shopIndex === -1) {
      return res.status(404).json({ message: 'Shop not found.' });
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

app.delete('/api/shops/:shopId/items/:itemId', async (req, res) => {
  try {
    const { shopId, itemId } = req.params;
    
    const shops = await readShops();
    const shopIndex = shops.findIndex(shop => shop.id === shopId);

    if (shopIndex === -1) {
      return res.status(404).json({ message: 'Shop not found.' });
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
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await readMessages();
    res.json(messages);
  } catch (error) {
    console.error('Get Messages Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { senderId, receiverId, content, type } = req.body;
    
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ message: 'Sender ID, receiver ID, and content are required.' });
    }

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

app.get('/api/messages/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
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
app.post('/api/orders', async (req, res) => {
  try {
    const { shopId, customerId, customerEmail, items, total, paymentMethod, deliveryOption, deliveryCity, deliveryAddress, cryptoWallet } = req.body;
    
    if (!shopId || !items || !total || !paymentMethod || !deliveryOption) {
      return res.status(400).json({ message: 'Required fields missing.' });
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

app.get('/api/orders/shop/:shopId', async (req, res) => {
  try {
    const { shopId } = req.params;
    const orders = await readOrders();
    const shopOrders = orders.filter(order => order.shopId === shopId);
    res.json(shopOrders);
  } catch (error) {
    console.error('Get Shop Orders Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

app.get('/api/orders/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const orders = await readOrders();
    const customerOrders = orders.filter(order => order.customerId === customerId);
    res.json(customerOrders);
  } catch (error) {
    console.error('Get Customer Orders Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'accepted', 'preparing', 'delivering', 'delivered', 'cancelled', 'refused'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const orders = await readOrders();
    const orderIndex = orders.findIndex(order => order.id === id);

    if (orderIndex === -1) {
      return res.status(404).json({ message: 'Order not found.' });
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

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const orders = await readOrders();
    const filteredOrders = orders.filter(order => order.id !== id);
    
    if (orders.length === filteredOrders.length) {
      return res.status(404).json({ message: 'Order not found.' });
    }

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