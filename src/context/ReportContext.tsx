import React, { createContext, useContext, useMemo, useState } from "react";
import type { NumerologyReport, DashaReport, OverlayNumbers } from "@/types";

interface ReportContextValue {
  report: NumerologyReport | null;
  setReport: (r: NumerologyReport | null) => void;

  overlayNumbers: OverlayNumbers;
  setOverlayNumbers: (o: OverlayNumbers) => void;

  dashaReport: DashaReport | null;
  setDashaReport: (r: DashaReport | null) => void;
}

const ReportContext = createContext<ReportContextValue | undefined>(undefined);

/**
 * Report Provider Component
 * Provides numerology report data and dasha periods globally
 */
export const ReportProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [report, setReport] = useState<NumerologyReport | null>(null);
  const [overlayNumbers, setOverlayNumbers] = useState<OverlayNumbers>({});
  const [dashaReport, setDashaReport] = useState<DashaReport | null>(null);

  const value = useMemo(
    () => ({ report, setReport, overlayNumbers, setOverlayNumbers, dashaReport, setDashaReport }),
    [report, overlayNumbers, dashaReport]
  );

  return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>;
};

/**
 * Hook to access report context
 * Must be used within ReportProvider
 */
export function useReport(): ReportContextValue {
  const ctx = useContext(ReportContext);
  if (!ctx) {
    throw new Error("useReport must be used within a ReportProvider");
  }
  return ctx;
}
