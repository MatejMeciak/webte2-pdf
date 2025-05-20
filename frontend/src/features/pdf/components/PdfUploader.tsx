import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { FileType, Upload, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PdfUploaderProps {
  file: File | null;
  setFile: (file: File | null) => void;
}

export function PdfUploader({ file, setFile }: PdfUploaderProps) {
  const { t } = useTranslation();

  // Handle file drop with react-dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    },
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors flex flex-col items-center justify-center min-h-40 ${
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <FileType className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-sm text-center text-muted-foreground">
          {isDragActive 
            ? t('common.dropFileHere') 
            : t('common.dragDropHere')}
        </p>
        <Button variant="outline" size="sm" className="mt-4">
          <Upload className="h-4 w-4 mr-2" />
          {t(`common.chooseFile`)}
        </Button>
      </div>
      
      {file && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
          <span className="text-sm truncate flex-1" title={file.name}>
            {file.name}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0"
            onClick={() => setFile(null)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">{t('common.remove')}</span>
          </Button>
        </div>
      )}
    </div>
  );
}