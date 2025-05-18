import { useState } from "react";
import api from "@/api/axios";
import type { RemovePageFormValues } from "../types/pdf";
import { useTranslation } from "react-i18next";

export function usePdfRemovePage() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removePageFromPdf = async (values: RemovePageFormValues, file: File) => {
    if (!file) {
      setError(t('errors.uploadFirst'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create form data with file and form values
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("page_to_remove", values.pageToRemove.toString());
      
      const outputName = values.outputName || t("pdf.remove.outputPlaceholder");
      formData.append("output_name", outputName);

      // Send request to remove page from the PDF
      const response = await api.post("/pdf/remove-page", formData, {
        responseType: "blob",
        headers: {
          "Content-Type": "multipart/form-data"
        },
        validateStatus: () => true,
      });

      // Check for error status
      if (response.status && response.status >= 400) {
        setError(t('errors.removeFailed'));
        return;
      }

      // Only handle download if status is OK
      handleFileDownload(response, outputName);
      
    } catch (err) {
      setError(t('errors.unexpected'));
      console.error("Error removing page from PDF:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { removePageFromPdf, isLoading, error };
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