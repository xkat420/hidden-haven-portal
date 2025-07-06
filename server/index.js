const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;

const app = express();
const PORT = 3001;
const DB_PATH = './users.json';
const SHOPS_PATH = './shops.json';
const MESSAGES_PATH = './messages.json';

// A simple, hardcoded list of valid invitation codes.
const VALID_INVITE_CODES = ['SECRET-CODE-123', 'ALPHA-INVITE-789'];

app.use(cors());
app.use(express.json());

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
    const { name, description, isPublic, accessCode, shopStyle, deliveryCities } = req.body;
    
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

app.listen(PORT, () => {
  console.log(`Secure server running on http://localhost:${PORT}`);
});