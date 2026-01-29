import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingStateProps {
  message?: string;
  className?: string;
  fullPage?: boolean;
  withCard?: boolean;
}

export function LoadingState({
  message = "Loading...",
  className = "",
  fullPage = false,
  withCard = false,
}: LoadingStateProps) {
  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground ${className}`}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-5 w-5 animate-spin" />
      {message && <span>{message}</span>}
    </div>
  );

  if (withCard) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-3xl">
          <CardContent className="p-6">{content}</CardContent>
        </Card>
      </div>
    );
  }

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {content}
      </div>
    );
  }

  return content;
}

