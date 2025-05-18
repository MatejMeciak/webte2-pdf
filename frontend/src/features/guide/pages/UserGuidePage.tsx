import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Download, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ApiDocs from "../components/ApiDocs";
import { usePdfActions } from "@/features/pdf/data/pdfActions";

export default function UserGuidePage() {
  const { t } = useTranslation();
  const pdfActions = usePdfActions();

  const handleExportPdf = async () => {
    try {
      const response = await fetch("/api/guide/export-pdf", {
        method: "GET",
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "user-guide.pdf";
      a.click();
    } catch (error) {
      console.error("Failed to export PDF:", error);
    }
  };

  const renderList = (key: string) => {
    try {
      const items = t(key, { returnObjects: true });
      return Array.isArray(items) ? (
        items.map((item, index) => <li key={index}>{item}</li>)
      ) : null;
    } catch (error) {
      console.error(`Error rendering list for key ${key}:`, error);
      return null;
    }
  };

  const renderSteps = () => {
    try {
      const steps = t("guide.features.general.steps", { returnObjects: true });
      if (!Array.isArray(steps)) return null;

      return steps.map((step, index) => (
        <li key={index} className="flex items-start gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {index + 1}
          </span>
          <span className="text-lg pt-1">{step}</span>
        </li>
      ));
    } catch (error) {
      console.error("Error rendering steps:", error);
      return null;
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              {t("guide.title")}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
              {t("guide.overview.description")}
            </p>
          </div>
          <Button onClick={handleExportPdf} size="lg" className="shrink-0">
            <Download className="mr-2 h-5 w-5" />
            {t("guide.exportPdf")}
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pdfActions.map((action) => (
          <Card
            key={action.path}
            className="group hover:shadow-md transition-all"
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <action.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg">
                  {t(`pdf.features.${action.titleKey}.title`)}
                </h3>
              </div>
              <p className="text-muted-foreground">
                {t(`pdf.features.${action.titleKey}.description`)}
              </p>
              <div className="mt-4 pt-4 border-t">
                <ol className="space-y-2">
                  <li className="flex items-center text-sm">
                    <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                    {t("pdf.common.step1")}
                  </li>
                  <li className="flex items-center text-sm">
                    <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                    {t(
                      `pdf.features.${action.titleKey}.instructions` ||
                        "common.configure"
                    )}
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* General Guidelines */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-2xl">
            {t("guide.features.general.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-muted rounded-lg p-6">
            <ol className="space-y-4">{renderSteps()}</ol>
          </div>
        </CardContent>
      </Card>

      {/* API Documentation */}
      <ApiDocs />
    </div>
  );
}
