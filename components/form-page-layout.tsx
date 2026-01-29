"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PageFooter } from "./page-footer";

interface FormPageLayoutProps {
  title: ReactNode | string;
  description?: string;
  children: ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
}

/**
 * Shared layout for form pages (create/edit)
 * Provides consistent structure with back button and header
 */
export function FormPageLayout({
  title,
  description,
  children,
  showBackButton = true,
  onBack,
}: FormPageLayoutProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push("/");
    }
  };

  const titleContent =
    typeof title === "string" ? (
      <div className="flex items-center gap-2">
        {showBackButton && (
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <span>{title}</span>
      </div>
    ) : (
      title
    );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-3xl">
        <PageHeader
          title={titleContent}
          description={description}
          showLogo={false}
        />
        <CardContent className="space-y-4">{children}</CardContent>

      </Card>
      
      <PageFooter />
    </div>
  );
}

