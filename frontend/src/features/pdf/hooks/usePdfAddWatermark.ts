import { useState } from "react";
import api from "@/api/axios";
import type { AddWatermarkFormValues } from "../types/pdf";
import { isAxiosError } from "axios";

export function usePdfAddWatermark() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addWatermarkToPdf = async (values: AddWatermarkFormValues, file: File) => {
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
      formData.append("watermarkText", values.watermarkText);
      if (values.opacity !== undefined) {
        formData.append("opacity", values.opacity.toString());
      }
      if (values.fontSize !== undefined) {
        formData.append("fontSize", values.fontSize.toString());
      }
      if (values.color) {
        formData.append("color", values.color);
      }
      if (values.rotation !== undefined) {
        formData.append("rotation", values.rotation.toString());
      }
      if (values.outputName) {
        formData.append("outputName", values.outputName);
      }

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
        let errorMsg = "Error adding watermark to PDF. Please try again.";
        if (response.data instanceof Blob) {
          try {
            const text = await response.data.text();
            errorMsg = text || errorMsg;
          } catch {
            // fallback to default
          }
        }
        setError(errorMsg);
        return;
      }

      // Only handle download if status is OK
      handleFileDownload(response);
      
    } catch (err) {
      if (isAxiosError(err)) {
        let errorMsg = "Error adding watermark to PDF. Please try again.";
        if (err.response?.data instanceof Blob) {
          try {
            const text = await err.response.data.text();
            errorMsg = text || errorMsg;
          } catch {
            // fallback to default
          }
        } else if (typeof err.response?.data === "string") {
          errorMsg = err.response.data;
        }
        setError(errorMsg);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { addWatermarkToPdf, isLoading, error };
}

// Helper function to handle file download
function handleFileDownload(response: any) {
  // Get filename from Content-Disposition header
  const contentDisposition = response.headers['content-disposition'];
  let filename = 'watermarked.pdf';
  
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