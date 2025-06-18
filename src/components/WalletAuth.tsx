
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Shield, Send, CreditCard } from 'lucide-react';

const WalletAuth = () => {
  return (
    <div className="min-h-screen dark-gradient flex items-center justify-center p-4">
      <div className="max-w-4xl w-full fade-in">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Wallet className="h-16 w-16 text-blue-400 mr-4 drop-shadow-lg" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-left">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-white bg-clip-text text-transparent">
                DrkPaypal
              </h1>
              <p className="text-blue-300 text-lg font-medium">Wallet</p>
            </div>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            The secure, fast, and anonymous way to manage your digital payments. 
            Send money, receive payments, and keep track of all your transactions in the dark.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 slide-up">
            <CardHeader className="text-center">
              <Shield className="h-10 w-10 text-blue-400 mx-auto mb-3 drop-shadow-md" />
              <CardTitle className="text-white">Anonymous & Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-400">
                Military-grade encryption with zero-knowledge privacy protection
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 slide-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="text-center">
              <Send className="h-10 w-10 text-blue-400 mx-auto mb-3 drop-shadow-md" />
              <CardTitle className="text-white">Instant Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-400">
                Lightning-fast transactions worldwide with minimal fees
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 slide-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="text-center">
              <CreditCard className="h-10 w-10 text-blue-400 mx-auto mb-3 drop-shadow-md" />
              <CardTitle className="text-white">Multi-Currency</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-400">
                Support for USD, EUR, GBP, Bitcoin, Ethereum, and USDT
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="max-w-md mx-auto bg-slate-800/70 border-slate-600 backdrop-blur-sm slide-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle className="text-white text-2xl">Enter the Dark Side</CardTitle>
              <CardDescription className="text-gray-400">
                Join thousands who chose privacy and security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Link to="/auth">
                <Button className="w-full h-12 blue-gradient hover:scale-105 transition-all duration-300 text-white font-semibold text-lg shadow-lg hover:shadow-blue-500/25" size="lg">
                  Access Wallet
                </Button>
              </Link>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Free signup</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>No monthly fees</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span>Anonymous</span>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WalletAuth;
