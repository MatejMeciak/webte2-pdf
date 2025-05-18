import { useState } from "react";
import api from "@/api/axios";
import type { AddWatermarkFormValues } from "../types/pdf";
import { isAxiosError } from "axios";
import { useTranslation } from "react-i18next";

export function usePdfAddWatermark() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addWatermarkToPdf = async (values: AddWatermarkFormValues, file: File) => {
    if (!file) {
      setError(t("errors.uploadFirst"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create form data with file and form values
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("watermark_text", values.watermarkText);
      
      const outputName = values.outputName || t("pdf.watermark.outputPlaceholder");
      formData.append("output_name", outputName);

      // Send request to add watermark to the PDF
      const response = await api.post("/pdf/add-watermark", formData, {
        responseType: "blob",
        headers: {
          "Content-Type": "multipart/form-data"
        },
        validateStatus: () => true, // Always resolve, handle status manually
      });

      // Check for error status
      if (response.status && response.status >= 400) {
        setError(t("errors.addWatermarkFailed"));
        return;
      }

      // Only handle download if status is OK
      handleFileDownload(response, outputName);
      
    } catch (err) {
      setError(t("errors.unexpected"));
      console.error("Error adding watermark to PDF:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { addWatermarkToPdf, isLoading, error };
}

// Helper function to handle file download
function handleFileDownload(response: any, filename: string) {
  // Create blob URL and trigger download
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}