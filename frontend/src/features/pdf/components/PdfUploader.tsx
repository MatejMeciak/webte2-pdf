import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { FileType, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PdfUploaderProps {
  file: File | null;
  setFile: (file: File | null) => void;
  feature: string; // Add feature prop
}

export function PdfUploader({ file, setFile, feature }: PdfUploaderProps) {
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
            : t(`pdf.features.${feature}.dragDrop`)}
        </p>
        <Button variant="outline" size="sm" className="mt-4">
          <Upload className="h-4 w-4 mr-2" />
          {t(`pdf.features.${feature}.chooseFile`)}
        </Button>
      </div>
      
      {file && (
        <div className="mt-4 p-3 bg-muted rounded-md flex items-center justify-between">
          <div className="flex items-center overflow-hidden">
            <FileType className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="text-sm truncate" title={file.name}>
              {file.name}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setFile(null)}
          >
            {t('common.remove')}
          </Button>
        </div>
      )}
    </div>
  );
}