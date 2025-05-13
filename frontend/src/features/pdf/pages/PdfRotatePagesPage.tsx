import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { PdfUploader } from "../components/PdfUploader";
import { RotatePagesConfigForm } from "../components/RotatePagesConfigForm";
import { usePdfRotatePages } from "../hooks/usePdfRotatePages";

export default function PdfRotatePagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const { rotatePdfPages, isLoading, error } = usePdfRotatePages();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Rotate PDF Pages"
        description="Rotate specific pages in your PDF document."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload section */}
        <Card className="p-6 shadow-sm col-span-1 lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">1. Select PDF</h2>
          <PdfUploader file={file} setFile={setFile} />
        </Card>

        {/* Rotate pages configuration */}
        <Card className="p-6 shadow-sm col-span-1 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">2. Configure Rotation</h2>
          <RotatePagesConfigForm
            onSubmit={rotatePdfPages}
            file={file}
            isLoading={isLoading}
            error={error}
          />
        </Card>
      </div>
    </div>
  );
} 