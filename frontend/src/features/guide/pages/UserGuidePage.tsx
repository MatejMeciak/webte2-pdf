import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pdfActions } from "@/features/pdf/data/pdfActions";

export default function UserGuidePage() {
  const { t } = useTranslation();

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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("guide.title")}</h1>
        <Button onClick={handleExportPdf}>
          <Download className="mr-2 h-4 w-4" />
          {t("guide.exportPdf")}
        </Button>
      </div>

      {/* Application Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{t("guide.overview.title")}</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <p className="text-lg">{t("guide.overview.description")}</p>

          <h3 className="text-xl font-semibold mt-6">
            {t("guide.overview.features.title")}
          </h3>
          <ul className="mt-4 space-y-2">
            {renderList("guide.overview.features.list")}
          </ul>
        </CardContent>
      </Card>

      {/* Features Guide */}
      <Card>
        <CardHeader>
          <CardTitle>{t("guide.features.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pdfActions.map((action) => (
              <div key={action.path} className="border rounded-lg p-4">
                <h3 className="font-semibold flex items-center">
                  <action.icon className="h-5 w-5 mr-2" />
                  {t(`pdf.features.${action.titleKey}.title`)}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t(`pdf.features.${action.titleKey}.description`)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Guide */}
      <Card>
        <CardHeader>
          <CardTitle>{t("guide.features.general.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            {renderList("guide.features.general.steps")}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
