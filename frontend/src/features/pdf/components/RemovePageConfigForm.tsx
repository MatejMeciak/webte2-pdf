import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { type RemovePageFormValues, removePageFormSchema } from "../types/pdf";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RemovePageConfigFormProps {
  onSubmit: (values: RemovePageFormValues, file: File) => Promise<void>;
  file: File | null;
  isLoading: boolean;
  error: string | null;
}

export function RemovePageConfigForm({ onSubmit, file, isLoading, error }: RemovePageConfigFormProps) {
  const { t } = useTranslation();

  const form = useForm<RemovePageFormValues>({
    resolver: zodResolver(removePageFormSchema),
    defaultValues: {
      pageToRemove: 1,
      outputName: "",
    },
  });

  const handleSubmit = (values: RemovePageFormValues) => {
    if (file) {
      onSubmit(values, file);
    }
  };

  // Determine if the form can be submitted
  const canSubmit = !!file && !isLoading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* Page number field */}
          <FormField
            control={form.control}
            name="pageToRemove"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("pdf.remove.pageToRemove")}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="1" 
                    {...field} 
                    disabled={!file || isLoading}
                    min={1}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Output filename field */}
          <FormField
            control={form.control}
            name="outputName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("common.outputName")}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="modified.pdf" 
                    {...field} 
                    disabled={!file || isLoading}
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
              <Trash2 className="h-5 w-5 mr-2" />
              <p>
                {t("pdf.remove.explanation", { page: form.watch("pageToRemove") })}
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
            disabled={!canSubmit}
            className="w-full"
          >
            {isLoading ? (
              <>
                {t("common.processing")}
              </>
            ) : (
              <>
                {t("pdf.remove.action")}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}