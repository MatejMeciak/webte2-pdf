import { useState } from "react";
import api from "@/api/axios";
import type { RemovePasswordFormValues } from "../types/pdf";
import { isAxiosError } from "axios";

export function usePdfRemovePassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removePasswordFromPdf = async (values: RemovePasswordFormValues, file: File) => {
    if (!file) {
      setError("Please upload a PDF file first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create form data with file and form values
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("password", values.password);
      if (values.outputName) {
        formData.append("outputName", values.outputName);
      }

      // Send request to remove password from the PDF
      const response = await api.post("/pdf/remove-password", formData, {
        responseType: "blob",
        headers: {
          "Content-Type": "multipart/form-data"
        },
      });

      // Handle the download
      handleFileDownload(response);
      
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data || "Error removing password from PDF. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { removePasswordFromPdf, isLoading, error };
}

// Helper function to handle file download
function handleFileDownload(response: any) {
  // Get filename from Content-Disposition header
  const contentDisposition = response.headers['content-disposition'];
  let filename = 'unprotected.pdf';
  
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?([^"]*)"?/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1];
    }
  }

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