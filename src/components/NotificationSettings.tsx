import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Bell } from "lucide-react"

export function NotificationSettings() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>("default")
  const [settings, setSettings] = useState({
    emailNotifications: user?.emailNotifications || false,
    messageNotifications: user?.messageNotifications || false,
    showMessageContent: user?.showMessageContent || false,
    browserNotifications: false
  })

  useEffect(() => {
    // Check current browser notification permission
    if ("Notification" in window) {
      setBrowserPermission(Notification.permission)
      setSettings(prev => ({
        ...prev,
        browserNotifications: Notification.permission === "granted"
      }))
    }
  }, [])

  const requestBrowserPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      setBrowserPermission(permission)
      setSettings(prev => ({
        ...prev,
        browserNotifications: permission === "granted"
      }))
      
      if (permission === "granted") {
        toast({
          title: "Browser notifications enabled",
          description: "You'll now receive notifications in your browser."
        })
        // Test notification
        new Notification("Hidden Haven", {
          body: "Browser notifications are now enabled!",
          icon: "/favicon.ico"
        })
      }
    }
  }

  const updateSettings = async (key: string, value: boolean) => {
    if (!user) return

    try {
      const updatedSettings = { ...settings, [key]: value }
      setSettings(updatedSettings)

      // Update user settings on server
      const response = await fetch(`http://localhost:3001/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailNotifications: updatedSettings.emailNotifications,
          messageNotifications: updatedSettings.messageNotifications,
          showMessageContent: updatedSettings.showMessageContent
        })
      })

      if (response.ok) {
        const updatedUser = await response.json()
        updateUser(updatedUser)
        toast({
          title: "Settings updated",
          description: "Your notification preferences have been saved."
        })
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Configure how you want to receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => updateSettings('emailNotifications', checked)}
              disabled={!user?.email || !user?.emailConfirmed}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="message-notifications">Message Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when you receive messages
              </p>
            </div>
            <Switch
              id="message-notifications"
              checked={settings.messageNotifications}
              onCheckedChange={(checked) => updateSettings('messageNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-content">Show Message Content</Label>
              <p className="text-sm text-muted-foreground">
                Display message content in notifications
              </p>
            </div>
            <Switch
              id="show-content"
              checked={settings.showMessageContent}
              onCheckedChange={(checked) => updateSettings('showMessageContent', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="browser-notifications">Browser Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications in your browser
              </p>
            </div>
            <div className="flex items-center gap-2">
              {browserPermission === "granted" ? (
                <Switch
                  id="browser-notifications"
                  checked={settings.browserNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, browserNotifications: checked }))}
                />
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestBrowserPermission}
                  disabled={browserPermission === "denied"}
                >
                  {browserPermission === "denied" ? "Blocked" : "Enable"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {(!user?.email || !user?.emailConfirmed) && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Email notifications require a confirmed email address. 
              Please set and confirm your email in User Settings.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}