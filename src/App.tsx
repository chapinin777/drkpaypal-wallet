
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Offramp from "./pages/Offramp";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppWithModal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOfframpOpen, setIsOfframpOpen] = useState(false);

  useEffect(() => {
    if (location.pathname === '/offramp') {
      setIsOfframpOpen(true);
    } else {
      setIsOfframpOpen(false);
    }
  }, [location.pathname]);

  const handleOfframpClose = () => {
    setIsOfframpOpen(false);
    navigate('/', { replace: true });
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/offramp" element={<Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <Dialog open={isOfframpOpen} onOpenChange={handleOfframpClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-transparent border-0">
          <Offramp onClose={handleOfframpClose} />
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
        <BrowserRouter>
          <AppWithModal />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
