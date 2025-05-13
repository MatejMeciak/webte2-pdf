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