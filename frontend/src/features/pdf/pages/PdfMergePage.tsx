import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { MultiPdfUploader } from "../components/MultiPdfUploader";
import { MergeConfigForm } from "../components/MergeConfigForm";
import { usePdfMerge } from "../hooks/usePdfMerge";
import { useTranslation } from "react-i18next";

export default function PdfMergePage() {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const { mergePdf, isLoading, error } = usePdfMerge();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title={t("pdf.merge.title")}
        description={t("pdf.merge.description")}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload section */}
        <Card className="p-6 shadow-sm col-span-1 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">{t("common.multiStep1")}</h2>
          <MultiPdfUploader 
            files={files} 
            setFiles={setFiles} 
            maxFiles={2} 
          />
        </Card>

        {/* Merge configuration */}
        <Card className="p-6 shadow-sm col-span-1">
          <h2 className="text-xl font-semibold mb-4">{t("common.step2")}</h2>
          <MergeConfigForm 
            onSubmit={mergePdf} 
            files={files} 
            isLoading={isLoading} 
            error={error} 
          />
        </Card>
      </div>
    </div>
  );
}