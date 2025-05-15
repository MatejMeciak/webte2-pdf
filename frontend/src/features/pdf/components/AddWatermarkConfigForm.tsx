import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { type AddWatermarkFormValues, addWatermarkFormSchema } from "../types/pdf";
import { Droplet } from "lucide-react";

interface AddWatermarkConfigFormProps {
  onSubmit: (values: AddWatermarkFormValues, file: File) => Promise<void>;
  file: File | null;
  isLoading: boolean;
  error: string | null;
}

export function AddWatermarkConfigForm({ onSubmit, file, isLoading, error }: AddWatermarkConfigFormProps) {
  const form = useForm<AddWatermarkFormValues>({
    resolver: zodResolver(addWatermarkFormSchema),
    defaultValues: {
      watermarkText: "",
      opacity: 0.3,
      fontSize: 40,
      color: "#888888",
      rotation: 45,
      outputName: "",
    },
  });

  const handleSubmit = async (values: AddWatermarkFormValues) => {
    if (file) {
      await onSubmit(values, file);
    }
  };

  const canSubmit = !!file && form.watch("watermarkText").length > 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="watermarkText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Watermark Text</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter watermark text"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="opacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opacity (0-1)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      max={1}
                      placeholder="0.3"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fontSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Font Size</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="40"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color (Hex)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="#888888"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rotation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rotation (degrees)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="45"
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
                    placeholder="watermarked.pdf"
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
              <Droplet className="h-5 w-5 mr-2" />
              <p>
                The watermark will be added to every page of your PDF.
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
            {isLoading ? "Processing..." : "Add Watermark & Download"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 