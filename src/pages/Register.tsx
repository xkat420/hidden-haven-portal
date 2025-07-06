import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Shield, Key, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    inviteCode: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: formData.username, password: formData.password, inviteCode: formData.inviteCode })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setSuccess(true);
    } catch (err: any) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('Network Error: Could not connect to the server. Please ensure it is running.');
      } else {
        setError(err.message || "An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-mesh-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="border-primary/20 shadow-secure">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
              <UserPlus className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Request Access
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Create your secure account with an invitation code
              </CardDescription>
            </div>
          </CardHeader>

          {success ? (
            <CardContent className="text-center">
              <p className="text-success mb-4">Registration successful!</p>
              <Link to="/login">
                <Button variant="secure" className="w-full">
                  Proceed to Login
                </Button>
              </Link>
            </CardContent>
          ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteCode" className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary" />
                  Invitation Code
                </Label>
                <Input
                  id="inviteCode"
                  type="text"
                  placeholder="Enter your invitation code"
                  value={formData.inviteCode}
                  onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value })}
                  className="bg-secondary/50 border-primary/20 focus:border-primary transition-colors font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.trim() })}
                  className="bg-secondary/50 border-primary/20 focus:border-primary transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-secondary/50 border-primary/20 focus:border-primary transition-colors pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="bg-secondary/50 border-primary/20 focus:border-primary transition-colors pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              {error && (
                <div className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded-md w-full">
                  {error}
                </div>
              )}
              <Button 
                type="submit" 
                variant="secure"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : <>
                  <Shield className="w-4 h-4 mr-2" />
                  Create Secure Account
                </>}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Already have access? {" "}
                <Link 
                  to="/login" 
                  className="text-primary hover:text-primary-glow transition-colors underline underline-offset-4"
                >
                  Sign In
                </Link>
              </div>
            </CardFooter>
          </form>
          )}
        </Card>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>All data is encrypted and secured</p>
        </div>
      </div>
    </div>
  );
};

export default Register;