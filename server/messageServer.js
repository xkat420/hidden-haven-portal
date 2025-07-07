const express = require('express');
const cors = require('cors');
const Database = require('./utils/database');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Get messages for a user
app.get('/api/messages/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Database.getMessages();
    const userMessages = messages.filter(msg => 
      msg.senderId === userId || msg.receiverId === userId
    );
    res.json(userMessages);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
app.post('/api/messages', async (req, res) => {
  try {
    const { senderId, receiverId, content, type = 'text', metadata = {} } = req.body;
    
    const messages = await Database.getMessages();
    const newMessage = {
      id: Date.now().toString(),
      senderId,
      receiverId,
      content,
      type,
      metadata,
      read: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    messages.push(newMessage);
    await Database.saveMessages(messages);
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Failed to send message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark message as read
app.put('/api/messages/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params;
    const messages = await Database.getMessages();
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex === -1) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    messages[messageIndex].read = true;
    messages[messageIndex].updatedAt = new Date().toISOString();
    
    await Database.saveMessages(messages);
    res.json(messages[messageIndex]);
  } catch (error) {
    console.error('Failed to mark message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// Get user contacts (users who have messaged each other)
app.get('/api/contacts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Database.getMessages();
    const users = await Database.getUsers();
    
    const contactIds = new Set();
    messages.forEach(msg => {
      if (msg.senderId === userId) contactIds.add(msg.receiverId);
      if (msg.receiverId === userId) contactIds.add(msg.senderId);
    });
    
    const contacts = users.filter(user => contactIds.has(user.id));
    res.json(contacts);
  } catch (error) {
    console.error('Failed to fetch contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

app.listen(PORT, () => {
  console.log(`Message server running on port ${PORT}`);
});

module.exports = app;