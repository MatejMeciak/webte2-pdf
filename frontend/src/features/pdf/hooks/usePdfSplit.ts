import { useState } from "react";
import api from "@/api/axios";
import type { SplitFormValues } from "../types/pdf";

export function usePdfSplit() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const splitPdf = async (values: SplitFormValues, file: File) => {
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
      formData.append("splitAtPage", values.splitAtPage.toString());
      
      if (values.firstOutputName) {
        formData.append("firstOutputName", values.firstOutputName);
      }
      
      if (values.secondOutputName) {
        formData.append("secondOutputName", values.secondOutputName);
      }

      // Send request to split the PDF
      const response = await api.post("/pdf/split", formData, {
        responseType: "blob",
        headers: {
          ...api.defaults.headers,
          "Content-Type": "multipart/form-data",
        },
      });

      // Handle the download
      handleFileDownload(response);
      
    } catch (err) {
      if (api.isAxiosError(err)) {
        setError(err.response?.data || "Error splitting PDF. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { splitPdf, isLoading, error };
}

// Helper function to handle file download
function handleFileDownload(response: any) {
  const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  
  // Extract filename from Content-Disposition header or use default
  const contentDisposition = response.headers["content-disposition"];
  const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
  const matches = filenameRegex.exec(contentDisposition || "");
  const filename = matches && matches[1] ? matches[1].replace(/['"]/g, "") : "split_result.zip";
  
  link.href = downloadUrl;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}