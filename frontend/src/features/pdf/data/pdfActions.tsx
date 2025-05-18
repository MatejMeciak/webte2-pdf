import { useTranslation } from "react-i18next";

export type PdfAction = {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
};

export function usePdfActions() {
  const { t } = useTranslation();

  const pdfActions: PdfAction[] = [
    {
      title: t("pdf.merge.title"),
      description: t("pdf.merge.description"),
      path: "/merge",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M9 3v18" />
          <path d="M15 3v18" />
        </svg>
      ),
    },
    {
      title: t("pdf.split.title"),
      description: t("pdf.split.description"),
      path: "/split",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M12 3v18" />
        </svg>
      ),
    },
    {
      title: t("pdf.remove.title"),
      description: t("pdf.remove.description"),
      path: "/remove",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      ),
    },
    {
      title: t("pdf.extract.title"),
      description: t("pdf.extract.description"),
      path: "/extract",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <line x1="9" y1="3" x2="9" y2="21" />
          <line x1="15" y1="3" x2="15" y2="21" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="3" y1="15" x2="21" y2="15" />
        </svg>
      ),
    },
    {
      title: t("pdf.reorder.title"),
      description: t("pdf.reorder.description"),
      path: "/reorder",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
          <line x1="17" y1="4" x2="17" y2="8" />
          <line x1="7" y1="10" x2="7" y2="14" />
          <line x1="13" y1="16" x2="13" y2="20" />
        </svg>
      ),
    },
    {
      title: t("pdf.addPassword.title"),
      description: t("pdf.addPassword.description"),
      path: "/add-password",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          <circle cx="12" cy="16" r="1" />
        </svg>
      ),
    },
    {
      title: t("pdf.removePassword.title"),
      description: t("pdf.removePassword.description"),
      path: "/remove-password",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          <line x1="12" y1="16" x2="12" y2="16" />
          <line x1="9" y1="16" x2="15" y2="16" />
        </svg>
      ),
    },
    {
      title: t("pdf.toImages.title"),
      description: t("pdf.toImages.description"),
      path: "/to-images",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ),
    },
    {
      title: t("pdf.addWatermark.title"),
      description: t("pdf.addWatermark.description"),
      path: "/add-watermark",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20V10" />
          <path d="M18 20V4" />
          <path d="M6 20v-4" />
          <rect x="4" y="20" width="16" height="2" rx="1" />
        </svg>
      ),
    },
    {
      title: t("pdf.rotate.title"),
      description: t("pdf.rotate.description"),
      path: "/rotate",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="23 4 23 10 17 10" />
          <path d="M1 19A9 9 0 0 1 20.39 7.61L23 10" />
        </svg>
      ),
    },
  ];

  return pdfActions;
}