import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { type AddPasswordFormValues, addPasswordFormSchema } from "../types/pdf";
import { Lock } from "lucide-react";

interface AddPasswordConfigFormProps {
  onSubmit: (values: AddPasswordFormValues, file: File) => Promise<void>;
  file: File | null;
  isLoading: boolean;
  error: string | null;
}

export function AddPasswordConfigForm({ onSubmit, file, isLoading, error }: AddPasswordConfigFormProps) {
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

  const canSubmit = !!file && form.watch("password").length > 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter password to protect PDF"
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
                    placeholder="protected.pdf"
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
              <Lock className="h-5 w-5 mr-2" />
              <p>
                The uploaded PDF will be encrypted with the password you provide.
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
            {isLoading ? "Processing..." : "Add Password & Download"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 