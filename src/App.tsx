
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { UserProvider } from "./contexts/UserContext";
import { UserSettingsProvider } from "./contexts/UserSettingsContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ClientList from "./pages/clients/ClientList";
import ClientForm from "./pages/clients/ClientForm";
import ClientDetail from "./pages/clients/ClientDetail";
import OrderList from "./pages/orders/OrderList";
import OrderForm from "./pages/orders/OrderForm";
import OrderDetail from "./pages/orders/OrderDetail";
import Settings from "./pages/settings/Settings";
import Profile from "./pages/settings/Profile";
import Login from "./pages/auth/Login";
import { supabase } from "./lib/supabase";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <UserSettingsProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                
                {/* Client Routes */}
                <Route path="/clients" element={<ProtectedRoute><ClientList /></ProtectedRoute>} />
                <Route path="/clients/new" element={<ProtectedRoute><ClientForm /></ProtectedRoute>} />
                <Route path="/clients/:id" element={<ProtectedRoute><ClientDetail /></ProtectedRoute>} />
                <Route path="/clients/edit/:id" element={<ProtectedRoute><ClientForm /></ProtectedRoute>} />
                
                {/* Order Routes */}
                <Route path="/orders" element={<ProtectedRoute><OrderList /></ProtectedRoute>} />
                <Route path="/orders/new" element={<ProtectedRoute><OrderForm /></ProtectedRoute>} />
                <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
                <Route path="/orders/edit/:id" element={<ProtectedRoute><OrderForm /></ProtectedRoute>} />
                
                {/* Settings Routes */}
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </UserSettingsProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
