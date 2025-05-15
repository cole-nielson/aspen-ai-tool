
import { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { analyzeDocument } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { FileText, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const DocumentTable = ({ documents, onAnalyze }) => {
  const [analyzingDocId, setAnalyzingDocId] = useState(null);
  const { toast } = useToast();

  const handleAnalyze = async (document) => {
    setAnalyzingDocId(document.id);
    try {
      const result = await analyzeDocument(document.blob_name);
      onAnalyze(result);
      toast({
        title: "Analysis Complete",
        description: `${document.name} has been analyzed successfully.`
      });
    } catch (error) {
      console.error("Error analyzing document:", error);
      toast({
        title: "Analysis Failed",
        description: "There was a problem analyzing your document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAnalyzingDocId(null);
    }
  };

  const renderStatus = (status) => {
    switch (status.toLowerCase()) {
      case "processed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Processed</Badge>;
      case "processing":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Processing</Badge>;
      case "failed":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="border rounded-lg shadow-sm">
      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <FileText className="h-12 w-12 text-gray-300 mb-2" />
          <h3 className="font-medium text-gray-900">No documents yet</h3>
          <p className="text-sm text-gray-500 mt-1">Upload a document to get started</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>File Name</TableHead>
              <TableHead>Uploaded By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-900" />
                  <span className="truncate max-w-[200px]">{doc.name}</span>
                </TableCell>
                <TableCell>{doc.uploaded_by}</TableCell>
                <TableCell>{format(new Date(doc.uploaded_at), "MMM d, yyyy")}</TableCell>
                <TableCell>{renderStatus(doc.status)}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleAnalyze(doc)}
                    disabled={analyzingDocId === doc.id || doc.status.toLowerCase() !== "processed"}
                    className="text-blue-900"
                  >
                    {analyzingDocId === doc.id ? (
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-900 border-t-transparent"></div>
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      <>
                        <Search className="h-3.5 w-3.5 mr-2" />
                        <span>Analyze</span>
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default DocumentTable;
