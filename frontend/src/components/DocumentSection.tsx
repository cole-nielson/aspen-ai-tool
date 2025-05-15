
import FileUpload from "./FileUpload";
import DocumentTable from "./DocumentTable";
import { Button } from "@/components/ui/button";

interface DocumentSectionProps {
  documents: any[];
  isLoading: boolean;
  onUploadComplete: () => void;
  onAnalyze: (analysis: any) => void;
}

const DocumentSection = ({ 
  documents, 
  isLoading, 
  onUploadComplete, 
  onAnalyze 
}: DocumentSectionProps) => {
  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <section>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Upload New Document</h2>
        <FileUpload onUploadComplete={onUploadComplete} />
      </section>

      {/* Documents Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Your Documents</h2>
          <Button 
            variant="outline" 
            onClick={onUploadComplete}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900"></div>
          </div>
        ) : (
          <DocumentTable documents={documents} onAnalyze={onAnalyze} />
        )}
      </section>
    </div>
  );
};

export default DocumentSection;
