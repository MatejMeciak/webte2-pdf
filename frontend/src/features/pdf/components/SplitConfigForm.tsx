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
      firstOutputName: t('pdf.split.placeholders.firstPart'),
      secondOutputName: t('pdf.split.placeholders.secondPart'),
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
              <FormLabel>{t('pdf.split.splitAtPage')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={t('pdf.split.placeholders.pageNumber')}
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
                <FormLabel>{t('pdf.split.firstPartFilename')}</FormLabel>
                <FormControl>
                  <Input placeholder="part1.pdf" {...field} />
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
                <FormLabel>{t('pdf.split.secondPartFilename')}</FormLabel>
                <FormControl>
                  <Input placeholder="part2.pdf" {...field} />
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
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('pdf.common.processing')}
            </>
          ) : (
            <>
              <Scissors className="mr-2 h-4 w-4" />
              {t('pdf.split.splitAndDownload')}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}