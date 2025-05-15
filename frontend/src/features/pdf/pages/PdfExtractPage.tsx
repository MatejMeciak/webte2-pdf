import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { PdfUploader } from "../components/PdfUploader";
import { ExtractPagesConfigForm } from "../components/ExtractPagesConfigForm";
import { usePdfExtract } from "../hooks/usePdfExtract";

export default function PdfExtractPage() {
  const [file, setFile] = useState<File | null>(null);
  const { extractPagesFromPdf, isLoading, error } = usePdfExtract();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="PDF Extract Pages Tool"
        description="Extract specific pages from your PDF document into a new file."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload section */}
        <Card className="p-6 shadow-sm col-span-1 lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">1. Select PDF</h2>
          <PdfUploader file={file} setFile={setFile} />
        </Card>

        {/* Extract pages configuration */}
        <Card className="p-6 shadow-sm col-span-1 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">2. Configure Page Extraction</h2>
          <ExtractPagesConfigForm 
            onSubmit={extractPagesFromPdf} 
            file={file} 
            isLoading={isLoading} 
            error={error} 
          />
        </Card>
      </div>
    </div>
  );
}