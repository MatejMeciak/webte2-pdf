import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { PdfUploader } from "../components/PdfUploader";
import { PdfToImagesConfigForm } from "../components/PdfToImagesConfigForm";
import { usePdfToImages } from "../hooks/usePdfToImages";

export default function PdfToImagesPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const { convertPdfToImages, isLoading, error } = usePdfToImages();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title={t('pdf.features.toImages.title')}
        description={t('pdf.features.toImages.description')}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload section */}
        <Card className="p-6 shadow-sm col-span-1 lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">
            {t("pdf.common.step1")}
          </h2>
          <PdfUploader file={file} setFile={setFile} />
        </Card>

        {/* PDF to Images configuration */}
        <Card className="p-6 shadow-sm col-span-1 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">
            {t("pdf.common.step2")}
          </h2>
          <PdfToImagesConfigForm
            onSubmit={convertPdfToImages}
            file={file}
            isLoading={isLoading}
            error={error}
          />
        </Card>
      </div>
    </div>
  );
}