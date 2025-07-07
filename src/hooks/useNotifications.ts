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
      await fetch('http://localhost:3001/api/notifications/email', {
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

  // Listen for new messages
  useEffect(() => {
    if (!user) return

    const checkForNewMessages = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/messages/${user.id}`)
        const messages = await response.json()
        
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

        localStorage.setItem('lastMessageCheck', new Date().toISOString())
      } catch (error) {
        console.error('Failed to check for new messages:', error)
      }
    }

    // Check every 30 seconds
    const interval = setInterval(checkForNewMessages, 30000)
    
    return () => clearInterval(interval)
  }, [user])

  return {
    sendNotification,
    sendBrowserNotification,
    sendEmailNotification
  }
}