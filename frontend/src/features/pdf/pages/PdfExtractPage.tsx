import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { PdfUploader } from "../components/PdfUploader";
import { ExtractPagesConfigForm } from "../components/ExtractPagesConfigForm";
import { usePdfExtract } from "../hooks/usePdfExtract";
import { useTranslation } from "react-i18next";

export default function PdfExtractPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const { extractPagesFromPdf, isLoading, error } = usePdfExtract();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title={t('pdf.tools.extractPages.title')}
        description={t('pdf.tools.extractPages.description')}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 shadow-sm col-span-1">
          <h2 className="text-xl font-semibold mb-4">{t('pdf.common.step1')}</h2>
          <PdfUploader file={file} setFile={setFile} />
        </Card>
        <Card className="p-6 shadow-sm col-span-2">
          <h2 className="text-xl font-semibold mb-4">{t('pdf.common.step2')}</h2>
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