import { FileText, Combine, Split, FileX, FileDigit, FileCog, Lock, Unlock, Image, Stamp, RotateCw } from "lucide-react";
import type { PdfAction } from "../types/pdf";

export const pdfActions: PdfAction[] = [
  {
    titleKey: "merge",
    path: "/pdf/merge",
    icon: Combine,
  },
  {
    titleKey: "split",
    path: "/pdf/split",
    icon: Split,
  },
  {
    titleKey: "removePage",
    path: "/pdf/remove-page",
    icon: FileX,
  },
  {
    titleKey: "extractPages",
    path: "/pdf/extract-pages",
    icon: FileDigit,
  },
  {
    titleKey: "reorderPages",
    path: "/pdf/reorder-pages",
    icon: FileCog,
  },
  {
    titleKey: "addPassword",
    path: "/pdf/add-password",
    icon: Lock,
  },
  {
    titleKey: "removePassword",
    path: "/pdf/remove-password",
    icon: Unlock,
  },
  {
    titleKey: "toImages", // zmenené z "pdfToImages" na "toImages"
    path: "/pdf/to-images",
    icon: Image,
  },
  {
    titleKey: "addWatermark",
    path: "/pdf/add-watermark",
    icon: Stamp,
  },
  {
    titleKey: "rotatePages",
    path: "/pdf/rotate-pages",
    icon: RotateCw,
  },
];
