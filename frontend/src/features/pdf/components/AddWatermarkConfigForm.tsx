import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { type AddWatermarkFormValues, addWatermarkFormSchema } from "../types/pdf";
import { Droplet } from "lucide-react";
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
                <FormLabel>{t('pdf.features.addWatermark.text')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('pdf.features.addWatermark.placeholders.text')}
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
                <FormLabel>{t('pdf.features.addWatermark.outputFilename')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder="watermarked.pdf"
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
              <Droplet className="h-5 w-5 mr-2" />
              <p>{t('pdf.features.addWatermark.instructions')}</p>
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
            {isLoading ? t('common.processing') : t('pdf.features.addWatermark.addAndDownload')}
          </Button>
        </div>
      </form>
    </Form>
  );
}