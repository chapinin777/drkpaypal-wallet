
import { useAuth } from '@/hooks/useAuth';
import WalletAuth from '@/components/WalletAuth';
import WalletDashboard from '@/components/WalletDashboard';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <WalletDashboard /> : <WalletAuth />;
};

export default Index;
