
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Shield, Send, CreditCard } from 'lucide-react';

const WalletAuth = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Wallet className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">PayPal Wallet</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Secure, fast, and easy way to manage your digital payments. Send money, receive payments, and keep track of all your transactions.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <CardTitle>Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Bank-level security with encryption and fraud protection
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Send className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <CardTitle>Fast Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Send money instantly to friends and family worldwide
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <CardTitle>Multiple Currencies</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Support for USD, EUR, GBP, Bitcoin, and Ethereum
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Join millions of users who trust PayPal Wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/auth">
                <Button className="w-full" size="lg">
                  Sign In / Create Account
                </Button>
              </Link>
              <p className="text-sm text-gray-500">
                Free to sign up • No monthly fees • Instant transfers
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WalletAuth;
