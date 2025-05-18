import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { type ExtractPagesFormValues, extractPagesFormSchema } from "../types/pdf";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ExtractPagesConfigFormProps {
  onSubmit: (values: ExtractPagesFormValues, file: File) => Promise<void>;
  file: File | null;
  isLoading: boolean;
  error: string | null;
}

export function ExtractPagesConfigForm({ onSubmit, file, isLoading, error }: ExtractPagesConfigFormProps) {
  const { t } = useTranslation();
  
  const form = useForm<ExtractPagesFormValues>({
    resolver: zodResolver(extractPagesFormSchema),
    defaultValues: {
      startPage: 1,
      endPage: 1,
      outputName: "",
    },
  });

  const handleSubmit = async (values: ExtractPagesFormValues) => {
    if (file) {
      await onSubmit(values, file);
    }
  };

  const canSubmit = !!file && 
    form.watch("startPage") > 0 && 
    form.watch("endPage") >= form.watch("startPage");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startPage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("pdf.extract.startPage")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t("pdf.extract.enterStartPage")}
                      min={1}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="endPage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("pdf.extract.endPage")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t("pdf.extract.enterEndPage")}
                      min={form.watch("startPage")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="outputName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("common.outputName")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("pdf.extract.outputPlaceholder")}
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
              <p>
                {t("pdf.extract.explanation", {
                  start: form.watch("startPage"),
                  end: form.watch("endPage")
                })}
              </p>
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
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("common.processing")}
              </>
            ) : (
              <>
                {t("pdf.extract.action")}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}