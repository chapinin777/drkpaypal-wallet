
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Send, Download, Plus, Minus } from 'lucide-react';
import TransactionModal from './TransactionModal';

interface WalletDashboardProps {
  user: { email: string; name: string } | null;
  onLogout: () => void;
}

const WalletDashboard = ({ user, onLogout }: WalletDashboardProps) => {
  const [balance, setBalance] = useState(1234.56);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [modalType, setModalType] = useState<'send' | 'receive' | 'deposit' | 'withdraw' | null>(null);

  const handleTransaction = (type: string, amount: number) => {
    if (type === 'send' || type === 'withdraw') {
      setBalance(prev => prev - amount);
    } else if (type === 'receive' || type === 'deposit') {
      setBalance(prev => prev + amount);
    }
    setModalType(null);
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">P</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">PayWallet</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
          </div>
          <Button 
            onClick={onLogout}
            variant="outline" 
            className="hover:bg-gray-50"
          >
            Sign Out
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Balance Card */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0 text-white shadow-2xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-blue-100 text-sm mb-2">Total Balance</p>
                <div className="flex items-center space-x-3">
                  <span className="text-4xl font-bold">
                    {isBalanceVisible ? `$${balance.toFixed(2)}` : '••••••'}
                  </span>
                  <button
                    onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                    className="text-blue-100 hover:text-white transition-colors p-1"
                  >
                    {isBalanceVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm">USD</p>
                <p className="text-xl font-semibold">Wallet</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button 
                onClick={() => setModalType('send')}
                className="bg-white/20 hover:bg-white/30 border-0 text-white h-12 rounded-xl transition-all duration-200"
              >
                <Send size={16} className="mr-2" />
                Send
              </Button>
              <Button 
                onClick={() => setModalType('receive')}
                className="bg-white/20 hover:bg-white/30 border-0 text-white h-12 rounded-xl transition-all duration-200"
              >
                <Download size={16} className="mr-2" />
                Receive
              </Button>
              <Button 
                onClick={() => setModalType('deposit')}
                className="bg-white/20 hover:bg-white/30 border-0 text-white h-12 rounded-xl transition-all duration-200"
              >
                <Plus size={16} className="mr-2" />
                Deposit
              </Button>
              <Button 
                onClick={() => setModalType('withdraw')}
                className="bg-white/20 hover:bg-white/30 border-0 text-white h-12 rounded-xl transition-all duration-200"
              >
                <Minus size={16} className="mr-2" />
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'received', amount: 150.00, from: 'John Doe', time: '2 hours ago' },
                { type: 'sent', amount: 75.50, to: 'Coffee Shop', time: '1 day ago' },
                { type: 'deposit', amount: 500.00, from: 'Bank Transfer', time: '3 days ago' },
              ].map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'received' || transaction.type === 'deposit' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'received' || transaction.type === 'deposit' ? '+' : '-'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 capitalize">{transaction.type}</p>
                      <p className="text-sm text-gray-600">
                        {transaction.from ? `from ${transaction.from}` : `to ${transaction.to}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'received' || transaction.type === 'deposit' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      ${transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">{transaction.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Modal */}
      {modalType && (
        <TransactionModal
          type={modalType}
          onClose={() => setModalType(null)}
          onConfirm={handleTransaction}
        />
      )}
    </div>
  );
};

export default WalletDashboard;
