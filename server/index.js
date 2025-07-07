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
const emailTransporter = nodemailer.createTransport({
  host: 'mail.privateemail.com',
  port: 465,
  secure: true, // SSL/TLS
  auth: {
    user: 'noreply@hiddenhaven.pro',
    pass: 'test123'
  }
});

// IMAP configuration for incoming emails
const imapConfig = {

  user: 'noreply@hiddenhaven.pro',
  password: 'test123', // Replace with your actual password
  host: 'mail.privateemail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};

// Notification service
const sendNotification = async (userId, type, title, message, data = {}) => {
  try {
    const users = await readUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) return;

    // Send email notification if enabled
    if (user.emailNotifications && user.email && user.emailConfirmed && type === 'email') {
      await emailTransporter.sendMail({
        from: 'noreply@hiddenhaven.pro',
        to: user.email,
        subject: title,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">${title}</h2>
            <p style="color: #666; line-height: 1.6;">${message}</p>
            ${data.content ? `<div style="background: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;"><p>${data.content}</p></div>` : ''}
            <hr style="margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">
              You received this notification because you have email notifications enabled. 
              You can disable them in your account settings.
            </p>
          </div>
        `
      });
    }

    console.log(`Notification sent to user ${userId}: ${title}`);
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};
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
      browserNotifications: false,
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
    const { username, displayName, email, emailNotifications, messageNotifications, showMessageContent, browserNotifications } = req.body;
    
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
      browserNotifications: browserNotifications !== undefined ? browserNotifications : users[userIndex].browserNotifications,
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
        from: 'noreply@hiddenhaven.pro',
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

// Email change request endpoint
app.post('/api/users/:id/request-email-change', async (req, res) => {
  try {
    const { id } = req.params;
    const { newEmail } = req.body;
    
    if (!newEmail) {
      return res.status(400).json({ message: 'New email is required.' });
    }

    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if email is already in use
    const emailExists = users.find(u => u.email === newEmail && u.id !== id);
    if (emailExists) {
      return res.status(409).json({ message: 'Email already in use by another account.' });
    }

    // Generate confirmation code
    const confirmationCode = Math.random().toString(36).substring(2, 15);
    
    users[userIndex].pendingEmail = newEmail;
    users[userIndex].emailChangeCode = confirmationCode;
    users[userIndex].updatedAt = new Date().toISOString();

    await writeUsers(users);

    // Send confirmation email to new address
    try {
      await emailTransporter.sendMail({
        from: 'noreply@hiddenhaven.pro',
        to: newEmail,
        subject: 'Confirm your new email address - Hidden Haven',
        html: `
          <h2>Confirm your new email address</h2>
          <p>You requested to change your email address for your Hidden Haven account.</p>
          <p>Your confirmation code is: <strong>${confirmationCode}</strong></p>
          <p>Enter this code in the app to confirm your new email address.</p>
          <p>If you didn't request this change, please ignore this email.</p>
        `
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue anyway - email might be configured incorrectly
    }

    res.json({ message: 'Confirmation code sent to new email address.' });
  } catch (error) {
    console.error('Email Change Request Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

// Email change confirmation endpoint
app.post('/api/users/:id/confirm-email-change', async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmationCode } = req.body;
    
    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === id && u.emailChangeCode === confirmationCode);
    
    if (userIndex === -1) {
      return res.status(400).json({ message: 'Invalid confirmation code.' });
    }

    if (!users[userIndex].pendingEmail) {
      return res.status(400).json({ message: 'No pending email change found.' });
    }

    // Update email
    users[userIndex].email = users[userIndex].pendingEmail;
    users[userIndex].emailConfirmed = true;
    delete users[userIndex].pendingEmail;
    delete users[userIndex].emailChangeCode;
    users[userIndex].updatedAt = new Date().toISOString();

    await writeUsers(users);
    
    const { password: _, ...userData } = users[userIndex];
    res.json({ message: 'Email address updated successfully.', user: userData });
  } catch (error) {
    console.error('Email Change Confirmation Error:', error);
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

// Message image upload endpoint
app.post('/api/upload-message-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    console.error('Upload Message Image Error:', error);
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

// Enhanced message sending with notifications
app.post('/api/messages', async (req, res) => {
  try {
    const { senderId, receiverId, content, type, imageUrl } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: 'Sender ID and receiver ID are required.' });
    }

    const messages = await readMessages();
    const newMessage = {
      id: Date.now().toString(),
      senderId,
      receiverId,
      content: content || '',
      type: type || 'text',
      imageUrl: imageUrl || null,
      createdAt: new Date().toISOString(),
      read: false
    };

    messages.push(newMessage);
    await writeMessages(messages);

    // Send notification to receiver
    const users = await readUsers();
    const receiver = users.find(u => u.id === receiverId);
    const sender = users.find(u => u.id === senderId);
    
    if (receiver && sender && receiver.messageNotifications && content) {
      await sendNotification(
        receiverId, 
        'email', 
        'New Message from ' + (sender.displayName || sender.username),
        receiver.showMessageContent 
          ? content.substring(0, 100) + (content.length > 100 ? '...' : '')
          : 'You have received a new message',
        { messageId: newMessage.id, senderName: sender.displayName || sender.username }
      );
    }

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

    // Get shop and owner info
    const shops = await readShops();
    const shop = shops.find(s => s.id === shopId);
    
    if (shop) {
      // Send notification to shop owner
      const orderSummary = items.map(item => `${item.name} x${item.cartQuantity}`).join(', ');
      await sendNotification(
        shop.ownerId,
        'email',
        'New Order Received',
        `You have a new order for $${total}. Items: ${orderSummary}.`,
        { orderId: newOrder.id, shopId, total }
      );

      // Send order message to shop owner from customer
      const messages = await readMessages();
      const orderMessage = {
        id: Date.now().toString() + '_order',
        senderId: customerId || 'guest',
        receiverId: shop.ownerId,
        content: `New order #${newOrder.id} - $${total}. Items: ${orderSummary}. View details: http://localhost:5173/order-management`,
        type: 'text',
        imageUrl: null,
        createdAt: new Date().toISOString(),
        read: false
      };
      messages.push(orderMessage);
      await writeMessages(messages);
    }

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

    const oldStatus = orders[orderIndex].status;
    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date().toISOString();
    
    await writeOrders(orders);

    // Send notification to customer if they have an account
    const order = orders[orderIndex];
    if (order.customerId) {
      await sendNotification(
        order.customerId,
        'email',
        `Order Status Updated`,
        `Your order #${order.id} status has been updated from ${oldStatus} to ${status}.`,
        { orderId: order.id, oldStatus, newStatus: status }
      );
    }

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

// User search endpoint
app.get('/api/users/search/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const users = await readUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (user) {
      res.json({ id: user.id, username: user.username });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (for messaging)
app.get('/api/users', async (req, res) => {
  try {
    const users = await readUsers();
    const publicUsers = users.map(u => ({ id: u.id, username: u.username }));
    res.json(publicUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's pending orders count
app.get('/api/orders/user/:userId/summary', async (req, res) => {
  try {
    const { userId } = req.params;
    const shops = await readShops();
    const userShops = shops.filter(shop => shop.ownerId === userId);
    
    if (userShops.length === 0) {
      return res.json({ 
        pendingOrders: 0, 
        totalOrders: 0, 
        recentOrders: [] 
      });
    }

    const orders = await readOrders();
    const userOrders = orders.filter(order => 
      userShops.some(shop => shop.id === order.shopId)
    );

    const pendingOrders = userOrders.filter(order => order.status === 'pending').length;
    
    res.json({ 
      pendingOrders, 
      totalOrders: userOrders.length,
      recentOrders: userOrders.slice(-5).reverse()
    });
  } catch (error) {
    console.error('Get order summary error:', error);
    res.status(500).json({ 
      message: 'Server error',
      pendingOrders: 0, 
      totalOrders: 0, 
      recentOrders: [] 
    });
  }
});

// Email notification endpoint
app.post('/api/notifications/email', async (req, res) => {
  try {
    const { userId, title, message, data } = req.body;
    await sendNotification(userId, 'email', title, message, data);
    res.json({ success: true });
  } catch (error) {
    console.error('Email notification error:', error);
    res.status(500).json({ message: 'Failed to send notification' });
  }
});

app.listen(PORT, () => {
  console.log(`Secure server running on http://localhost:${PORT}`);
});