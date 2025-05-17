import { z } from "zod";
import type { IconProps } from "lucide-react";

// Schema for split PDF form
export const splitFormSchema = z.object({
  splitAtPage: z.coerce
    .number()
    .positive("Page number must be positive")
    .min(1, "Page must be at least 1"),
  firstOutputName: z.string().optional(),
  secondOutputName: z.string().optional(),
});

export type SplitFormValues = z.infer<typeof splitFormSchema>;

// Schema for merge PDF form
export const mergeFormSchema = z.object({
  outputName: z.string()
    .min(1, "Output filename is required")
    .refine(name => name.endsWith('.pdf'), {
      message: "Filename must end with .pdf"
    }),
});

export type MergeFormValues = z.infer<typeof mergeFormSchema>;

// Schema for remove page PDF form
export const removePageFormSchema = z.object({
  pageToRemove: z.coerce
    .number()
    .positive("Page number must be positive")
    .min(1, "Page must be at least 1"),
  outputName: z.string()
    .optional()
    .refine(name => !name || name.endsWith('.pdf'), {
      message: "Filename must end with .pdf"
    }),
});

export type RemovePageFormValues = z.infer<typeof removePageFormSchema>;

// Schema for extract PDF pages form
export const extractPagesFormSchema = z.object({
  startPage: z.coerce
    .number()
    .positive("Start page must be positive")
    .min(1, "Start page must be at least 1"),
  endPage: z.coerce
    .number()
    .positive("End page must be positive")
    .min(1, "End page must be at least 1"),
  outputName: z.string()
    .optional()
    .refine(name => !name || name.endsWith('.pdf'), {
      message: "Filename must end with .pdf"
    }),
});

export type ExtractPagesFormValues = z.infer<typeof extractPagesFormSchema>;

// Schema for reorder PDF pages form
export const reorderPagesFormSchema = z.object({
  pageOrder: z.string()
    .min(1, "Page order is required")
    .refine(value => {
      // Check if the input is a valid comma-separated list of positive integers
      return /^(\d+)(,\s*\d+)*$/.test(value);
    }, {
      message: "Page order must be a comma-separated list of page numbers (e.g., '1,3,2,4')"
    }),
  outputName: z.string()
    .optional()
    .refine(name => !name || name.endsWith('.pdf'), {
      message: "Filename must end with .pdf"
    }),
});

export type ReorderPagesFormValues = z.infer<typeof reorderPagesFormSchema>;

// Schema for add password to PDF form
export const addPasswordFormSchema = z.object({
  password: z.string()
    .min(1, "Password is required"),
  outputName: z.string()
    .optional()
    .refine(name => !name || name.endsWith('.pdf'), {
      message: "Filename must end with .pdf"
    }),
});

export type AddPasswordFormValues = z.infer<typeof addPasswordFormSchema>;

// Schema for remove password from PDF form
export const removePasswordFormSchema = z.object({
  password: z.string()
    .min(1, "Password is required"),
  outputName: z.string()
    .optional()
    .refine(name => !name || name.endsWith('.pdf'), {
      message: "Filename must end with .pdf"
    }),
});

export type RemovePasswordFormValues = z.infer<typeof removePasswordFormSchema>;

// Schema for PDF to Images form
export const pdfToImagesFormSchema = z.object({
  dpi: z.coerce
    .number()
    .positive("DPI must be positive")
    .min(1, "DPI must be at least 1")
    .default(150)
    .optional(),
});

export type PdfToImagesFormValues = z.infer<typeof pdfToImagesFormSchema>;

// Schema for add watermark to PDF form
export const addWatermarkFormSchema = z.object({
  watermarkText: z.string().min(1, "Watermark text is required"),
  opacity: z.coerce
    .number()
    .min(0, "Opacity must be at least 0.0")
    .max(1, "Opacity must be at most 1.0")
    .default(0.3)
    .optional(),
  fontSize: z.coerce
    .number()
    .min(1, "Font size must be positive")
    .default(40)
    .optional(),
  color: z.string()
    .default("#888888")
    .optional(),
  rotation: z.coerce
    .number()
    .default(45)
    .optional(),
  outputName: z.string()
    .optional()
    .refine(name => !name || name.endsWith('.pdf'), {
      message: "Filename must end with .pdf"
    }),
});

export type AddWatermarkFormValues = z.infer<typeof addWatermarkFormSchema>;

// Schema for rotate PDF pages form
export const rotatePagesFormSchema = z.object({
  pages: z.array(z.coerce.number().positive("Page number must be positive")).min(1, "At least one page is required"),
  rotations: z.array(z.coerce.number()).min(1, "At least one rotation is required"),
  outputName: z.string()
    .optional()
    .refine(name => !name || name.endsWith('.pdf'), {
      message: "Filename must end with .pdf"
    }),
}).refine((data) => data.pages.length === data.rotations.length, {
  message: "Number of pages and rotations must match",
  path: ["rotations"],
});

export type RotatePagesFormValues = z.infer<typeof rotatePagesFormSchema>;

export interface PdfAction {
  titleKey: string;
  path: string;
  icon: React.ComponentType<IconProps>;
}