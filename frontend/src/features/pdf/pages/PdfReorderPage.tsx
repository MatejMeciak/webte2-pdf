import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { PdfUploader } from "../components/PdfUploader";
import { ReorderPagesConfigForm } from "../components/ReorderPagesConfigForm";
import { usePdfReorder } from "../hooks/usePdfReorder";
import { useTranslation } from "react-i18next";

export default function PdfReorderPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const { reorderPdfPages, isLoading, error } = usePdfReorder();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title={t('pdf.features.reorderPages.title')}
        description={t('pdf.features.reorderPages.description')}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload section */}
        <Card className="p-6 shadow-sm col-span-1 lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">{t('pdf.features.reorderPages.step1')}</h2>
          <PdfUploader file={file} setFile={setFile} feature="reorderPages" />
        </Card>

        {/* Reorder configuration */}
        <Card className="p-6 shadow-sm col-span-1 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">{t('pdf.features.reorderPages.step2')}</h2>
          <ReorderPagesConfigForm 
            onSubmit={reorderPdfPages} 
            file={file} 
            isLoading={isLoading} 
            error={error} 
          />
        </Card>
      </div>
    </div>
  );
}