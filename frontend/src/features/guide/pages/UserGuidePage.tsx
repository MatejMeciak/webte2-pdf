import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Download, FileText, Code, BookOpen } from "lucide-react";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { usePdfActions } from "@/features/pdf/data/pdfActions";

// Register fonts that support Slovak characters
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ]
});

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Roboto',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 700,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: 500,
  },
  text: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 1.5,
  },
  section: {
    marginBottom: 20,
  },
  feature: {
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 12,
    marginBottom: 5,
  },
  featureSteps: {
    fontSize: 11,
    marginLeft: 10,
    marginBottom: 5,
    color: '#666',
  }
});

// Helper function to render text with line breaks
const renderTextWithLineBreaks = (text: string, style: any) => {
  return text.split('\n').map((line, index) => (
    <Text key={index} style={style}>
      {line}
    </Text>
  ));
};

// PDF Document Component
const UserGuidePDF = () => {
  const { t, i18n } = useTranslation();
  const pdfActions = usePdfActions();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{t("guide.title")}</Text>
        
        <View style={styles.section}>
          <Text style={styles.subtitle}>{t("guide.introduction.title")}</Text>
          <Text style={styles.text}>{t("guide.introduction.description")}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>{t("guide.features.title")}</Text>
          {pdfActions.map((action) => (
            <View key={action.key} style={styles.feature}>
              <Text style={styles.featureTitle}>{action.title}</Text>
              <Text style={styles.featureDescription}>{action.description}</Text>
              {renderTextWithLineBreaks(t(`guide.features.${action.key}.steps`), styles.featureSteps)}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>{t("guide.api.title")}</Text>
          <Text style={styles.text}>{t("guide.api.description")}</Text>
          <Text style={styles.text}>{t("guide.api.swagger")}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default function UserGuidePage() {
  const { t, i18n } = useTranslation();
  const pdfActions = usePdfActions();

  // Get the appropriate filename based on language
  const getPdfFilename = () => {
    return i18n.language === 'sk' ? 'pouzivatelska-prirucka.pdf' : 'user-guide.pdf';
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title={t("guide.title")}
        description={t("guide.description")}
      />

      <div className="flex justify-end mb-6">
        <PDFDownloadLink
          document={<UserGuidePDF />}
          fileName={getPdfFilename()}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          {({ loading }) => (
            <>
              <Download className="w-4 h-4 mr-2" />
              {loading ? t("common.loading") : t("guide.download")}
            </>
          )}
        </PDFDownloadLink>
      </div>

      <div className="grid gap-6">
        {/* Introduction Section */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">{t("guide.introduction.title")}</h2>
          </div>
          <p className="text-muted-foreground">{t("guide.introduction.description")}</p>
        </Card>

        {/* Features Section */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">{t("guide.features.title")}</h2>
          </div>
          <div className="grid gap-4">
            {pdfActions.map((action) => (
              <div key={action.path} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {action.icon}
                  <h3 className="font-medium">{action.title}</h3>
                </div>
                <p className="text-muted-foreground mb-2">{action.description}</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  {t(`guide.features.${action.key}.steps`).split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* API Documentation Section */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Code className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">{t("guide.api.title")}</h2>
          </div>
          <p className="text-muted-foreground mb-4">{t("guide.api.description")}</p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-mono text-sm">{t("guide.api.swagger")}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.open("/pdfmaster/docs", "_blank")}
            >
              {t("guide.api.openSwagger")}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
