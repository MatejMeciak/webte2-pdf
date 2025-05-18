import { useState } from "react";
import api from "@/api/axios";
import type { PdfToImagesFormValues } from "../types/pdf";
import { useTranslation } from "react-i18next";

export function usePdfToImages() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertPdfToImages = async (values: PdfToImagesFormValues, file: File) => {
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
      if (values.dpi) {
        formData.append("dpi", values.dpi.toString());
      }

      // Send request to convert PDF to images
      const response = await api.post("/pdf/to-images", formData, {
        responseType: "blob",
        headers: {
          "Content-Type": "multipart/form-data"
        },
        validateStatus: () => true, // Always resolve, handle status manually
      });

      // Check for error status
      if (response.status >= 400) {
        setError(t("errors.toImagesFailed"));
        return;
      }

      // Only handle download if status is OK
      handleFileDownload(response);
      
    } catch (err) {
      setError(t("errors.unexpected"));
      console.error("Error converting PDF to images:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { convertPdfToImages, isLoading, error };
}

// Helper function to handle file download
function handleFileDownload(response: any) {
  // Get filename from Content-Disposition header
  const contentDisposition = response.headers['content-disposition'];
  let filename = 'images.zip';
  
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?([^"]*)"?/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1];
    }
  }

  // Create blob URL and trigger download
  const blob = new Blob([response.data], { type: 'application/zip' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}