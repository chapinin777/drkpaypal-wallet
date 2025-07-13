
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/useAuth";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Offramp from "./pages/Offramp";

const queryClient = new QueryClient();

const AppContent = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [offrampModalOpen, setOfframpModalOpen] = useState(false);

  return (
    <>
      <Index 
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenOfframp={() => setOfframpModalOpen(true)}
      />
      
      {/* Auth Modal */}
      <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0 bg-transparent border-0">
          <Auth onClose={() => setAuthModalOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Offramp Modal */}
      <Dialog open={offrampModalOpen} onOpenChange={setOfframpModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-transparent border-0">
          <Offramp onClose={() => setOfframpModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
