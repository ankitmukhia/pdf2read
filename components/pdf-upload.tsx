"use client";

import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PdfUploadProps {
  onFileUpload: (file: File) => void;
}

export function PdfUpload({ onFileUpload }: PdfUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        setError("Please upload a valid PDF file");
        return;
      }

      if (acceptedFiles.length > 0) {
        console.log("files: ", acceptedFiles);
        const file = acceptedFiles[0];
        if (file.size > 50 * 1024 * 1024) {
          // 50MB limit
          setError("File size must be less than 50MB");
          return;
        }
        onFileUpload(file);
      }
    },
    [onFileUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          {isDragActive ? (
            <>
              <Upload className="h-12 w-12 text-primary animate-bounce" />
              <p className="text-lg font-medium text-primary">
                Drop your PDF here
              </p>
            </>
          ) : (
            <>
              <FileText className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-lg font-medium mb-2">
                  Drag & drop your PDF here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports PDF files up to 50MB
                </p>
              </div>
              <Button variant="outline" type="button">
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <div className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
