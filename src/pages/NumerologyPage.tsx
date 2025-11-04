// src/pages/app/NumerologyPage.tsx
import React, { useState, useCallback } from "react";
import NumerologyApp from "@/features/dashboard/components/NumerologyApp";

// Engines
import { calculateNumerology as baseCalculateNumerology } from "@/lib/numerology/engine";
import { dashaCalculator } from "@/lib/numerology/dasha";

// UI
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// ✅ Global report context
import { useReport } from "@/context/ReportContext";

export default function NumerologyPage() {
  const [isPremium, setIsPremium] = useState(false);
  const { setReport } = useReport();

  // ✅ Wrap the engine so every successful generation updates global context
  const calculateNumerology = useCallback(
    (...args: any[]) => {
      const result = (baseCalculateNumerology as any)(...args);

      // handle both shapes safely:
      // 1) returns { report, ... }
      // 2) returns report object directly
      const maybeReport =
        result && typeof result === "object" && "report" in result ? (result as any).report : result;

      if (maybeReport) setReport(maybeReport);
      return result;
    },
    [setReport]
  );

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Page Heading */}
      <Card>
        <CardHeader>
          <CardTitle>Numerology Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm opacity-80">
            Enter your details, generate your report, and browse the tabs below.
          </p>
        </CardContent>
      </Card>

      {/* Tabbed numerology dashboard */}
      <NumerologyApp
        onLogout={() => {}}
        isPremium={isPremium}
        setIsPremium={setIsPremium}
        calculateNumerology={calculateNumerology}   {/* ✅ wrapped */}
        dashaCalculator={dashaCalculator}
      />
    </div>
  );
}
