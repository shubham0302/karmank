// src/lib/numerology/advanced.ts
import {
  reduceToSingleDigit,
  calculateLifePath,
  countDigits,
  analyzeRecurringNumbers,
  evaluateYogas,
  checkForSpecialRemedies,
  getText,
  parseDobParts,
  type DigitCounts,
  type Language,
} from "@/lib/numerology/utils";
import { DATA } from "@/lib/numerology/data";

// ---------- Core Numbers ----------
export function basicNumber(dob: string): number {
  const p = parseDobParts(dob);
  return p ? reduceToSingleDigit(p.day) : 0;
}

export function destinyNumber(dob: string): number {
  const lp = calculateLifePath(dob);
  return reduceToSingleDigit(lp);
}

// ---------- Personal Cycles (PY/PM/PD) ----------
export function personalYear(dob: string, onDate: Date = new Date()): number {
  const p = parseDobParts(dob);
  if (!p) return 0;
  return reduceToSingleDigit(p.day + p.month + onDate.getFullYear());
}

export function personalMonth(dob: string, onDate: Date = new Date()): number {
  const py = personalYear(dob, onDate);
  const month = onDate.getMonth() + 1;
  return reduceToSingleDigit(py + month);
}

export function personalDay(dob: string, onDate: Date = new Date()): number {
  const pm = personalMonth(dob, onDate);
  return reduceToSingleDigit(pm + onDate.getDate());
}

// ---------- Dasha Overview (simple & data-driven) ----------
// Treat Personal Year as MahaDasha & Personal Month as AntarDasha,
// then blend with Destiny using DATA.combinedDashaInsights if present.
export function dashaOverview(
  dob: string,
  lang: Language,
  onDate: Date = new Date()
): {
  basic: number;
  destiny: number;
  mahaDasha: number;
  antarDasha: number;
  personalDay: number;
  personalMonth: number;
  personalYear: number;
  notes: { maha: string; antar: string };
  colors: Record<string, string>;
} {
  const basic = basicNumber(dob);
  const destiny = destinyNumber(dob);
  const maha = personalYear(dob, onDate);
  const antar = personalMonth(dob, onDate);

  const mk = `${maha}-${destiny}`;
  const ak = `${antar}-${destiny}`;

  const dashaTextMaha =
    (DATA as any)?.combinedDashaInsights?.[mk]
      ? getText((DATA as any).combinedDashaInsights[mk], lang)
      : "";

  const dashaTextAntar =
    (DATA as any)?.combinedDashaInsights?.[ak]
      ? getText((DATA as any).combinedDashaInsights[ak], lang)
      : "";

  return {
    basic,
    destiny,
    mahaDasha: maha,
    antarDasha: antar,
    personalDay: personalDay(dob, onDate),
    personalMonth: antar,
    personalYear: maha,
    notes: {
      maha: dashaTextMaha || "",
      antar: dashaTextAntar || "",
    },
    colors: (DATA as any)?.colorMap || {},
  };
}

// ---------- 12-Month Forecast ----------
export function forecast12Months(
  dob: string,
  lang: Language,
  start: Date = new Date()
): {
  items: Array<{ ym: string; monthNumber: number; essence?: string }>;
  color: string;
} {
  const items: Array<{
    ym: string;
    monthNumber: number;
    essence?: string;
  }> = [];

  for (let i = 0; i < 12; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 15);
    const pm = personalMonth(dob, d);
    const detail = (DATA as any)?.numberDetails?.[pm];
    items.push({
      ym: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      monthNumber: pm,
      essence: detail ? getText(detail.essence || detail.summary || { en: "" }, lang) : undefined,
    });
  }

  return {
    items,
    color: (DATA as any)?.colorMap?.monthly || "#047857",
  };
}

// ---------- Asset Vibration (house/vehicle/account → number) ----------
export function assetVibration(
  value: string,
  lang: Language,
  compareTo?: number
): {
  number: number;
  essence: string;
  compatibilityHint: string;
  color: string;
} {
  const digits = (value || "").replace(/\D/g, "");
  if (!digits) {
    return {
      number: 0,
      essence: "",
      compatibilityHint: "",
      color: (DATA as any)?.colorMap?.dob || "#1d4ed8",
    };
  }

  const num = reduceToSingleDigit(parseInt(digits, 10));
  const compatKey = compareTo ? `${num}-${compareTo}` : null;
  const compatText =
    compatKey && (DATA as any)?.combinedDashaInsights?.[compatKey]
      ? getText((DATA as any).combinedDashaInsights[compatKey], lang)
      : "";

  const detail = (DATA as any)?.numberDetails?.[num];
  const essence = detail ? getText(detail.essence || detail.summary || { en: "" }, lang) : "";

  return {
    number: num,
    essence,
    compatibilityHint: compatText,
    color: (DATA as any)?.colorMap?.dob || "#1d4ed8",
  };
}

// ---------- Remedies & Traits ----------
export function remediesPack(
  dob: string,
  lang: Language,
  onDate: Date = new Date()
): {
  recurrences: Array<{ number: number; occurrences: number; influence: string }>;
  special: Array<{ title: string; text: string }>;
  yogas: Array<{ name: string; description?: string; traits?: string[] }>;
} {
  const dNum = destinyNumber(dob);
  const counts: DigitCounts = countDigits(dob);
  const recurrences = analyzeRecurringNumbers(counts, dNum);

  const maha = personalYear(dob, onDate);
  const antar = personalMonth(dob, onDate);
  const special = checkForSpecialRemedies(counts, dNum, maha, antar);

  return {
    recurrences,                 // number, occurrences, influence
    special,                     // simple remedies from DATA
    yogas: evaluateYogas(counts) // active yogas (fallback rules or DATA)
  };
}

export function traitSummary(
  n: number,
  lang: Language
): { essence: string; traits: string[] } {
  const detail = (DATA as any)?.numberDetails?.[n];
  if (!detail) return { essence: "", traits: [] };
  const essence = getText(detail.essence || detail.summary || { en: "" }, lang);
  const traits = Array.isArray(detail.traits)
    ? detail.traits.map((t: any) => getText(t, lang))
    : [];
  return { essence, traits };
}
