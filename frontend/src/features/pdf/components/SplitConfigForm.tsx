import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Scissors, ArrowRightLeft } from "lucide-react";
import { type SplitFormValues, splitFormSchema } from "../types/pdf";

interface SplitConfigFormProps {
  onSubmit: (values: SplitFormValues, file: File) => Promise<void>;
  file: File | null;
  isLoading: boolean;
  error: string | null;
}

export function SplitConfigForm({ onSubmit, file, isLoading, error }: SplitConfigFormProps) {
  // Initialize form with default values and validation schema
  const form = useForm<SplitFormValues>({
    resolver: zodResolver(splitFormSchema),
    defaultValues: {
      splitAtPage: 1,
      firstOutputName: "part1.pdf",
      secondOutputName: "part2.pdf",
    },
  });

  const handleSubmit = (values: SplitFormValues) => {
    if (file) {
      onSubmit(values, file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="splitAtPage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Split at page</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter page number"
                    {...field}
                    min={1}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="firstOutputName">First part filename</Label>
              <Input
                id="firstOutputName"
                {...form.register("firstOutputName")}
                placeholder="part1.pdf"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="secondOutputName">Second part filename</Label>
              <Input
                id="secondOutputName"
                {...form.register("secondOutputName")}
                placeholder="part2.pdf"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-center py-4 px-3 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-sm">
            <div className="flex items-center">
              <ArrowRightLeft className="h-5 w-5 mr-2" />
              <p>
                The PDF will be split into two parts. Pages 1 to <strong>{form.watch("splitAtPage")}</strong> will be in the first part, and the remaining pages will be in the second part.
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
            className="w-full"
            disabled={!file || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Scissors className="mr-2 h-4 w-4" />
                Split PDF
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}