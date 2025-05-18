import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { PdfUploader } from "../components/PdfUploader";
import { RemovePageConfigForm } from "../components/RemovePageConfigForm";
import { usePdfRemovePage } from "../hooks/usePdfRemovePage";

export default function PdfRemovePage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const { removePageFromPdf, isLoading, error } = usePdfRemovePage();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title={t("pdf.remove.title")}
        description={t("pdf.remove.description")}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload section */}
        <Card className="p-6 shadow-sm col-span-1 lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">
            {t("common.step1")}
          </h2>
          <PdfUploader file={file} setFile={setFile} />
        </Card>

        {/* Remove page configuration */}
        <Card className="p-6 shadow-sm col-span-1 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">
            {t("common.step2")}
          </h2>
          <RemovePageConfigForm 
            onSubmit={removePageFromPdf} 
            file={file} 
            isLoading={isLoading} 
            error={error} 
          />
        </Card>
      </div>
    </div>
  );
}