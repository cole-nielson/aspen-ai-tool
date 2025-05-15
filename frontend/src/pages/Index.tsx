
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthenticationPage from "@/components/AuthenticationPage";
import DashboardPage from "@/components/DashboardPage";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [bypassAuth, setBypassAuth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (bypassAuth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoading(true);
      if (currentUser) {
        // Check if email is from allowed domain
        if (currentUser.email?.endsWith("@aspencapitalmgmt.com")) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          // Sign out user if email domain is not allowed
          await auth.signOut();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, bypassAuth]);

  const handleBypassAuth = () => {
    setBypassAuth(true);
    setIsAuthenticated(true);
    // Create a mock user object for testing
    setUser({ 
      displayName: "Test User", 
      email: "test@aspencapitalmgmt.com",
      uid: "test-user-id" 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {!isAuthenticated ? (
        <div className="flex flex-col gap-4 items-center">
          <AuthenticationPage />
          <div className="max-w-md w-full mx-auto px-4">
            <Button 
              onClick={handleBypassAuth} 
              variant="outline" 
              className="w-full mt-4 border-dashed border-red-300 text-red-500 hover:bg-red-50"
            >
              Bypass Authentication (Testing Only)
            </Button>
            <p className="text-xs text-center text-red-400 mt-2">
              Warning: This button is for testing purposes only and should be removed before production.
            </p>
          </div>
        </div>
      ) : (
        <DashboardPage user={user} />
      )}
    </div>
  );
};

export default Index;
