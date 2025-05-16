import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/ui/page-header";
import { PdfActionCard } from "@/features/pdf/components/PdfActionCard";
import { pdfActions } from "@/features/pdf/data/pdfActions";

function DashboardPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleActionClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title={t("dashboard.title")}
        description={t("dashboard.description")}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pdfActions.map((action) => (
          <PdfActionCard
            key={action.path}
            title={t(`pdf.actions.${action.titleKey}.title`)}
            description={t(`pdf.actions.${action.titleKey}.description`)}
            path={action.path}
            icon={action.icon}
            onClick={handleActionClick}
          />
        ))}
      </div>
    </div>
  );
}

export default DashboardPage;
