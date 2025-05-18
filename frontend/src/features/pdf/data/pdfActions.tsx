import { useTranslation } from "react-i18next";
import { 
  FilePlus, 
  FileOutput, 
  FileX, 
  FileDigit, 
  ListRestart, 
  Lock, 
  Unlock, 
  Images, 
  Stamp, 
  RotateCw 
} from "lucide-react";

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
      icon: <FilePlus size={24} />,
    },
    {
      title: t("pdf.split.title"),
      description: t("pdf.split.description"),
      path: "/split",
      icon: <FileOutput size={24} />,
    },
    {
      title: t("pdf.remove.title"),
      description: t("pdf.remove.description"),
      path: "/remove",
      icon: <FileX size={24} />,
    },
    {
      title: t("pdf.extract.title"),
      description: t("pdf.extract.description"),
      path: "/extract",
      icon: <FileDigit size={24} />,
    },
    {
      title: t("pdf.reorder.title"),
      description: t("pdf.reorder.description"),
      path: "/reorder",
      icon: <ListRestart size={24} />,
    },
    {
      title: t("pdf.password.title"),
      description: t("pdf.password.description"),
      path: "/add-password",
      icon: <Lock size={24} />,
    },
    {
      title: t("pdf.removePassword.title"),
      description: t("pdf.removePassword.description"),
      path: "/remove-password",
      icon: <Unlock size={24} />,
    },
    {
      title: t("pdf.toImages.title"),
      description: t("pdf.toImages.description"),
      path: "/to-images",
      icon: <Images size={24} />,
    },
    {
      title: t("pdf.watermark.title"),
      description: t("pdf.watermark.description"),
      path: "/add-watermark",
      icon: <Stamp size={24} />,
    },
    {
      title: t("pdf.rotate.title"),
      description: t("pdf.rotate.description"),
      path: "/rotate",
      icon: <RotateCw size={24} />,
    },
  ];

  return pdfActions;
}