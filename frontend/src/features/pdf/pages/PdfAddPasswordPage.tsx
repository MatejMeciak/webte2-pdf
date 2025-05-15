import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { PdfUploader } from "../components/PdfUploader";
import { AddPasswordConfigForm } from "../components/AddPasswordConfigForm";
import { usePdfAddPassword } from "../hooks/usePdfAddPassword";

export default function PdfAddPasswordPage() {
  const [file, setFile] = useState<File | null>(null);
  const { addPasswordToPdf, isLoading, error } = usePdfAddPassword();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Add Password to PDF"
        description="Encrypt your PDF document with a password."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload section */}
        <Card className="p-6 shadow-sm col-span-1 lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">1. Select PDF</h2>
          <PdfUploader file={file} setFile={setFile} />
        </Card>

        {/* Add password configuration */}
        <Card className="p-6 shadow-sm col-span-1 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">2. Set Password</h2>
          <AddPasswordConfigForm
            onSubmit={addPasswordToPdf}
            file={file}
            isLoading={isLoading}
            error={error}
          />
        </Card>
      </div>
    </div>
  );
} 