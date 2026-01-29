"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currency";

export interface UsageData {
  used: number;
  limit: number;
  remaining: number;
  period: string;
}

interface UsageCardProps {
  title: string;
  usage: UsageData;
  showEmploymentWarning?: boolean;
  additionalNote?: string;
}

function getRemainingClass(remaining: number, limit: number) {
  const percentage = (remaining / limit) * 100;
  if (remaining <= 0) {
    return "text-destructive";
  } else if (percentage < 10) {
    return "text-orange-600 dark:text-orange-400";
  }
  return "text-muted-foreground";
}

export function UsageCard({
  title,
  usage,
  showEmploymentWarning = false,
  additionalNote,
}: UsageCardProps) {
  return (
    <Card className="border-none shadow-none bg-background/50">
      <CardContent className="p-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tabular-nums">
            {formatCurrency(usage.used, true)}
            <span className="text-sm text-muted-foreground font-normal">
              {" "}
              / {formatCurrency(usage.limit, true)}
            </span>
          </p>
          <p
            className={`text-xs ${getRemainingClass(usage.remaining, usage.limit)}`}
          >
            Remaining: {formatCurrency(usage.remaining, true)}
          </p>
          <p className="text-xs text-muted-foreground italic">
            Period: {usage.period}
          </p>
          {showEmploymentWarning && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
              ⚠ Set your employment date for accurate limits
            </p>
          )}
          {additionalNote && (
            <p className="text-xs text-muted-foreground">{additionalNote}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

