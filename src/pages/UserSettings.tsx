import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useToast } from '../hooks/use-toast';
import { User, Settings, Bell, Mail, Upload, Save, Shield, Check, X, Camera } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  profileImage: string;
  emailConfirmed: boolean;
  emailNotifications: boolean;
  messageNotifications: boolean;
  showMessageContent: boolean;
}

export default function UserSettings() {
  const { user, login } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    email: '',
    emailNotifications: true,
    messageNotifications: true,
    showMessageContent: true
  });
  const [emailConfirmation, setEmailConfirmation] = useState({
    pending: false,
    newEmail: '',
    confirmationCode: ''
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/users/${user?.id}`);
      if (response.ok) {
        const userData = await response.json();
        setProfile(userData);
        setFormData({
          username: userData.username,
          displayName: userData.displayName,
          email: userData.email,
          emailNotifications: userData.emailNotifications,
          messageNotifications: userData.messageNotifications,
          showMessageContent: userData.showMessageContent
        });
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:3001/api/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setProfile(updatedUser);
        login(updatedUser); // Update auth context
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('avatar', file);

    try {
      const response = await fetch(`http://localhost:3001/api/users/${user?.id}/upload-avatar`, {
        method: 'POST',
        body: uploadFormData
      });

      if (response.ok) {
        const result = await response.json();
        setProfile(prev => prev ? { ...prev, profileImage: result.imageUrl } : null);
        toast({
          title: "Success",
          description: "Profile image updated successfully",
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({
          title: "Success",
          description: "Notifications enabled successfully",
        });
      } else {
        toast({
          title: "Info",
          description: "Notification permission denied",
          variant: "destructive",
        });
      }
    }
  };

  const requestEmailChange = async (newEmail: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/users/${user?.id}/request-email-change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail })
      });

      if (response.ok) {
        setEmailConfirmation({ pending: true, newEmail, confirmationCode: '' });
        toast({
          title: "Confirmation sent",
          description: `A confirmation code has been sent to ${newEmail}`,
        });
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send confirmation",
        variant: "destructive",
      });
    }
  };

  const confirmEmailChange = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/users/${user?.id}/confirm-email-change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationCode: emailConfirmation.confirmationCode })
      });

      if (response.ok) {
        const data = await response.json();
        login(data.user);
        setEmailConfirmation({ pending: false, newEmail: '', confirmationCode: '' });
        fetchUserProfile();
        toast({
          title: "Success",
          description: "Email address updated successfully!",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Invalid confirmation code",
        variant: "destructive",
      });
    }
  };

  const unsubscribeEmail = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: '',
          emailNotifications: false,
          emailConfirmed: false
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        login(updatedUser);
        setFormData(prev => ({ ...prev, email: '', emailNotifications: false }));
        toast({
          title: "Success",
          description: "Email unsubscribed and removed from account",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unsubscribe email",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 cyber-btn">User Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and security settings</p>
        </div>

        <div className="grid gap-6">
          {/* Profile Section */}
          <Card className="glass cyber-btn hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your profile picture and basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative pulse-ring">
                  <Avatar className="h-24 w-24">
                    <AvatarImage 
                      src={profile?.profileImage ? `http://localhost:3001${profile.profileImage}` : undefined} 
                      alt="Profile" 
                    />
                    <AvatarFallback>{profile?.displayName?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 cyber-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                
                <div className="flex-1 space-y-4 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        className="mt-1 glass focus:shadow-glow transition-all duration-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={formData.displayName}
                        onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                        className="mt-1 glass focus:shadow-glow transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Section */}
          <Card className="glass cyber-btn hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Management
              </CardTitle>
              <CardDescription>Configure your email address and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Email Status */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Current Email</p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.email || 'No email set'}
                  </p>
                  {profile?.email && (
                    <Badge variant={profile?.emailConfirmed ? "default" : "secondary"} className="mt-1">
                      {profile?.emailConfirmed ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Verified
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3 mr-1" />
                          Unverified
                        </>
                      )}
                    </Badge>
                  )}
                </div>
                {profile?.email && (
                  <Button variant="destructive" size="sm" onClick={unsubscribeEmail}>
                    Remove Email
                  </Button>
                )}
              </div>

              {/* Email Change Form */}
              {!emailConfirmation.pending ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="newEmail">
                      {profile?.email ? 'Change Email Address' : 'Set Email Address'}
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="newEmail"
                        type="email"
                        placeholder="Enter new email address"
                        value={emailConfirmation.newEmail}
                        onChange={(e) => setEmailConfirmation(prev => ({ ...prev, newEmail: e.target.value }))}
                        className="glass focus:shadow-glow transition-all duration-300"
                      />
                      <Button 
                        onClick={() => requestEmailChange(emailConfirmation.newEmail)}
                        disabled={!emailConfirmation.newEmail}
                      >
                        {profile?.email ? 'Change' : 'Add'}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-3">
                      <p>Confirmation code sent to <strong>{emailConfirmation.newEmail}</strong></p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter confirmation code"
                          value={emailConfirmation.confirmationCode}
                          onChange={(e) => setEmailConfirmation(prev => ({ ...prev, confirmationCode: e.target.value }))}
                        />
                        <Button onClick={confirmEmailChange} disabled={!emailConfirmation.confirmationCode}>
                          Confirm
                        </Button>
                        <Button variant="outline" onClick={() => setEmailConfirmation({ pending: false, newEmail: '', confirmationCode: '' })}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive updates about orders and messages</p>
                </div>
                <Switch
                  checked={formData.emailNotifications}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emailNotifications: checked }))}
                  disabled={!profile?.email || !profile?.emailConfirmed}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="glass cyber-btn hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Control how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified about new messages</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.messageNotifications}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, messageNotifications: checked }))}
                  />
                  {Notification.permission !== 'granted' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={requestNotificationPermission}
                      className="cyber-btn"
                    >
                      Enable
                    </Button>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Message Content</Label>
                  <p className="text-sm text-muted-foreground">Display message preview in notifications</p>
                </div>
                <Switch
                  checked={formData.showMessageContent}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showMessageContent: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="cyber-btn px-8 animate-glow-pulse"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}