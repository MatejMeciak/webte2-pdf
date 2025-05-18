import { useState } from "react";
import api from "@/api/axios";
import type { RotatePagesFormValues } from "../types/pdf";
import { useTranslation } from "react-i18next";

export function usePdfRotatePages() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rotatePdfPages = async (values: RotatePagesFormValues, file: File) => {
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
      formData.append("pages", values.pages.join(','));
      formData.append("rotations", values.rotations.join(','));
      
      const outputName = values.outputName || t("pdf.rotate.outputPlaceholder");
      formData.append("output_name", outputName);

      // Send request to rotate PDF pages
      const response = await api.post("/pdf/rotate", formData, {
        responseType: "blob",
        headers: {
          "Content-Type": "multipart/form-data"
        },
        validateStatus: () => true, // Always resolve, handle status manually
      });

      // Check for error status
      if (response.status && response.status >= 400) {
        setError(t("errors.rotatePagesFailed"));
        return;
      }

      // Only handle download if status is OK
      handleFileDownload(response, outputName);
      
    } catch (err) {
      setError(t("errors.unexpected"));
      console.error("Error rotating PDF pages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { rotatePdfPages, isLoading, error };
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