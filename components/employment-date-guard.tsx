"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { FormPageLayout } from "@/components/form-page-layout";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingState } from "./ui/loading-state";

interface EmploymentDateGuardProps {
  isLoading: boolean;
  hasEmploymentDate: boolean;
  children: React.ReactNode;
}

/**
 * Guard component that ensures employment date is set
 * Shows appropriate messages for loading or missing employment date
 */
export function EmploymentDateGuard({
  isLoading,
  hasEmploymentDate,
  children,
}: EmploymentDateGuardProps) {
  const router = useRouter();

  if (isLoading) {
    return <LoadingState fullPage />;
  }

  if (!hasEmploymentDate) {
    return (
      <FormPageLayout
        title={
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span>Employment Date Required</span>
          </div>
        }
        showBackButton={false}
      >
        <ErrorMessage
          message="You must set your employment start date before creating calculations."
          variant="warning"
        />
        <div className="flex justify-center">
          <Button onClick={() => router.push("/")}>
            Go to Home Page to Set Employment Date
          </Button>
        </div>
      </FormPageLayout>
    );
  }

  return <>{children}</>;
}
