import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Combine } from "lucide-react";
import { type MergeFormValues, mergeFormSchema } from "../types/pdf";
import { useTranslation } from "react-i18next";

interface MergeConfigFormProps {
  onSubmit: (values: MergeFormValues, files: File[]) => void;
  files: File[];
  isLoading: boolean;
  error: string | null;
}

export function MergeConfigForm({ onSubmit, files, isLoading, error }: MergeConfigFormProps) {
  const form = useForm<MergeFormValues>({
    resolver: zodResolver(mergeFormSchema),
    defaultValues: {
      outputName: "",
    },
  });

  const { t } = useTranslation();

  const handleSubmit = (values: MergeFormValues) => {
    if (files.length >= 2) {
      onSubmit(values, files);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="outputName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("common.outputName")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("pdf.merge.outputPlaceholder")}
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={files.length < 2 || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("common.processing")}
              </>
            ) : (
              <>
                <Combine className="mr-2 h-4 w-4" />
                {t("pdf.merge.action")}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}