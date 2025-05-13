import { z } from "zod";

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