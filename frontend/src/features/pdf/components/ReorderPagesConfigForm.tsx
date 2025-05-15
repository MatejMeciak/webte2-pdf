import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { type ReorderPagesFormValues, reorderPagesFormSchema } from "../types/pdf";
import { LayoutList } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ReorderPagesConfigFormProps {
  onSubmit: (values: ReorderPagesFormValues, file: File) => void;
  file: File | null;
  isLoading: boolean;
  error: string | null;
}

export function ReorderPagesConfigForm({ onSubmit, file, isLoading, error }: ReorderPagesConfigFormProps) {
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
                <FormLabel>Page Order</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., 2,1,4,3"
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
                <FormLabel>Output Filename (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="reordered.pdf"
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
            <LayoutList className="h-5 w-5 mr-2" />
            <AlertDescription>
              <p>
                Enter the page numbers in the order you want them to appear in the output PDF. 
                For example, <strong>2,1,4,3</strong> will reorder a 4-page document so that 
                the second page becomes first, the first page becomes second, and so on.
              </p>
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
            {isLoading ? "Processing..." : "Reorder PDF Pages"}
          </Button>
        </div>
      </form>
    </Form>
  );
}