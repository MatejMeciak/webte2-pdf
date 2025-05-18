import { useState } from "react";
import api from "@/api/axios";
import type { MergeFormValues } from "../types/pdf";
import { useTranslation } from "react-i18next";

export function usePdfMerge() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mergePdf = async (values: MergeFormValues, files: File[]) => {
    if (files.length < 2) {
      setError(t("errors.uploadFirst"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create form data with files and form values
      const formData = new FormData();
      formData.append("first_pdf", files[0]);
      formData.append("second_pdf", files[1]);

      const outputName = values.outputName || t("pdf.merge.outputPlaceholder");
      formData.append("output_name", outputName);

      // Send request to merge the PDFs
      const response = await api.post("/pdf/merge", formData, {
        responseType: "blob",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        validateStatus: () => true,
      });

      // Check for error status
      if (response.status >= 400) {
        setError(t("errors.mergeFailed"));
        return;
      }

      // Handle the download only if status is OK
      handleFileDownload(response, outputName);
    } catch (err) {
      setError(t("errors.unexpected"));
      console.error("Error merging PDFs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { mergePdf, isLoading, error };
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
