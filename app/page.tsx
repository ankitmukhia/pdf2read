"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PdfUpload } from "@/components/pdf-upload";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(
  () =>
    import("../components/pdf/pdf-viewer").then((module) => module.PdfViewer),
  { ssr: false },
);

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
  };

  /* const backToUpload = () => {
    setUploadedFile(null);
  }; */

  if (uploadedFile) {
    return <PdfViewer file={uploadedFile} />;
  }

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-2 xl:px-0">
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Card className="max-w-xl mx-auto p-2">
          <CardContent className="p-0">
            <PdfUpload onFileUpload={handleFileUpload} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
