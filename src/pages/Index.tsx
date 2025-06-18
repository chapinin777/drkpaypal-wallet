
import { useState } from 'react';
import WalletAuth from '../components/WalletAuth';
import WalletDashboard from '../components/WalletDashboard';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);

  const handleLogin = (userData: { email: string; name: string }) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {!isAuthenticated ? (
        <WalletAuth onLogin={handleLogin} />
      ) : (
        <WalletDashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default Index;
