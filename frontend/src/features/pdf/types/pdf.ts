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