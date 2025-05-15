
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import DocumentSection from "./DocumentSection";
import ChatPanel from "./ChatPanel";

interface TabNavigationProps {
  documents: any[];
  isLoading: boolean;
  onUploadComplete: () => void;
  onAnalyze: (analysis: any) => void;
  user: any;
}

const TabNavigation = ({ 
  documents, 
  isLoading, 
  onUploadComplete, 
  onAnalyze,
  user 
}: TabNavigationProps) => {
  const [activeTab, setActiveTab] = useState("documents");

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid grid-cols-2 mb-8">
        <TabsTrigger value="documents" className="text-sm font-medium">Document Upload</TabsTrigger>
        <TabsTrigger value="chat" className="text-sm font-medium">AI Chat</TabsTrigger>
      </TabsList>
      
      <TabsContent value="documents" className="mt-0">
        <DocumentSection 
          documents={documents} 
          isLoading={isLoading} 
          onUploadComplete={onUploadComplete}
          onAnalyze={onAnalyze} 
        />
      </TabsContent>
      
      <TabsContent value="chat" className="mt-0">
        <ChatPanel user={user} documents={documents} />
      </TabsContent>
    </Tabs>
  );
};

export default TabNavigation;
