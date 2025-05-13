import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { type ExtractPagesFormValues, extractPagesFormSchema } from "../types/pdf";
import { Scissors } from "lucide-react";

interface ExtractPagesConfigFormProps {
  onSubmit: (values: ExtractPagesFormValues, file: File) => Promise<void>;
  file: File | null;
  isLoading: boolean;
  error: string | null;
}

export function ExtractPagesConfigForm({ onSubmit, file, isLoading, error }: ExtractPagesConfigFormProps) {
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
                  <FormLabel>Start Page</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="1"
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
                  <FormLabel>End Page</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 5"
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
                <FormLabel>Output Filename (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="extracted.pdf"
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
              <Scissors className="h-5 w-5 mr-2" />
              <p>
                Pages <strong>{form.watch("startPage")}</strong> to <strong>{form.watch("endPage")}</strong> will be extracted from the PDF into a new document.
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
            {isLoading ? "Processing..." : "Extract Pages & Download"}
          </Button>
        </div>
      </form>
    </Form>
  );
}