// src/lib/numerology/shape.ts
import { calculateNumerology } from "./calculateNumerology";
import { dashaCalculator } from "./dashaCalculator";
import type { Report, DashaReport, DashaSpan } from "./types";

const toDate = (v: any) => (v instanceof Date ? v : new Date(v));

const normSpan = (s: any): DashaSpan => ({
  dashaNumber: Number(s.dashaNumber),
  startDate: toDate(s.startDate),
  endDate: toDate(s.endDate),
  year: s.year !== undefined ? Number(s.year) : undefined,
  month: s.month !== undefined ? Number(s.month) : undefined,
  date: s.date ? toDate(s.date) : undefined,
});

export function ensureReportShape(raw: any): Report {
  return {
    dob: toDate(raw.dob),
    name: String(raw.name ?? ""),
    basicNumber: Number(raw.basicNumber),
    destinyNumber: Number(raw.destinyNumber),
    baseKundliGrid: Array.isArray(raw.baseKundliGrid) ? raw.baseKundliGrid.slice(0, 10) : new Array(10).fill(0),
    recurringNumbersAnalysis: Array.isArray(raw.recurringNumbersAnalysis) ? raw.recurringNumbersAnalysis : [],
    yogas: Array.isArray(raw.yogas) ? raw.yogas : [],
    specialInsights: Array.isArray(raw.specialInsights) ? raw.specialInsights : [],
  };
}

export function ensureDashaReportShape(raw: any): DashaReport {
  return {
    mahaDashaTimeline: (raw.mahaDashaTimeline || []).map(normSpan),
    yearlyDashaTimeline: (raw.yearlyDashaTimeline || []).map(normSpan),
    monthlyDashaTimeline: (raw.monthlyDashaTimeline || []).map(normSpan),
    dailyDashaTimeline: (raw.dailyDashaTimeline || []).map((d: any) => ({
      date: toDate(d.date),
      dashaNumber: Number(d.dashaNumber),
    })),
  };
}

/**
 * Unified generator:
 * - calls your calculateNumerology
 * - builds maha/yearly/monthly/daily via dashaCalculator
 * - normalizes all shapes/dates
 */
export function generateReport(dobISO: string, name: string): { report: Report; dasha: DashaReport } {
  // Your calculator may accept (dob, DATA). If so, keep your internal DATA usage inside calculateNumerology.
  const rawReport = calculateNumerology(dobISO, undefined as any);
  const report = ensureReportShape({ ...rawReport, name });

  const maha = dashaCalculator.calculateMahaDasha(report.dob, report.basicNumber);
  const yearly = dashaCalculator.calculateYearlyDasha(report.dob, report.basicNumber);
  const monthly = dashaCalculator.calculateMonthlyDasha(yearly);
  const daily = dashaCalculator.calculateDailyDasha(monthly);

  const dasha = ensureDashaReportShape({
    mahaDashaTimeline: maha,
    yearlyDashaTimeline: yearly,
    monthlyDashaTimeline: monthly,
    dailyDashaTimeline: daily,
  });

  return { report, dasha };
}
