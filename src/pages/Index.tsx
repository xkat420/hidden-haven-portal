import { Link } from "react-router-dom";
import { Shield, Store, Users, Lock, Key, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-background bg-mesh-dark">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow mb-8">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Secure Marketplace
            </span>
            <br />
            <span className="text-foreground">Platform</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Enterprise-grade encrypted marketplace solution with advanced security, 
            admin controls, and seamless shop management for the modern web.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button variant="secure" size="lg" className="shadow-glow">
                <Lock className="w-5 h-5 mr-2" />
                Access Portal
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg" className="border-primary/20 hover:bg-primary/10">
                <Key className="w-5 h-5 mr-2" />
                Request Access
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for <span className="text-primary">Security</span> & <span className="text-primary">Scale</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Advanced features designed for secure marketplace operations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-primary/20 bg-card/50 hover:shadow-glow transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow mb-4">
                  <Shield className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">End-to-End Security</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base">
                  Military-grade encryption, secure authentication, and privacy-first architecture 
                  ensure your marketplace data remains protected.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-card/50 hover:shadow-glow transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow mb-4">
                  <Store className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Shop Management</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base">
                  Create, customize, and manage multiple secure marketplaces with 
                  advanced theming and branding options.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-card/50 hover:shadow-glow transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow mb-4">
                  <Users className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Admin Controls</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base">
                  Comprehensive admin dashboard with user management, invite systems, 
                  and granular permission controls.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20 px-6 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Security <span className="text-primary">Features</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Built with privacy and security as the foundation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mt-1">
                  <Lock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Invitation-Only Registration</h3>
                  <p className="text-muted-foreground">
                    Secure registration system with admin-generated invitation codes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mt-1">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Encrypted Data Storage</h3>
                  <p className="text-muted-foreground">
                    All sensitive data encrypted at rest and in transit
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mt-1">
                  <Key className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Role-Based Access</h3>
                  <p className="text-muted-foreground">
                    Granular permissions and role management system
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mt-1">
                  <Store className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Secure Shop URLs</h3>
                  <p className="text-muted-foreground">
                    Automatic .onion URL generation for maximum privacy
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mt-1">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Admin Dashboard</h3>
                  <p className="text-muted-foreground">
                    Complete system monitoring and user management
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mt-1">
                  <ArrowRight className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Easy Integration</h3>
                  <p className="text-muted-foreground">
                    Simple setup process with comprehensive documentation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get <span className="text-primary">Started?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join the secure marketplace platform trusted by professionals worldwide
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button variant="secure" size="lg" className="shadow-glow">
                <Lock className="w-5 h-5 mr-2" />
                Access Your Account
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg" className="border-primary/20 hover:bg-primary/10">
                <Key className="w-5 h-5 mr-2" />
                Request Invitation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/20 py-8 px-6">
        <div className="max-w-4xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 Secure Marketplace Platform. Built with privacy and security in mind.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
