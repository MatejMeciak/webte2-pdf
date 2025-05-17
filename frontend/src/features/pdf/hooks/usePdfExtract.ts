import { useState } from "react";
import api from "@/api/axios";
import type { ExtractPagesFormValues } from "../types/pdf";
import { isAxiosError } from "axios";

export function usePdfExtract() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractPagesFromPdf = async (values: ExtractPagesFormValues, file: File) => {
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
      formData.append("start_page", values.startPage.toString());
      formData.append("end_page", values.endPage.toString());
      
      if (values.outputName) {
        formData.append("output_name", values.outputName);
      }

      // Send request to extract pages from the PDF
      const response = await api.post("/pdf/extract", formData, {
        responseType: "blob",
        headers: {
          "Content-Type": "multipart/form-data"
        },
      });

      // Handle the download
      handleFileDownload(response);
      
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data || "Error extracting pages from PDF. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { extractPagesFromPdf, isLoading, error };
}

// Helper function to handle file download
function handleFileDownload(response: any) {
  // Get filename from Content-Disposition header
  const contentDisposition = response.headers['content-disposition'];
  let filename = 'extracted.pdf';
  
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