import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type PdfActionProps = {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  onClick: (path: string) => void;
};

export function PdfActionCard({
  title,
  description,
  path,
  icon,
  onClick,
}: PdfActionProps) {
  return (
    <Card
      className="group transition-all hover:shadow-md hover:border-primary/50 cursor-pointer h-full flex flex-col"
      onClick={() => onClick(path)}
    >
      <CardHeader className="text-center py-6">
        <div className="mb-4 p-3 rounded-full bg-primary/10 w-fit mx-auto">
          <div className="w-10 h-10 flex items-center justify-center">
            {icon}
          </div>
        </div>
        <CardTitle className="text-center text-xl mb-2">{title}</CardTitle>
        <CardDescription className="text-center text-base">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
