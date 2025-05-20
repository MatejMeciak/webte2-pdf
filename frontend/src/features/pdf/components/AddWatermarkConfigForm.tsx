import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { type AddWatermarkFormValues, addWatermarkFormSchema } from "../types/pdf";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";

interface AddWatermarkConfigFormProps {
  onSubmit: (values: AddWatermarkFormValues, file: File) => Promise<void>;
  file: File | null;
  isLoading: boolean;
  error: string | null;
}

export function AddWatermarkConfigForm({ onSubmit, file, isLoading, error }: AddWatermarkConfigFormProps) {
  const { t } = useTranslation();
  const form = useForm<AddWatermarkFormValues>({
    resolver: zodResolver(addWatermarkFormSchema),
    defaultValues: {
      watermarkText: "",
      outputName: "",
    },
  });

  const handleSubmit = async (values: AddWatermarkFormValues) => {
    if (file) {
      await onSubmit(values, file);
    }
  };

  const canSubmit = !!file && form.watch("watermarkText").length > 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="watermarkText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("pdf.watermark.watermarkText")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("pdf.watermark.watermarkTextPlaceholder")}
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
                <FormLabel>{t("common.outputName")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("pdf.watermark.outputPlaceholder")}
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
              {t("pdf.watermark.explanation")}
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
              t("pdf.watermark.action")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}