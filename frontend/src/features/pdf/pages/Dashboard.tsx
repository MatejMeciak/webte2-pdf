import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/ui/page-header";
import { PDF_TOOLS } from "@/constants/pdfTools";
import { PdfActionCard } from "@/components/pdf/PdfActionCard";
import { useUser } from "@/hooks/useUser";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useUser();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.description')}
      />
      
      {/* Add welcome message */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold">
          {t('dashboard.welcome')}
          {user?.firstName ? `, ${user.firstName}` : ''}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {PDF_TOOLS.map((tool) => (
          <PdfActionCard
            key={tool.path}
            title={t(`pdf.features.${tool.id}.title`)}
            description={t(`pdf.features.${tool.id}.description`)}
            path={tool.path}
            icon={tool.icon}
            onClick={navigate}
          />
        ))}
      </div>
    </div>
  );
}