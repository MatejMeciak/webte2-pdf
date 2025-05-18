import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { type RemovePasswordFormValues, removePasswordFormSchema } from "../types/pdf";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";

interface RemovePasswordConfigFormProps {
  onSubmit: (values: RemovePasswordFormValues, file: File) => Promise<void>;
  file: File | null;
  isLoading: boolean;
  error: string | null;
}

export function RemovePasswordConfigForm({ onSubmit, file, isLoading, error }: RemovePasswordConfigFormProps) {
  const { t } = useTranslation();
  
  const form = useForm<RemovePasswordFormValues>({
    resolver: zodResolver(removePasswordFormSchema),
    defaultValues: {
      password: "",
      outputName: "",
    },
  });

  const handleSubmit = async (values: RemovePasswordFormValues) => {
    if (file) {
      await onSubmit(values, file);
    }
  };

  const canSubmit = !!file && form.watch("password").length > 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("pdf.removePassword.password")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t("pdf.removePassword.passwordPlaceholder")}
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
                    placeholder={t("pdf.removePassword.outputPlaceholder")}
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
              <p>{t("pdf.removePassword.explanation")}</p>
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
                {t("pdf.removePassword.action")}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}