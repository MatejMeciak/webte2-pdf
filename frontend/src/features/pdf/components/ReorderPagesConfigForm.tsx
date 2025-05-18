import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { type ReorderPagesFormValues, reorderPagesFormSchema } from "../types/pdf";
import { Loader2, LayoutList, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";

interface ReorderPagesConfigFormProps {
  onSubmit: (values: ReorderPagesFormValues, file: File) => void;
  file: File | null;
  isLoading: boolean;
  error: string | null;
}

export function ReorderPagesConfigForm({ onSubmit, file, isLoading, error }: ReorderPagesConfigFormProps) {
  const { t } = useTranslation();
  
  const form = useForm<ReorderPagesFormValues>({
    resolver: zodResolver(reorderPagesFormSchema),
    defaultValues: {
      pageOrder: "",
      outputName: "",
    },
  });

  const handleSubmit = (values: ReorderPagesFormValues) => {
    if (file) {
      onSubmit(values, file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="pageOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("pdf.reorder.pageOrder")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("pdf.reorder.pageOrderPlaceholder")}
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
                    placeholder={t("pdf.reorder.outputPlaceholder")}
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
              <p>{t("pdf.reorder.explanation")}</p>
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
            disabled={isLoading || !file}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("common.processing")}
              </>
            ) : (
              <>
                {t("pdf.reorder.action")}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}