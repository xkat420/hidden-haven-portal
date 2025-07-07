import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { Send, MessageCircle, Upload, Image, FileText } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  createdAt: string;
  read: boolean;
}

interface User {
  id: string;
  username: string;
}

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { sendBrowserNotification } = useNotifications();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [newContactUsername, setNewContactUsername] = useState('');

  useEffect(() => {
    if (user) {
      fetchMessages();
      fetchUsers();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/messages/${user?.id}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const addNewContact = async () => {
    if (!newContactUsername.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/users/search/${newContactUsername}`);
      if (response.ok) {
        const userData = await response.json();
        if (!users.find(u => u.id === userData.id)) {
          setUsers([...users, userData]);
        }
        setSelectedUser(userData.id);
        setNewContactUsername('');
        toast({
          title: "Success",
          description: "Contact added successfully"
        });
      } else {
        toast({
          title: "Error",
          description: "User doesn't exist",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search user",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) {
      toast({
        title: "Error",
        description: "Please select a recipient and enter a message",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: user?.id,
          receiverId: selectedUser,
          content: newMessage,
          type: 'text'
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Message sent successfully"
        });
        setNewMessage('');
        fetchMessages();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedUser) return;

    // In a real app, you'd upload the file to a storage service
    // For now, we'll just send a text message indicating a file was shared
    const fileMessage = `[File shared: ${file.name}]`;
    
    try {
      const response = await fetch('http://localhost:3001/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: user?.id,
          receiverId: selectedUser,
          content: fileMessage,
          type: file.type.startsWith('image/') ? 'image' : 'file'
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "File shared successfully"
        });
        fetchMessages();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share file",
        variant: "destructive"
      });
    }
  };

  const getConversationMessages = () => {
    if (!selectedUser) return [];
    return messages.filter(msg => 
      (msg.senderId === user?.id && msg.receiverId === selectedUser) ||
      (msg.senderId === selectedUser && msg.receiverId === user?.id)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'file':
        return <FileText className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background bg-mesh-dark p-4 sm:p-8 transition-all duration-300">
      <div className="max-w-6xl mx-auto animate-fade-in">
        <header className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-3 hover-scale">
            <MessageCircle className="animate-glow-pulse" />
            Messages
          </h1>
          <p className="text-muted-foreground mt-2">Connect with users securely and privately</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Users List */}
          <Card className="border-primary/20 shadow-secure glass backdrop-blur-sm hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Contacts
              </CardTitle>
              <CardDescription>Select a user to message</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newContactUsername}
                    onChange={(e) => setNewContactUsername(e.target.value)}
                    placeholder="Username to add"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addNewContact();
                      }
                    }}
                  />
                  <Button onClick={addNewContact}>Add</Button>
                </div>
                <div className="space-y-2">
                  {users.filter(u => u.id !== user?.id).map((contact) => (
                    <Button
                      key={contact.id}
                      variant={selectedUser === contact.id ? "secure" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedUser(contact.id)}
                    >
                      {contact.username}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="border-primary/20 shadow-secure glass backdrop-blur-sm hover:shadow-glow transition-all duration-300 h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {selectedUser ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Chat with {users.find(u => u.id === selectedUser)?.username}
                    </>
                  ) : (
                    'Select a contact to start messaging'
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                {/* Messages Display */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {selectedUser ? (
                    getConversationMessages().map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs p-3 rounded-lg ${
                            message.senderId === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {getMessageIcon(message.type)}
                            <span className="text-xs opacity-70">
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <p>Select a contact to view messages</p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                {selectedUser && (
                  <div className="space-y-4 mt-auto">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <div className="flex gap-2">
                      <Button onClick={sendMessage} disabled={loading} className="flex-1">
                        <Send className="w-4 h-4 mr-2" />
                        {loading ? 'Sending...' : 'Send'}
                      </Button>
                      <div className="relative">
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          accept="image/*,*"
                        />
                        <Button variant="outline">
                          <Upload className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;