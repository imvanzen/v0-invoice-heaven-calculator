"use client";

import type { Calculation, EmploymentDate } from "@/types/calculation";
import { calculateUsageSummary } from "@/utils/limits";
import { getCurrentMonthString } from "@/utils/periods";
import { useEffect, useState, useMemo } from "react";
import { UsageCard } from "@/components/usage-card";

interface UsageSummaryProps {
  calculations: Calculation[];
  employmentDate?: EmploymentDate | null;
}

export function UsageSummary({ calculations }: UsageSummaryProps) {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthString());

  useEffect(() => {
    setCurrentMonth(getCurrentMonthString());
  }, []);

  const summary = useMemo(
    () => calculateUsageSummary(calculations, currentMonth),
    [calculations, currentMonth],
  );

  return (
    <div className="bg-muted/30 rounded-lg p-4 mb-6">
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
        Current Period Usage
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UsageCard title="Master Learner" usage={summary.masterLearner} />
        <UsageCard title="Master Care" usage={summary.masterCare} />
        <UsageCard
          title="Integrations (team-building)"
          usage={summary.integrations}
          additionalNote="Travel and accommodation expenses"
        />
      </div>
    </div>
  );
}
