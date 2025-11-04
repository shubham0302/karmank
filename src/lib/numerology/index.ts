// src/lib/numerology/index.ts

// --- Core Data ---
export { DATA } from "./data";

// --- Utils ---
export {
  reduceToSingleDigit,
  getText,
  calculateLifePath,
  countDigits,
  analyzeRecurringNumbers,
  evaluateYogas,
  checkForSpecialRemedies,
  parseDobParts,
} from "./utils";
export type { DigitCounts, Language } from "./utils";

// --- Advanced Helpers ---
export {
  basicNumber,
  destinyNumber,
  personalYear,
  personalMonth,
  personalDay,
  forecast12Months,
  dashaOverview,
  assetVibration,
  remediesPack,
  traitSummary,
} from "./advanced";

// --- Calculators ---
export { calculateNumerology } from "./calculateNumerology";
export { dashaCalculator } from "./dashaCalculator";

// --- Types + Safe Generators ---
export type { Report, DashaReport, DashaSpan, Yoga, SpecialInsight, RecurringItem } from "./types";
export { ensureReportShape, ensureDashaReportShape, generateReport } from "./shape";
