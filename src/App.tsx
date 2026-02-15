import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import GeneratorRentalPage from "./pages/GeneratorRentalPage";
import ChargingMapPage from "./pages/ChargingMapPage";
import PeerChargingPage from "./pages/PeerChargingPage";
import ProfilePage from "./pages/ProfilePage";
import ChatPage from "./pages/ChatPage";
import NotFound from "./pages/NotFound";
import Chatbot from "./components/Chatbot";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication
    const authToken = localStorage.getItem('evadoom_auth');
    if (authToken) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);

    // Set dark theme by default
    document.documentElement.classList.add('dark');
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('evadoom_auth', 'authenticated');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('evadoom_auth');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="pulse-electric w-12 h-12 rounded-full bg-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route 
                path="/auth" 
                element={
                  isAuthenticated ? 
                  <Navigate to="/" replace /> : 
                  <AuthPage onLogin={handleLogin} />
                } 
              />
              <Route 
                path="/" 
                element={
                  isAuthenticated ? 
                  <HomePage onLogout={handleLogout} /> : 
                  <Navigate to="/auth" replace />
                } 
              />
              <Route 
                path="/generator-rental" 
                element={
                  isAuthenticated ? 
                  <GeneratorRentalPage onLogout={handleLogout} /> : 
                  <Navigate to="/auth" replace />
                } 
              />
              <Route 
                path="/charging-map" 
                element={
                  isAuthenticated ? 
                  <ChargingMapPage onLogout={handleLogout} /> : 
                  <Navigate to="/auth" replace />
                } 
              />
              <Route 
                path="/peer-charging" 
                element={
                  isAuthenticated ? 
                  <PeerChargingPage onLogout={handleLogout} /> : 
                  <Navigate to="/auth" replace />
                } 
              />
              <Route 
                path="/profile" 
                element={
                  isAuthenticated ? 
                  <ProfilePage onLogout={handleLogout} /> : 
                  <Navigate to="/auth" replace />
                } 
              />
              <Route 
                path="/chat/:hostId" 
                element={
                  isAuthenticated ? 
                  <ChatPage onLogout={handleLogout} /> : 
                  <Navigate to="/auth" replace />
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
            {isAuthenticated && <Chatbot />}
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;