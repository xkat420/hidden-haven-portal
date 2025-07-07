import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';
import { Shield, Lock, Eye } from 'lucide-react';

interface ShopAccessGateProps {
  shopSlug: string;
  onAccessGranted: () => void;
}

export default function ShopAccessGate({ shopSlug, onAccessGranted }: ShopAccessGateProps) {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:3001/api/shops/${shopSlug}/verify-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode })
      });

      const result = await response.json();

      if (result.authorized) {
        onAccessGranted();
        toast({
          title: "Access Granted",
          description: "Welcome to the shop!",
        });
      } else {
        toast({
          title: "Access Denied",
          description: result.message || "Invalid access code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Access verification failed:', error);
      toast({
        title: "Error",
        description: "Failed to verify access code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-bounce-in">
        <Card className="glass cyber-btn shadow-glow border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit pulse-ring">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Restricted Access</CardTitle>
            <CardDescription>
              This shop requires an access code to enter
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessCode" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Access Code
                </Label>
                <div className="relative">
                  <Input
                    id="accessCode"
                    type={showCode ? "text" : "password"}
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Enter shop access code"
                    className="glass focus:shadow-glow transition-all duration-300 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setShowCode(!showCode)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full cyber-btn animate-glow-pulse"
                disabled={loading || !accessCode.trim()}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Verifying...
                  </div>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Enter Shop
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Don't have an access code?</p>
              <p>Contact the shop owner for access.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}