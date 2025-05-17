import { FileText, Combine, Split, FileX, FileDigit, FileCog, Lock, Unlock, Image, Stamp, RotateCw } from "lucide-react";
import type { PdfAction } from "../types/pdf";

export const pdfActions: PdfAction[] = [
  {
    titleKey: "merge",
    path: "merge",
    icon: Combine,
  },
  {
    titleKey: "split",
    path: "split",
    icon: Split,
  },
  {
    titleKey: "removePage",
    path: "remove-page",
    icon: FileX,
  },
  {
    titleKey: "extractPages",
    path: "extract-pages",
    icon: FileDigit,
  },
  {
    titleKey: "reorderPages",
    path: "reorder-pages",
    icon: FileCog,
  },
  {
    titleKey: "addPassword",
    path: "add-password",
    icon: Lock,
  },
  {
    titleKey: "removePassword",
    path: "remove-password",
    icon: Unlock,
  },
  {
    titleKey: "toImages", // zmenené z "pdfToImages" na "toImages"
    path: "to-images",
    icon: Image,
  },
  {
    titleKey: "addWatermark",
    path: "add-watermark",
    icon: Stamp,
  },
  {
    titleKey: "rotatePages",
    path: "rotate-pages",
    icon: RotateCw,
  },
];
