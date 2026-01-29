import { AlertCircle, AlertTriangle } from "lucide-react";

interface ErrorMessageProps {
  title?: string;
  message: string;
  className?: string;
  variant?: "error" | "warning";
}

export function ErrorMessage({
  title,
  message,
  className = "",
  variant = "error",
}: ErrorMessageProps) {
  const isWarning = variant === "warning";
  const Icon = isWarning ? AlertTriangle : AlertCircle;
  const defaultTitle = isWarning ? "Warning" : "Error";

  const containerClasses = isWarning
    ? "bg-warning-bg border border-warning-border text-warning-text"
    : "bg-destructive-bg border border-destructive-border text-destructive-text";

  return (
    <div
      className={`${containerClasses} p-3 rounded-md text-sm flex gap-2 ${className}`}
      role="alert"
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {(title || defaultTitle) && (
          <p className="font-semibold mb-1">{title || defaultTitle}</p>
        )}
        <p>{message}</p>
      </div>
    </div>
  );
}
