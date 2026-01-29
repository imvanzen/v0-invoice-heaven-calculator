import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <p className="text-muted-foreground mb-4">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground/80 mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}

