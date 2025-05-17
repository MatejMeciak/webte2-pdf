import { Card } from "@/components/ui/card";
import type { IconProps } from "lucide-react";

interface PdfActionCardProps {
  title: string;
  description: string;
  path: string;
  icon: React.ComponentType<IconProps>;
  onClick: (path: string) => void;
}

export function PdfActionCard({ title, description, path, icon: Icon, onClick }: PdfActionCardProps) {
  return (
    <Card
      className="relative p-6 cursor-pointer hover:bg-accent transition-colors"
      onClick={() => onClick(path)}
    >
      <div className="flex items-start space-x-4">
        <Icon className="h-6 w-6 shrink-0" />
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
}
