import { useState } from "react";
import api from "@/api/axios";
import type { ReorderPagesFormValues } from "../types/pdf";
import { isAxiosError } from "axios";

export function usePdfReorder() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reorderPdfPages = async (values: ReorderPagesFormValues, file: File) => {
    if (!file) {
      setError("Please upload a PDF file first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Parse the comma-separated string into an array of integers
      const pageOrder = values.pageOrder.split(',').map(page => parseInt(page.trim(), 10));
      
      // Create form data with file and form values
      const formData = new FormData();
      formData.append("pdf", file);
      
      // Add each page number as a separate parameter with the same name
      pageOrder.forEach(pageNum => {
        formData.append("pageOrder", pageNum.toString());
      });
      
      if (values.outputName) {
        formData.append("outputName", values.outputName);
      }

      // Send request to reorder pages in the PDF
      const response = await api.post("/pdf/reorder", formData, {
        responseType: "blob",
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Handle the download
      handleFileDownload(response);
      
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data || "Error reordering PDF pages. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { reorderPdfPages, isLoading, error };
}

// Helper function to handle file download
function handleFileDownload(response: any) {
  // Get filename from Content-Disposition header
  const contentDisposition = response.headers['content-disposition'];
  let filename = 'reordered.pdf';
  
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