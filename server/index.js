const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;

const app = express();
const PORT = 3001;
const DB_PATH = './users.json';

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

app.listen(PORT, () => {
  console.log(`Secure server running on http://localhost:${PORT}`);
});