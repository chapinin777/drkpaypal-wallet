
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Wallet, ArrowLeft, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Sign In Failed",
          description: error.message,
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in to your wallet",
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Passwords do not match",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: "Password must be at least 6 characters long",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password, formData.fullName);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Sign Up Failed",
          description: error.message,
        });
      } else {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md fade-in">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-gray-400 hover:text-blue-400 transition-colors mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Wallet className="h-12 w-12 text-blue-400 mr-3" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-white bg-clip-text text-transparent">
                Rolland PayPal
              </h1>
              <p className="text-blue-300 text-sm">Digital Wallet</p>
            </div>
          </div>
          <p className="text-gray-400">Access your secure digital wallet</p>
        </div>

        <Card className="bg-gray-800 border-gray-700 backdrop-blur-sm shadow-2xl overflow-hidden">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-white text-2xl font-semibold">
              {isSignUp ? 'Create Your Wallet' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-gray-400 text-base">
              {isSignUp 
                ? 'Join thousands who trust Rolland PayPal' 
                : 'Sign in to access your digital wallet'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-5">
              {/* Full Name Field - Only for Sign Up */}
              <div className={`transition-all duration-300 ease-in-out ${
                isSignUp ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'
              }`}>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-300 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500 h-12"
                    placeholder="Enter your full name"
                    required={isSignUp}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500 h-12"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500 h-12 pr-12"
                    placeholder={isSignUp ? "Create a strong password" : "Enter your password"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field - Only for Sign Up */}
              <div className={`transition-all duration-300 ease-in-out ${
                isSignUp ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'
              }`}>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-300 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500 h-12 pr-12"
                      placeholder="Confirm your password"
                      required={isSignUp}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-300 text-white font-semibold text-lg shadow-lg"
                disabled={loading}
              >
                {loading 
                  ? (isSignUp ? 'Creating Account...' : 'Signing In...') 
                  : (isSignUp ? 'Create Wallet' : 'Access Wallet')
                }
              </Button>
            </form>

            {/* Toggle Mode */}
            <div className="text-center pt-4 border-t border-gray-700">
              <p className="text-gray-400 mb-3">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </p>
              <Button
                type="button"
                variant="ghost"
                onClick={toggleMode}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all duration-200 font-medium"
              >
                {isSignUp ? 'Sign In Instead' : 'Create New Account'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By accessing Rolland PayPal Digital Wallet, you agree to our privacy-first approach to digital finance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
