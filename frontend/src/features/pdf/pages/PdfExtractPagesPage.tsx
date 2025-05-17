import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { usePdfSplit } from "../hooks/usePdfSplit";
import { SplitConfigForm } from "../components/SplitConfigForm";
import { PdfUploader } from "../components/PdfUploader";
import { useTranslation } from "react-i18next";

export default function PdfSplitPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const { splitPdf, isLoading, error } = usePdfSplit();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title={t('pdf.tools.extractPages.title')}
        description={t('pdf.tools.extractPages.description')}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload section */}
        <Card className="p-6 shadow-sm col-span-1 lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">{t('pdf.features.split.step1')}</h2>
          <PdfUploader 
            file={file} 
            setFile={setFile} 
            feature="split"  // Make sure this is "split"
          />
        </Card>

        {/* Split configuration */}
        <Card className="p-6 shadow-sm col-span-1 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">{t('pdf.features.split.step2')}</h2>
          <SplitConfigForm 
            onSubmit={splitPdf} 
            file={file} 
            isLoading={isLoading} 
            error={error} 
          />
        </Card>
      </div>
    </div>
  );
}