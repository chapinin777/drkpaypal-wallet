

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Shield, Zap, Globe, ArrowRight, CheckCircle } from 'lucide-react';

interface WalletAuthProps {
  onOpenAuth?: () => void;
}

const WalletAuth = ({ onOpenAuth }: WalletAuthProps) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Wallet className="h-8 w-8 text-blue-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Rolland PayPal</h1>
              <p className="text-xs text-gray-400">Digital Wallet</p>
            </div>
          </div>
          <Button 
            onClick={onOpenAuth}
            variant="outline" 
            className="text-sm border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Sign in
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            The modern way to
            <span className="block text-blue-400">manage money</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Send, receive, and manage your digital payments with enterprise-grade security 
            and lightning-fast transactions powered by PayPal technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onOpenAuth}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium rounded-lg shadow-sm"
            >
              Get started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" className="px-8 py-3 text-lg font-medium rounded-lg border-gray-700 text-gray-300 hover:bg-gray-800">
              Learn more
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Built for the modern economy
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Everything you need to handle digital payments, from personal transfers to business transactions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border border-gray-800 hover:border-gray-700 transition-colors bg-gray-800">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Bank-level security</h3>
              <p className="text-gray-300">
                Your money is protected with enterprise-grade encryption and multi-factor authentication.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-800 hover:border-gray-700 transition-colors bg-gray-800">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Instant transfers</h3>
              <p className="text-gray-300">
                Send money anywhere in the world instantly with minimal fees and real-time notifications.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-800 hover:border-gray-700 transition-colors bg-gray-800">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 bg-purple-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Global reach</h3>
              <p className="text-gray-300">
                Support for multiple currencies including USD, EUR, GBP, and major cryptocurrencies.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-gray-800 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Trusted by thousands
            </h2>
            <p className="text-lg text-gray-300">
              Join the growing community of users who trust Rolland PayPal with their digital finances.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">$10M+</div>
              <p className="text-gray-300">Transaction volume</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">50K+</div>
              <p className="text-gray-300">Active users</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">99.9%</div>
              <p className="text-gray-300">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <Card className="bg-blue-600 border-0 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to get started?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Create your Rolland PayPal account in minutes and start managing your digital finances with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={onOpenAuth}
                className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-3 text-lg font-medium rounded-lg"
              >
                Create account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-6 text-blue-100 text-sm">
                <span className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Free to start
                </span>
                <span className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  No monthly fees
                </span>
                <span className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  24/7 support
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Wallet className="h-6 w-6 text-blue-400" />
            <span className="text-lg font-semibold text-white">Rolland PayPal</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 Rolland PayPal. All rights reserved. Your trusted digital wallet solution.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default WalletAuth;
