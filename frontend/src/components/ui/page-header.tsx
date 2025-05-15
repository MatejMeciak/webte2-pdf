type PageHeaderProps = {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="flex flex-col items-center mb-12">
      <h1 className="text-3xl font-bold tracking-tight text-center">{title}</h1>
      {description && (
        <p className="mt-2 text-center text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}