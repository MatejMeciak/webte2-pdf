import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApiDocs() {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("guide.api.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Merge PDFs API */}
        <section>
          <h3 className="font-semibold text-lg">POST /api/pdf/merge</h3>
          <p className="mt-2">{t("guide.api.merge.description")}</p>
          <div className="mt-2">
            <h4 className="font-medium">Request:</h4>
            <pre className="bg-muted p-2 rounded-md mt-1">
              {t("guide.api.merge.request")}
            </pre>
          </div>
          <div className="mt-2">
            <h4 className="font-medium">Response:</h4>
            <pre className="bg-muted p-2 rounded-md mt-1">
              {t("guide.api.merge.response")}
            </pre>
          </div>
        </section>

        {/* Other API endpoints... */}
      </CardContent>
    </Card>
  );
}
