import { useState } from "react";
import api from "@/api/axios";
import type { ReorderPagesFormValues } from "../types/pdf";
import { useTranslation } from "react-i18next";

export function usePdfReorder() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reorderPdfPages = async (values: ReorderPagesFormValues, file: File) => {
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
      
      // Send the page order as a single comma-separated string
      formData.append("page_order", values.pageOrder);
      
      const outputName = values.outputName || t("pdf.reorder.outputPlaceholder");
      formData.append("output_name", outputName);

      // Send request to reorder pages in the PDF
      const response = await api.post("/pdf/reorder", formData, {
        responseType: "blob",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        validateStatus: () => true,
      });

      // Check for error status
      if (response.status >= 400) {
        setError(t("errors.reorderFailed"));
        return;
      }

      // Handle the download
      handleFileDownload(response, outputName);
      
    } catch (err) {
      setError(t("errors.unexpected"));
      console.error("Error reordering PDF pages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { reorderPdfPages, isLoading, error };
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