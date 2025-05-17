import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { type PdfToImagesFormValues, pdfToImagesFormSchema } from "../types/pdf";
import { Image } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PdfToImagesConfigFormProps {
  onSubmit: (values: PdfToImagesFormValues, file: File) => Promise<void>;
  file: File | null;
  isLoading: boolean;
  error: string | null;
}

export function PdfToImagesConfigForm({ onSubmit, file, isLoading, error }: PdfToImagesConfigFormProps) {
  const form = useForm<PdfToImagesFormValues>({
    resolver: zodResolver(pdfToImagesFormSchema),
    defaultValues: {
      dpi: 150,
    },
  });

  const { t } = useTranslation();

  const handleSubmit = async (values: PdfToImagesFormValues) => {
    if (file) {
      await onSubmit(values, file);
    }
  };

  const canSubmit = !!file;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="dpi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('pdf.features.toImages.dpi')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t('pdf.features.toImages.placeholders.dpi')}
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
              <Image className="h-5 w-5 mr-2" />
              <p>{t('pdf.features.toImages.instructions')}</p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={!canSubmit || isLoading}
            className="w-full"
          >
            {isLoading ? t('common.processing') : t('pdf.features.toImages.convertAndDownload')}
          </Button>
        </div>
      </form>
    </Form>
  );
}