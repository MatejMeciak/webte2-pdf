import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { type PdfToImagesFormValues, pdfToImagesFormSchema } from "../types/pdf";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";

interface PdfToImagesConfigFormProps {
  onSubmit: (values: PdfToImagesFormValues, file: File) => Promise<void>;
  file: File | null;
  isLoading: boolean;
  error: string | null;
}

export function PdfToImagesConfigForm({ onSubmit, file, isLoading, error }: PdfToImagesConfigFormProps) {
  const { t } = useTranslation();
  
  const form = useForm<PdfToImagesFormValues>({
    resolver: zodResolver(pdfToImagesFormSchema),
    defaultValues: {
      dpi: 150,
    },
  });

  const handleSubmit = async (values: PdfToImagesFormValues) => {
    if (file) {
      await onSubmit(values, file);
    }
  };

  const canSubmit = !!file;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="dpi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("pdf.toImages.dpi")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t("pdf.toImages.dpiPlaceholder")}
                    min={1}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col space-y-4">
          <Alert className="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
            <AlertDescription>
              <p>{t("pdf.toImages.explanation")}</p>
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={!canSubmit || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("common.processing")}
              </>
            ) : (
              <>
                {t("pdf.toImages.action")}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}