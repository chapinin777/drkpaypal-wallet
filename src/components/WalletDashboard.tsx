
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Send, ArrowDownToLine, ArrowUpFromLine, Plus, Copy } from 'lucide-react';

interface WalletDashboardProps {
  user: { email: string; name: string } | null;
  onLogout: () => void;
}

const WalletDashboard = ({ user, onLogout }: WalletDashboardProps) => {
  const [balance] = useState(1250.75);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  const recentTransactions = [
    { id: 1, type: 'received', amount: 150.00, from: 'john.doe@email.com', date: '2024-01-15', status: 'completed' },
    { id: 2, type: 'sent', amount: 75.50, to: 'jane.smith@email.com', date: '2024-01-14', status: 'completed' },
    { id: 3, type: 'deposit', amount: 500.00, from: 'Bank Transfer', date: '2024-01-13', status: 'completed' },
  ];

  const handleCopyAddress = () => {
    navigator.clipboard.writeText('0x742d35Cc6435C0532925a3b8D82d5f8b4');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">PayPal Wallet</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
          </div>
          <Button onClick={onLogout} variant="outline">
            Logout
          </Button>
        </div>

        {/* Balance Card */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-medium">Your Balance</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                className="text-white hover:bg-white/10"
              >
                {isBalanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">
              {isBalanceVisible ? `$${balance.toFixed(2)}` : '••••••'}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                onClick={() => setShowSendModal(true)}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                variant="outline"
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
              <Button
                onClick={() => setShowReceiveModal(true)}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                variant="outline"
              >
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                Receive
              </Button>
              <Button className="bg-white/10 hover:bg-white/20 text-white border-white/20" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Deposit
              </Button>
              <Button className="bg-white/10 hover:bg-white/20 text-white border-white/20" variant="outline">
                <ArrowUpFromLine className="h-4 w-4 mr-2" />
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'received' ? 'bg-green-100' : tx.type === 'sent' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      {tx.type === 'received' ? (
                        <ArrowDownToLine className="h-4 w-4 text-green-600" />
                      ) : tx.type === 'sent' ? (
                        <Send className="h-4 w-4 text-red-600" />
                      ) : (
                        <Plus className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {tx.type === 'received' ? `From ${tx.from}` : 
                         tx.type === 'sent' ? `To ${tx.to}` : tx.from}
                      </p>
                      <p className="text-xs text-gray-500">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      tx.type === 'received' || tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.type === 'received' || tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Wallet Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Wallet Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Wallet Address</p>
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono">0x742d35...82d5f8b4</code>
                  <Button size="sm" variant="ghost" onClick={handleCopyAddress}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Account Type</p>
                <Badge variant="default">Personal Account</Badge>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Verification Status</p>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Verified
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Send Money</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Recipient Email</label>
                <input
                  type="email"
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="recipient@email.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Amount (USD)</label>
                <input
                  type="number"
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="0.00"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => setShowSendModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button className="flex-1">Send</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Receive Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Receive Money</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="w-32 h-32 bg-white border-2 border-dashed border-gray-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <span className="text-gray-500">QR Code</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Your wallet address:</p>
                <code className="text-sm font-mono bg-white px-2 py-1 rounded">
                  0x742d35Cc6435C0532925a3b8D82d5f8b4
                </code>
              </div>
              <Button onClick={() => setShowReceiveModal(false)} className="w-full">
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WalletDashboard;
