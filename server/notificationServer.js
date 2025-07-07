const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Database = require('./utils/database');

const app = express();
const PORT = 3003;

app.use(cors());
app.use(express.json());

// Email transporter setup
const emailTransporter = nodemailer.createTransporter({
  host: 'mail.privateemail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'noreply@hiddenhaven.pro',
    pass: 'test123'
  }
});

// Send email notification
app.post('/api/notifications/email', async (req, res) => {
  try {
    const { userId, title, message, data = {} } = req.body;
    
    const user = await Database.getUserById(userId);
    if (!user || !user.emailConfirmed || !user.emailNotifications) {
      return res.status(400).json({ error: 'User not eligible for email notifications' });
    }
    
    const mailOptions = {
      from: '"Hidden Haven" <noreply@hiddenhaven.pro>',
      to: user.email,
      subject: title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">${title}</h2>
          <p>${message}</p>
          ${data.orderId ? `<p>Order ID: <strong>#${data.orderId}</strong></p>` : ''}
          ${data.orderDetails ? `<div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3>Order Details:</h3>
            ${data.orderDetails}
          </div>` : ''}
          <hr style="margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            You received this email because you have notifications enabled in your Hidden Haven account.
          </p>
        </div>
      `
    };
    
    await emailTransporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to send email notification:', error);
    res.status(500).json({ error: 'Failed to send email notification' });
  }
});

// Send order notification to shop owner
app.post('/api/notifications/order', async (req, res) => {
  try {
    const { orderId, shopId, type, customMessage } = req.body;
    
    const shop = await Database.getShopById(shopId);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    
    const owner = await Database.getUserById(shop.ownerId);
    if (!owner) {
      return res.status(404).json({ error: 'Shop owner not found' });
    }
    
    // Send message to shop owner
    const messages = await Database.getMessages();
    const systemMessage = {
      id: Date.now().toString(),
      senderId: 'system',
      receiverId: owner.id,
      content: customMessage || `New order #${orderId} received`,
      type: 'order-notification',
      metadata: {
        orderId,
        shopId,
        notificationType: type
      },
      read: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    messages.push(systemMessage);
    await Database.saveMessages(messages);
    
    // Send email if enabled
    if (owner.emailNotifications && owner.emailConfirmed) {
      const order = (await Database.getOrders()).find(o => o.id === orderId);
      const orderDetails = order ? `
        <p><strong>Customer:</strong> ${order.customerEmail}</p>
        <p><strong>Total:</strong> $${order.total}</p>
        <p><strong>Items:</strong> ${order.items.map(item => `${item.name} x${item.cartQuantity}`).join(', ')}</p>
      ` : '';
      
      await emailTransporter.sendMail({
        from: '"Hidden Haven" <noreply@hiddenhaven.pro>',
        to: owner.email,
        subject: `New Order #${orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Order Received</h2>
            <p>You have received a new order for your shop "${shop.name}".</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h3>Order #${orderId}</h3>
              ${orderDetails}
            </div>
            <p><a href="http://localhost:5173/order-management" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Manage Order</a></p>
          </div>
        `
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to send order notification:', error);
    res.status(500).json({ error: 'Failed to send order notification' });
  }
});

app.listen(PORT, () => {
  console.log(`Notification server running on port ${PORT}`);
});

module.exports = app;