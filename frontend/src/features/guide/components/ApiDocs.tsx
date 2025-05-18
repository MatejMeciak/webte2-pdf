import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Code, Terminal, ChevronRight } from "lucide-react";

export default function ApiDocs() {
  const { t } = useTranslation();

  const endpoints = [
    "merge",
    "split",
    "removePage",
    "extractPages",
    "reorderPages",
    "addPassword",
    "removePassword",
    "addWatermark",
    "toImages",
    "rotatePages",
  ];

  return (
    <div className="space-y-6">
      <Card className="border-t-4 border-t-primary">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <CardTitle>{t("guide.api.title")}</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("guide.api.description")}
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Authentication Section */}
          <div className="rounded-lg bg-accent/50 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-background">
                <Lock className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold">{t("guide.api.auth.title")}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {t("guide.api.auth.description")}
            </p>
            <pre className="bg-background p-4 rounded-lg text-sm overflow-x-auto">
              {t("guide.api.auth.example")}
            </pre>
          </div>

          {/* Base URL */}
          <div className="px-2">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              {t("guide.api.endpoints.base")}
            </h3>
            <pre className="bg-muted p-4 rounded-lg text-sm font-mono">
              /api
            </pre>
          </div>

          {/* Endpoints */}
          <div>
            <h3 className="font-medium text-lg mb-6 px-2">
              {t("guide.api.endpoints.title")}
            </h3>
            <div className="grid gap-6">
              {endpoints.map((endpoint) => (
                <div
                  key={endpoint}
                  className="border rounded-xl p-6 hover:shadow-md transition-shadow bg-card"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <ChevronRight className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-lg mb-1">
                        {t(`guide.api.endpoints.${endpoint}.title`)}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {t(`guide.api.endpoints.${endpoint}.description`)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <pre className="bg-accent/50 p-3 rounded-lg text-sm font-mono overflow-x-auto">
                      {t(`guide.api.endpoints.${endpoint}.url`)}
                    </pre>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium flex items-center gap-2">
                          <Terminal className="h-3 w-3" />
                          {t("guide.api.common.request")}
                        </p>
                        <pre className="bg-muted p-3 rounded-lg text-sm whitespace-pre-wrap overflow-x-auto">
                          {t(`guide.api.endpoints.${endpoint}.request`)}
                        </pre>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium flex items-center gap-2">
                          <Terminal className="h-3 w-3" />
                          {t("guide.api.common.response")}
                        </p>
                        <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
                          {t(`guide.api.endpoints.${endpoint}.response`)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
