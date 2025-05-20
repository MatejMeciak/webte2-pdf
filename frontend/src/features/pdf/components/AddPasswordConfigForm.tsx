import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { type AddPasswordFormValues, addPasswordFormSchema } from "../types/pdf";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";

interface AddPasswordConfigFormProps {
  onSubmit: (values: AddPasswordFormValues, file: File) => Promise<void>;
  file: File | null;
  isLoading: boolean;
  error: string | null;
}

export function AddPasswordConfigForm({ onSubmit, file, isLoading, error }: AddPasswordConfigFormProps) {
  const { t } = useTranslation();
  
  const form = useForm<AddPasswordFormValues>({
    resolver: zodResolver(addPasswordFormSchema),
    defaultValues: {
      password: "",
      outputName: "",
    },
  });

  const handleSubmit = async (values: AddPasswordFormValues) => {
    if (file) {
      await onSubmit(values, file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("pdf.password.password")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t("pdf.password.passwordPlaceholder")}
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
                    placeholder={t("pdf.password.outputPlaceholder")}
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
              <p>{t("pdf.password.explanation")}</p>
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
                {t("pdf.password.action")}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}