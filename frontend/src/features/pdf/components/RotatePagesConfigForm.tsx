import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { rotatePagesFormSchema, type RotatePagesFormValues } from "../types/pdf";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";

interface RotatePagesConfigFormProps {
  onSubmit: (values: RotatePagesFormValues, file: File) => Promise<void>;
  file: File | null;
  isLoading: boolean;
  error: string | null;
}

export function RotatePagesConfigForm({ onSubmit, file, isLoading, error }: RotatePagesConfigFormProps) {
  const { t } = useTranslation();
  const [pagesInput, setPagesInput] = useState("");
  const [rotationsInput, setRotationsInput] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  // Initialize the form with just the outputName field from the full schema
  const form = useForm<{ outputName?: string }>({
    defaultValues: { outputName: "" },
  });

  // Helper to parse comma-separated input to number array
  const parseNumberArray = (value: string) =>
    value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v !== "")
      .map(Number)
      .filter((n) => !isNaN(n));

  const handleSubmit = async (values: { outputName?: string }) => {
    if (!file) return;
    const pages = parseNumberArray(pagesInput);
    let rotations = parseNumberArray(rotationsInput);

    // If only one rotation is provided and multiple pages, repeat it for all pages
    if (pages.length > 1 && rotations.length === 1) {
      rotations = Array(pages.length).fill(rotations[0]);
    }

    // Validate with the full schema
    const result = rotatePagesFormSchema.safeParse({
      pages,
      rotations,
      outputName: values.outputName,
    });

    if (!result.success) {
      setLocalError(result.error.errors[0]?.message || "Invalid input.");
      return;
    }

    setLocalError(null);
    await onSubmit(result.data, file);
  };

  const canSubmit = !!file && pagesInput && rotationsInput;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-4">
          <div>
            <FormLabel className="block text-sm font-medium mb-1">
              {t("pdf.rotate.pages")}
            </FormLabel>
            <Input
              type="text"
              value={pagesInput}
              onChange={e => setPagesInput(e.target.value)}
              placeholder={t("pdf.rotate.pagesPlaceholder")}
            />
          </div>
          <div>
            <FormLabel className="block text-sm font-medium mb-1">
              {t("pdf.rotate.rotations")}
            </FormLabel>
            <Input
              type="text"
              value={rotationsInput}
              onChange={e => setRotationsInput(e.target.value)}
              placeholder={t("pdf.rotate.rotationsPlaceholder")}
            />
            <span className="text-xs text-muted-foreground">
              {t("pdf.rotate.explanation")}
            </span>
          </div>
          <FormField
            control={form.control}
            name="outputName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("common.outputName")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("pdf.rotate.outputPlaceholder")}
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
              {t("pdf.rotate.explanation")}
            </AlertDescription>
          </Alert>

          {(localError || error) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {localError || error}
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
              t("pdf.rotate.action")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}