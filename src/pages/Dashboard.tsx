import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User, Store, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-background bg-mesh-dark p-4 sm:p-8">
      <div className="max-w-4xl mx-auto animate-fade-in">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Dashboard
          </h1>
          <Button onClick={handleLogout} variant="destructive" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-primary/20 shadow-secure">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User /> Welcome!</CardTitle>
              <CardDescription>Your account details are below.</CardDescription>
            </CardHeader>
            <CardContent>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>User ID:</strong> <span className="font-mono text-sm">{user.id}</span></p>
              <p><strong>Member Since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 shadow-secure flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Store /> Shop Management</CardTitle>
              <CardDescription>Create, view, and manage your secure shops.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
              <Button onClick={() => navigate('/shop-management')} variant="secure" className="w-full shadow-glow">
                Manage Your Shops
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;