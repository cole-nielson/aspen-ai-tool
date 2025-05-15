// src/components/FileUpload.tsx

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { generateUploadUrl, uploadFileWithSignedUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, X } from "lucide-react";

interface FileUploadProps {
  onUploadComplete: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const selected = acceptedFiles[0];
      if (selected && selected.type === "application/pdf") {
        setFile(selected);
      } else {
        toast({
          title: "Invalid File",
          description: "Please upload a valid PDF file.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a PDF file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // pull out upload_url, not url
      const { upload_url, blob_name } = await generateUploadUrl(
        file.name,
        file.type
      );

      // perform the PUT against the signed URL
      await uploadFileWithSignedUrl(upload_url, file);

      // clear state & notify
      setFile(null);
      toast({
        title: "Upload Complete",
        description: `${file.name} has been uploaded successfully.`,
      });

      // let parent re-fetch document list
      onUploadComplete();
    } catch (err: any) {
      console.error("Error uploading file:", err);
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => setFile(null);

  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer text-center ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-400"
            }`}
          >
            <input {...getInputProps()} />
            {!file ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Upload className="h-10 w-10 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium">Drag & drop a PDF file here, or click to select</p>
                  <p className="text-sm text-muted-foreground mt-2">Only PDF files are supported</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-900" />
                  <div>
                    <p className="font-medium truncate max-w-[300px]">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full bg-blue-900 hover:bg-blue-800"
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Uploading...</span>
              </div>
            ) : (
              <span>Upload Document</span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;