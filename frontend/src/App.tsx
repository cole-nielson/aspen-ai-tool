// src/App.tsx

import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import AuthenticationPage from "@/components/AuthenticationPage";
import DashboardPage from "@/components/DashboardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

const App = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false);
      if (user) {
        navigate("/dashboard");
      } else {
        navigate("/auth");
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/auth" element={<AuthenticationPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;