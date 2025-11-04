// src/lib/numerology/utils.ts
import { DATA } from "./data";

/** Supported UI languages for text blobs held in DATA */
export type Language = "en" | "hi" | "en-hi";

/** Simple map of digit -> count (1..9 only) */
export type DigitCounts = Record<number, number>;

/** ------------------------------------------------------------------
 * Robust translator: returns a plain string for anything you pass in.
 * Accepts string/number/array or a multi-lang object { en, hi, "en-hi" }.
 * This guarantees React never receives a raw object as a child.
 * ------------------------------------------------------------------ */
export function getText(value: unknown, lang: Language = "en"): string {
  if (value == null) return "";

  // Already renderable primitives
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  // Arrays: translate each item and join
  if (Array.isArray(value)) {
    return value.map((v) => getText(v, lang)).filter(Boolean).join(", ");
  }

  // Multilang object case
  if (typeof value === "object") {
    const v = value as Partial<Record<Language, unknown>> & Record<string, unknown>;
    const pick =
      (v[lang] as string | number | undefined) ??
      (v.en as string | number | undefined) ??
      (v["en-hi"] as string | number | undefined) ??
      (v.hi as string | number | undefined);
    if (pick != null) return String(pick);
  }

  // Last-resort stringify
  try {
    return String(value);
  } catch {
    return "";
  }
}

/** Reduce any positive integer to a single digit (1..9). 0 stays 0. */
export const reduceToSingleDigit = (n: number): number => {
  if (!Number.isFinite(n)) return 0;
  n = Math.abs(Math.floor(n));
  if (n === 0) return 0;
  while (n > 9) {
    n = n
      .toString()
      .split("")
      .reduce((a, d) => a + parseInt(d, 10), 0);
  }
  return n;
};

/** Parse a human-entered DOB like DD/MM/YYYY, D-M-YY, etc. Returns null if invalid. */
export function parseDobParts(dob: string): { day: number; month: number; year: number } | null {
  const m = dob?.match?.(/^\s*(\d{1,2})\D+(\d{1,2})\D+(\d{2,4})\s*$/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const yr = m[3];
  const year = yr.length === 2 ? parseInt(`20${yr}`, 10) : parseInt(yr, 10);
  if (!day || !month || !year) return null;
  return { day, month, year };
}

/** Life Path (a.k.a. Destiny) from DOB by summing day+month+year then reducing to single digit. */
export function calculateLifePath(dob: string): number {
  const p = parseDobParts(dob);
  if (!p) return 0;
  const sum = p.day + p.month + p.year;
  return reduceToSingleDigit(sum);
}

/** Count occurrences of digits 1..9 in a DOB (day, month, year altogether). */
export function countDigits(dob: string): DigitCounts {
  const counts: DigitCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  const digits = (dob ?? "").replace(/\D/g, "");
  for (const ch of digits) {
    const n = parseInt(ch, 10);
    if (n >= 1 && n <= 9) counts[n] = (counts[n] ?? 0) + 1;
  }
  return counts;
}

/** Recurring numbers analysis (fallbacks if DATA text missing) */
export function analyzeRecurringNumbers(
  counts: DigitCounts,
  destinyNumber?: number
): Array<{ number: number; occurrences: number; influence: string }> {
  const out: Array<{ number: number; occurrences: number; influence: string }> = [];
  for (let n = 1; n <= 9; n++) {
    const occ = counts[n] ?? 0;
    if (occ > 1) {
      const fromData =
        (DATA as any)?.recurringNumbersAnalysis?.[n] ??
        (DATA as any)?.numberDetails?.[n]?.recurrence ??
        null;

      const influence =
        (typeof fromData === "string" && fromData) ||
        getText(fromData, "en") ||
        `Number ${n} repeats ${occ} times; this amplifies its traits.`;

      out.push({ number: n, occurrences: occ, influence });
    }
  }

  // If no repeats but we have a destiny number, provide a gentle note
  if (out.length === 0 && destinyNumber && (DATA as any)?.numberDetails?.[destinyNumber]) {
    const d = (DATA as any).numberDetails[destinyNumber];
    const influence =
      getText(d?.essence || d?.summary, "en") ||
      `Destiny number ${destinyNumber} sets the overall tone for this chart.`;
    out.push({ number: destinyNumber, occurrences: 1, influence });
  }

  return out;
}

/** Example yogas (fallback only) */
export function evaluateYogas(counts: DigitCounts): Array<{ name: string; description?: string; traits?: string[] }> {
  const out: Array<{ name: string; description?: string; traits?: string[] }> = [];

  if ((counts[1] ?? 0) >= 3) {
    out.push({
      name: "Surya Yoga",
      description: "Strong 1 presence indicates leadership, initiative and visibility.",
      traits: ["Leadership", "Initiative", "Confidence"],
    });
  }

  if ((counts[2] ?? 0) >= 3) {
    out.push({
      name: "Chandra Yoga",
      description: "Heightened sensitivity and intuition; balance emotions with reason.",
      traits: ["Sensitivity", "Intuition", "Empathy"],
    });
  }

  return out;
}

/** Remedies sampling (fallback + DATA-backed when available) */
export function checkForSpecialRemedies(
  counts: DigitCounts,
  destinyNumber: number,
  personalYear: number,
  personalMonth: number
): Array<{ title: string; text: string }> {
  const result: Array<{ title: string; text: string }> = [];

  const base = (DATA as any)?.remedies?.[destinyNumber];
  if (Array.isArray(base)) {
    for (const r of base) {
      const title = typeof r?.title === "string" ? r.title : getText(r?.title, "en");
      const text = typeof r?.text === "string" ? r.text : getText(r?.text, "en");
      if (title || text) result.push({ title: title || "Remedy", text: text || "" });
    }
  }

  // Example dynamic rule
  if ((counts[8] ?? 0) >= 2 && personalYear === 8) {
    result.push({
      title: "Saturn Alignment",
      text:
        "Avoid over-commitment; ground your routines and practice patience. " +
        "Donate food or help elders on Saturdays.",
    });
  }

  return result;
}

/* ---- Masters Disabled Stub ---- */
export type MasterFlags = { is11: boolean; is22: boolean; is33: boolean };
export function getMasterNumbers(_dob?: string): MasterFlags {
  return { is11: false, is22: false, is33: false };
}
