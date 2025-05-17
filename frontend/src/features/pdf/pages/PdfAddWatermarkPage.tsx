import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { PdfUploader } from "../components/PdfUploader";
import { AddWatermarkConfigForm } from "../components/AddWatermarkConfigForm";
import { usePdfAddWatermark } from "../hooks/usePdfAddWatermark";
import { useTranslation } from "react-i18next";

export default function PdfAddWatermarkPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const { addWatermarkToPdf, isLoading, error } = usePdfAddWatermark();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title={t("pdf.features.addWatermark.title")}
        description={t("pdf.features.addWatermark.description")}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload section */}
        <Card className="p-6 shadow-sm col-span-1 lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">
            {t("pdf.common.step1")}
          </h2>
          <PdfUploader file={file} setFile={setFile} feature="addWatermark" />
        </Card>

        {/* Add watermark configuration */}
        <Card className="p-6 shadow-sm col-span-1 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">
            {t("pdf.common.step2")}
          </h2>
          <AddWatermarkConfigForm
            onSubmit={addWatermarkToPdf}
            file={file}
            isLoading={isLoading}
            error={error}
          />
        </Card>
      </div>
    </div>
  );
}