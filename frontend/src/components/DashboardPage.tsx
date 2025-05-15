import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { auth, analytics, logEvent } from "@/lib/firebase";
import { fetchUserDocuments } from "@/lib/api";
import FileUpload from "./FileUpload";
import AnalysisResults from "./AnalysisResults";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import TabNavigation from "./TabNavigation";
import { useAuth } from "@/hooks/use-auth";

const DashboardPage = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const { toast } = useToast();

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await fetchUserDocuments();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Failed to load documents",
        description: "There was a problem loading your documents. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      logEvent(analytics, "logout");
      toast({ title: "Signed out successfully" });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAnalysis = (analysisResult: any) => {
    setAnalysis(analysisResult);
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Aspen Document Analysis Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-right">
                <p className="font-medium text-gray-900">{user?.displayName || "Analyst"}</p>
                <p className="text-gray-500 text-xs">{user?.email}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <TabNavigation
            documents={documents}
            isLoading={isLoading}
            onUploadComplete={loadDocuments}
            onAnalyze={handleAnalysis}
            user={user}
          />
          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Analysis Results</h2>
            <AnalysisResults analysis={analysis} />
          </section>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;