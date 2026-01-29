"use client";

import { ReactNode } from "react";
import { CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface PageHeaderProps {
  title?: string | ReactNode;
  description?: string;
  actions?: ReactNode;
  showThemeToggle?: boolean;
  showLogo?: boolean;
}

export function PageHeader({
  title,
  description,
  actions,
  showThemeToggle = true,
  showLogo = true,
}: PageHeaderProps) {
  return (
    <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 pb-4">
      <div className="space-y-1 min-w-0">
        {showLogo && <Logo />}
        {title && (
          <CardTitle className="text-base sm:text-lg md:text-xl">
            {title}
          </CardTitle>
        )}
        {description && (
          <CardDescription className="text-xs sm:text-sm">
            {description}
          </CardDescription>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0">
        {actions}
        {showThemeToggle && <ThemeToggle />}
      </div>
    </CardHeader>
  );
}
