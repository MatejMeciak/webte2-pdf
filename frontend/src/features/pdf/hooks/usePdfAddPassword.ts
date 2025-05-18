import { useState } from "react";
import api from "@/api/axios";
import type { AddPasswordFormValues } from "../types/pdf";
import { useTranslation } from "react-i18next";

export function usePdfAddPassword() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addPasswordToPdf = async (values: AddPasswordFormValues, file: File) => {
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
      formData.append("password", values.password);
      
      const outputName = values.outputName || t("pdf.password.outputPlaceholder");
      formData.append("output_name", outputName);

      // Send request to add password to the PDF
      const response = await api.post("/pdf/add-password", formData, {
        responseType: "blob",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        validateStatus: () => true, // Always resolve, handle status manually
      });

      // Check for error status
      if (response.status >= 400) {
        setError(t("errors.addPasswordFailed"));
        return;
      }

      // Handle the download
      handleFileDownload(response, outputName);
      
    } catch (err) {
      setError(t("errors.unexpected"));
      console.error("Error adding password to PDF:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { addPasswordToPdf, isLoading, error };
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