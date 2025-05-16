import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { FileType, Upload, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MultiPdfUploaderProps {
  files: File[];
  setFiles: (files: File[]) => void;
  maxFiles?: number;
}

export function MultiPdfUploader({ 
  files, 
  setFiles, 
  maxFiles = 10 
}: MultiPdfUploaderProps) {
  const { t } = useTranslation();

  // Handle file drop with react-dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFiles([...files, ...acceptedFiles]);
      }
    },
  });

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

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
          {isDragActive ? t('common.dropFileHere') : t('pdf.common.dragDrop')}
        </p>
        <Button variant="outline" size="sm" className="mt-4">
          <Upload className="h-4 w-4 mr-2" />
          {t('pdf.common.chooseFiles')}
        </Button>
      </div>
      
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">{t('pdf.merge.selectedFiles', { count: files.length })}</p>
          {files.map((file, index) => (
            <div 
              key={`${file.name}-${index}`}
              className="p-3 bg-muted rounded-md flex items-center justify-between"
            >
              <div className="flex items-center overflow-hidden">
                <FileType className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="text-sm truncate" title={file.name}>
                  {file.name}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => removeFile(index)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          {files.length >= 2 && (
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setFiles([])}
                className="mt-2"
              >
                {t('pdf.common.removeAll')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}