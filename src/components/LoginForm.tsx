import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Shield, Building2, User, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LoginForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = React.useState({
    abn: '',
    username: '',
    password: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.abn || !formData.username || !formData.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // ABN validation (11 digits)
    if (!/^\d{11}$/.test(formData.abn.replace(/\s/g, ''))) {
      toast({
        title: "Invalid ABN",
        description: "ABN must be 11 digits.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Login Successful",
      description: "Welcome back! You are now logged in.",
    });
    
    console.log('Login attempt:', formData);
  };

  const formatABN = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    // Format as XX XXX XXX XXX
    if (digits.length > 2) {
      return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4').substring(0, 14);
    }
    return digits;
  };

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4 shadow-glow">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Start my Shop</h1>
          <p className="text-muted-foreground">Access your business account</p>
        </div>

        {/* Login Form */}
        <Card className="bg-card/70 backdrop-blur-md border-border shadow-elegant">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-semibold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your business credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* ABN Field */}
              <div className="space-y-2">
                <Label htmlFor="abn" className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Australian Business Number (ABN)
                </Label>
                <Input
                  id="abn"
                  type="text"
                  placeholder="XX XXX XXX XXX"
                  value={formData.abn}
                  onChange={(e) => handleInputChange('abn', formatABN(e.target.value))}
                  className="bg-input/50 backdrop-blur-sm border-border focus:ring-primary focus:border-primary"
                  maxLength={14}
                  required
                />
              </div>

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="bg-input/50 backdrop-blur-sm border-border focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="bg-input/50 backdrop-blur-sm border-border focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="login"
                className="w-full py-3"
              >
                Sign In to Your Account
              </Button>
            </form>

            {/* Additional Options */}
            <div className="pt-4 space-y-3">
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-primary hover:text-primary/80 transition-smooth"
                  onClick={() => toast({
                    title: "Password Reset",
                    description: "Password reset feature coming soon.",
                  })}
                >
                  Forgot your password?
                </button>
              </div>
              
              <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
                <span>Need help?</span>
                <button
                  type="button"
                  className="text-primary hover:text-primary/80 transition-smooth"
                  onClick={() => toast({
                    title: "Support",
                    description: "Contact support at support@securebiz.com",
                  })}
                >
                  Contact Support
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-muted-foreground">
          <p>© 2024 StartmyShop. All rights reserved.</p>
          <p className="mt-1">Secure • Reliable • Trusted</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;