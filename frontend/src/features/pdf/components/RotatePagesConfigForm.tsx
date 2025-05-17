import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { rotatePagesFormSchema, type RotatePagesFormValues } from "../types/pdf";
import { RotateCw } from "lucide-react";
import { z } from "zod";
import { useTranslation } from "react-i18next";

interface RotatePagesConfigFormProps {
  onSubmit: (values: RotatePagesFormValues, file: File) => Promise<void>;
  file: File | null;
  isLoading: boolean;
  error: string | null;
}

// Simple schema for outputName only
const outputNameSchema = z.object({
  outputName: z.string()
    .optional()
    .refine(name => !name || name.endsWith('.pdf'), {
      message: "Filename must end with .pdf"
    }),
});

export function RotatePagesConfigForm({ onSubmit, file, isLoading, error }: RotatePagesConfigFormProps) {
  const { t } = useTranslation();
  const [pagesInput, setPagesInput] = useState("");
  const [rotationsInput, setRotationsInput] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const form = useForm<{ outputName?: string }>({
    resolver: zodResolver(outputNameSchema),
    defaultValues: { outputName: "" },
  });

  // Helper to parse comma-separated input to number array
  const parseNumberArray = (value: string) =>
    value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v !== "")
      .map(Number)
      .filter((n) => !isNaN(n));

  const handleSubmit = async (values: { outputName?: string }) => {
    if (!file) return;
    const pages = parseNumberArray(pagesInput);
    let rotations = parseNumberArray(rotationsInput);

    // If only one rotation is provided and multiple pages, repeat it for all pages
    if (pages.length > 1 && rotations.length === 1) {
      rotations = Array(pages.length).fill(rotations[0]);
    }

    // Validate with Zod
    const result = rotatePagesFormSchema.safeParse({
      pages,
      rotations,
      outputName: values.outputName,
    });

    if (!result.success) {
      setLocalError(result.error.errors[0]?.message || "Invalid input.");
      return;
    }

    setLocalError(null);
    await onSubmit(result.data, file);
  };

  const canSubmit = !!file && pagesInput && rotationsInput;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="pages"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('pdf.features.rotatePages.pages')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('pdf.features.rotatePages.placeholders.pages')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="degrees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('pdf.features.rotatePages.degrees')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('pdf.features.rotatePages.placeholders.degrees')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="outputName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('pdf.features.rotatePages.outputFilename')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder="rotated.pdf"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-center py-4 px-3 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-sm">
            <div className="flex items-center">
              <RotateCw className="h-5 w-5 mr-2" />
              <p>
                {t('pdf.features.rotatePages.instructions')}
              </p>
            </div>
          </div>

          {(localError || error) && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {localError || error}
            </div>
          )}

          <Button
            type="submit"
            disabled={!canSubmit || isLoading}
            className="w-full"
          >
            {isLoading ? t('common.processing') : t('pdf.features.rotatePages.rotateAndDownload')}
          </Button>
        </div>
      </form>
    </Form>
  );
}