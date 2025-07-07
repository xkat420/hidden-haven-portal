const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Database = require('./utils/database');

const app = express();
const PORT = 3003;

app.use(cors());
app.use(express.json());

// Email transporter setup
const emailTransporter = nodemailer.createTransport({
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
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%); color: white; border-radius: 12px; overflow: hidden;">
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #a855f7; font-size: 24px; margin: 0; font-weight: bold;">Hidden Haven</h1>
              <p style="color: #d1d5db; margin: 5px 0 0 0; font-size: 14px;">Secure Platform</p>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; padding: 30px; margin: 20px 0;">
              <h2 style="color: #fbbf24; margin: 0 0 15px 0; font-size: 20px;">${title}</h2>
              <p style="color: #f3f4f6; line-height: 1.6; margin: 15px 0;">${message}</p>
              
              ${data.orderId ? `
                <div style="background: rgba(168, 85, 247, 0.2); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 8px; padding: 15px; margin: 20px 0;">
                  <p style="color: #e5e7eb; margin: 0;"><strong>Order ID:</strong> #${data.orderId}</p>
                </div>
              ` : ''}
              
              ${data.orderDetails ? `
                <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <h3 style="color: #10b981; margin: 0 0 15px 0;">Order Details:</h3>
                  <div style="color: #f3f4f6;">${data.orderDetails}</div>
                </div>
              ` : ''}
              
              ${data.orderId ? `
                <div style="text-align: center; margin: 30px 0 20px 0;">
                  <a href="http://localhost:5173/orders" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; border: 1px solid rgba(168, 85, 247, 0.3); transition: all 0.3s ease;">
                    📦 View Order Status
                  </a>
                </div>
              ` : ''}
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                You received this email because you have notifications enabled in your Hidden Haven account.
              </p>
            </div>
          </div>
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
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%); color: white; border-radius: 12px; overflow: hidden;">
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #a855f7; font-size: 24px; margin: 0; font-weight: bold;">Hidden Haven</h1>
                <p style="color: #d1d5db; margin: 5px 0 0 0; font-size: 14px;">Secure Platform</p>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; padding: 30px; margin: 20px 0;">
                <h2 style="color: #10b981; margin: 0 0 15px 0; font-size: 22px;">🎉 New Order Received!</h2>
                <p style="color: #f3f4f6; line-height: 1.6; margin: 15px 0;">You have received a new order for your shop "<strong>${shop.name}</strong>".</p>
                
                <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <h3 style="color: #10b981; margin: 0 0 15px 0;">Order #${orderId}</h3>
                  <div style="color: #f3f4f6;">${orderDetails}</div>
                </div>
                
                <div style="text-align: center; margin: 30px 0 20px 0;">
                  <a href="http://localhost:5173/order-management" style="display: inline-block; background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; border: 1px solid rgba(16, 185, 129, 0.3); margin-right: 10px;">
                    🛠️ Manage Order
                  </a>
                  <a href="http://localhost:5173/messages" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; border: 1px solid rgba(168, 85, 247, 0.3);">
                    💬 Message Customer
                  </a>
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  You received this email because you have order notifications enabled in your Hidden Haven account.
                </p>
              </div>
            </div>
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