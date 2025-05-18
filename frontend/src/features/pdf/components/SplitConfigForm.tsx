import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Scissors, ArrowRightLeft } from "lucide-react";
import { type SplitFormValues, splitFormSchema } from "../types/pdf";
import { useTranslation } from "react-i18next";

interface SplitConfigFormProps {
  onSubmit: (values: SplitFormValues, file: File) => Promise<void>;
  file: File | null;
  isLoading: boolean;
  error: string | null;
}

export function SplitConfigForm({ onSubmit, file, isLoading, error }: SplitConfigFormProps) {
  const { t } = useTranslation();

  // Initialize form with default values and validation schema
  const form = useForm<SplitFormValues>({
    resolver: zodResolver(splitFormSchema),
    defaultValues: {
      splitAtPage: 1,
      firstOutputName: t('pdf.features.split.placeholders.firstPart'),
      secondOutputName: t('pdf.features.split.placeholders.secondPart'),
    },
  });

  const handleSubmit = (values: SplitFormValues) => {
    if (file) {
      onSubmit(values, file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="splitAtPage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('pdf.features.split.splitAtPage')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={t('pdf.features.split.placeholders.pageNumber')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstOutputName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('pdf.features.split.firstPartFilename')}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t('pdf.features.split.placeholders.firstPart')} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="secondOutputName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('pdf.features.split.secondPartFilename')}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t('pdf.features.split.placeholders.secondPart')} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={!file || isLoading}
        >
          {isLoading ? (
            <>{t('pdf.common.processing')}</>
          ) : (
            <>{t('pdf.features.split.splitAndDownload')}</>
          )}
        </Button>
      </form>
    </Form>
  );
}