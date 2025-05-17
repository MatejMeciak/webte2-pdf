import { useState } from "react";
import api from "@/api/axios";
import type { MergeFormValues } from "../types/pdf";
import { isAxiosError } from "axios";
import { useTranslation } from "react-i18next";

export function usePdfMerge() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mergePdf = async (values: MergeFormValues, files: File[]) => {
    if (files.length < 2) {
      setError(t('pdf.merge.errors.needTwoFiles'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create form data with files and form values
      const formData = new FormData();
      formData.append("first_pdf", files[0]);
      formData.append("second_pdf", files[1]);
      
      if (values.outputName) {
        formData.append("output_name", values.outputName);
      }

      // Send request to merge the PDFs
      const response = await api.post("/pdf/merge", formData, {
        responseType: "blob",
        headers: {
          "Content-Type": "multipart/form-data"
        },
      });

      // Handle the download
      handleFileDownload(response);
      
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data || t('pdf.merge.errors.mergeFailed'));
      } else {
        setError(t('pdf.common.errors.unexpected'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { mergePdf, isLoading, error };
}

// Helper function to handle file download
function handleFileDownload(response: any) {
  const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  
  // Extract filename from Content-Disposition header or use default
  const contentDisposition = response.headers["content-disposition"];
  const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
  const matches = filenameRegex.exec(contentDisposition || "");
  const filename = matches && matches[1] ? matches[1].replace(/['"]/g, "") : "merged.pdf";
  
  link.href = downloadUrl;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}