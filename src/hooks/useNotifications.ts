import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

interface NotificationData {
  title: string
  body: string
  icon?: string
  data?: Record<string, any>
}

export const useNotifications = () => {
  const { user } = useAuth()

  const sendBrowserNotification = (notification: NotificationData) => {
    if (!user?.browserNotifications) return

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon || '/favicon.ico',
        data: notification.data,
        tag: 'hidden-haven',
        requireInteraction: false
      })
    }
  }

  const sendEmailNotification = async (notification: NotificationData) => {
    if (!user?.emailNotifications || !user?.email || !user?.emailConfirmed) return

    try {
      await fetch('http://localhost:3003/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: notification.title,
          message: notification.body,
          data: notification.data
        })
      })
    } catch (error) {
      console.error('Failed to send email notification:', error)
    }
  }

  const sendNotification = (notification: NotificationData) => {
    sendBrowserNotification(notification)
    sendEmailNotification(notification)
  }

  // Listen for new messages and orders
  useEffect(() => {
    if (!user) return

    const checkForNotifications = async () => {
      try {
        // Check for new messages
        const messageResponse = await fetch(`http://localhost:3002/api/messages/${user.id}`)
        const messages = await messageResponse.json()
        
        // Store last checked timestamp in localStorage
        const lastChecked = localStorage.getItem('lastMessageCheck')
        const lastCheckedTime = lastChecked ? new Date(lastChecked) : new Date(0)
        
        const newMessages = messages.filter((msg: any) => 
          new Date(msg.createdAt) > lastCheckedTime && 
          msg.receiverId === user.id &&
          !msg.read
        )

        if (newMessages.length > 0) {
          const latestMessage = newMessages[newMessages.length - 1]
          sendNotification({
            title: 'New Message',
            body: (user as any).showMessageContent 
              ? `${latestMessage.content.substring(0, 50)}${latestMessage.content.length > 50 ? '...' : ''}`
              : 'You have received a new message',
            data: { messageId: latestMessage.id, senderId: latestMessage.senderId }
          })
        }

        // Check for new orders
        const orderSummaryResponse = await fetch(`http://localhost:3001/api/orders/user/${user.id}/summary`)
        const orderSummary = await orderSummaryResponse.json()
        
        const lastOrderCheck = localStorage.getItem('lastOrderCheck')
        const lastOrderTime = lastOrderCheck ? new Date(lastOrderCheck) : new Date(0)
        
        // Check if there are recent orders
        const recentOrders = orderSummary.recentOrders?.filter((order: any) => 
          new Date(order.createdAt) > lastOrderTime
        ) || []

        if (recentOrders.length > 0) {
          const latestOrder = recentOrders[recentOrders.length - 1]
          sendNotification({
            title: 'New Order Received',
            body: `New order for $${latestOrder.total} from ${latestOrder.customerEmail}`,
            data: { orderId: latestOrder.id, type: 'order' }
          })
        }

        localStorage.setItem('lastMessageCheck', new Date().toISOString())
        localStorage.setItem('lastOrderCheck', new Date().toISOString())
      } catch (error) {
        console.error('Failed to check for notifications:', error)
      }
    }

    // Check every 30 seconds
    const interval = setInterval(checkForNotifications, 30000)
    
    return () => clearInterval(interval)
  }, [user])

  return {
    sendNotification,
    sendBrowserNotification,
    sendEmailNotification
  }
}