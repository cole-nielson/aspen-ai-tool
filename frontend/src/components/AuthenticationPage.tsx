import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, analytics, logEvent } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";

const ALLOWED_EMAILS = [
  "colenielson6@gmail.com",
  // Add more approved users here
];

const AuthenticationPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email ?? "";

      if (!ALLOWED_EMAILS.includes(email)) {
        await auth.signOut();
        throw new Error("Unauthorized email");
      }

      logEvent(analytics, "login", {
        method: "Google",
        email,
      });

    } catch (error) {
      console.error("Error signing in:", error);
      toast({
        title: "Authentication Failed",
        description: "This account is not authorized.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-900" />
          </div>
          <CardTitle className="text-2xl font-bold">Aspen Capital Management</CardTitle>
          <CardDescription className="text-lg">
            Secure Document Analysis Portal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Sign in with your approved Google account to continue.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-blue-900 hover:bg-blue-800"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Signing In...</span>
              </div>
            ) : (
              <span>Sign in with Google</span>
            )}
          </Button>
        </CardFooter>
        <div className="p-4">
          <p className="text-xs text-center text-muted-foreground">
            Access is restricted to approved email addresses only.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AuthenticationPage;