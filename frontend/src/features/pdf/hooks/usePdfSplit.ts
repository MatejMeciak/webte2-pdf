import { useState } from "react";
import api from "@/api/axios";
import type { SplitFormValues } from "../types/pdf";
import { useTranslation } from "react-i18next";

export function usePdfSplit() {
  const { t } = useTranslation();
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
      formData.append("split_at_page", values.splitAtPage.toString());
      
      if (values.firstOutputName) {
        formData.append("first_output_name", values.firstOutputName);
      }
      
      if (values.secondOutputName) {
        formData.append("second_output_name", values.secondOutputName);
      }

      // Send request to split the PDF
      const response = await api.post("/pdf/split", formData, {
        responseType: "blob",
        headers: {
          "Content-Type": "multipart/form-data"
        },
        validateStatus: () => true,
      });

      if (response.status >= 400) {
        setError(t("errors.splitFailed"));
        return;
      }

      // Handle the download
      handleFileDownload(response);
      
    } catch (err) {
      setError(t("errors.unexpected"));
      console.error("Error merging PDFs:", err);
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