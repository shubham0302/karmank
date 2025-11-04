// src/lib/numerology/compute.ts
import { calculateLifePath, getMasterNumbers, getText } from "./utils";
import type { Language } from "./utils";
import { combinationInsights } from "./data";

export type { Language };

export interface CoreNumbers {
  lifePath: number;
  nameNumber?: number;
  master?: 11 | 22 | 33;
}

export interface CompatibilityResult {
  summary: string;
  strengths: string[];
  frictions: string[];
  remedies: string[];
  meta?: {
    combinationKey: string;
    auspiciousDays: string[];
    favorableColors: string[];
  };
}

export interface KundliGridResult {
  matrix: number[][];
  counts: Record<number, number>;
  planes: {
    physical: { numbers: number[]; status: "strong" | "balanced" | "weak" | "missing" };
    mental:   { numbers: number[]; status: "strong" | "balanced" | "weak" | "missing" };
    emotional:{ numbers: number[]; status: "strong" | "balanced" | "weak" | "missing" };
  };
  summary: string;
  masterNumbers: { is11: boolean; is22: boolean; is33: boolean };
}

function reduceTo1to9(n: number): number {
  let x = Math.abs(n | 0);
  while (x > 9) x = String(x).split("").reduce((a, d) => a + (d.charCodeAt(0) - 48), 0);
  return x;
}

export function computeCoreNumbers(params: {
  dob: string;
  name?: string;
  system?: "chaldean" | "pythagorean";
}): CoreNumbers {
  const lifePath = calculateLifePath(params.dob);
  const master: 11 | 22 | 33 | undefined = undefined;
  return { lifePath, master };
}

export function compatibility(
  personA: { dob: string; name?: string },
  personB: { dob: string; name?: string },
  lang: Language = "en"
): CompatibilityResult {
  const a = computeCoreNumbers(personA);
  const b = computeCoreNumbers(personB);

  const combinationKey = `${a.lifePath}-${b.lifePath}`;
  const reverseKey = `${b.lifePath}-${a.lifePath}`;

  const insights: any =
    (combinationInsights as any)[combinationKey] ??
    (combinationInsights as any)[reverseKey] ??
    null;

  const summary =
    (insights && getText(insights.summary, lang)) ||
    (lang === "hi"
      ? `संख्या ${a.lifePath} और ${b.lifePath} का मेल एक संतुलित संबंध बनाने के लिए जागरूकता माँगता है।`
      : lang === "en-hi"
      ? `Numbers ${a.lifePath} aur ${b.lifePath} ka combo balanced relationship ke liye awareness maangta hai.`
      : `Numbers ${a.lifePath} and ${b.lifePath} require awareness to create a balanced relationship.`);

  const toTextArr = (x: any) => (Array.isArray(x) ? x.map((t) => getText(t, lang)) : []);

  return {
    summary,
    strengths: toTextArr(insights?.strengths),
    frictions: toTextArr(insights?.frictions),
    remedies: toTextArr(insights?.remedies),
    meta: {
      combinationKey,
      auspiciousDays: ["Sunday", "Wednesday"],
      favorableColors: ["Gold", "Orange", "Blue"],
    },
  };
}

export function computeKundliGrid(dob: string, lang: Language = "en"): KundliGridResult {
  const VEDIC_MATRIX: number[][] = [
    [3, 1, 9],
    [6, 7, 5],
    [2, 8, 4],
  ];

  const counts = buildKundliCounts(dob);
  const masterNumbers = getMasterNumbers(dob); // all-false (masters disabled)

  const evaluatePlane = (numbers: number[]) => {
    const present = numbers.filter((n) => (counts[n] ?? 0) > 0).length;
    if (present === 3) return "strong";
    if (present === 2) return "balanced";
    if (present === 1) return "weak";
    return "missing";
  };

  const planes = {
    physical:  { numbers: [1, 4, 7], status: evaluatePlane([1, 4, 7]) as any },
    mental:    { numbers: [3, 6, 9], status: evaluatePlane([3, 6, 9]) as any },
    emotional: { numbers: [2, 5, 8], status: evaluatePlane([2, 5, 8]) as any },
  };

  const dominant = Object.entries(counts)
    .filter(([, c]) => (c as number) >= 2)
    .map(([n]) => parseInt(n, 10));

  let summary =
    lang === "hi"
      ? "आपका वैदिक कुंडली ग्रिड आपके जन्मतिथि की ऊर्जा को दर्शाता है।"
      : lang === "en-hi"
      ? "Aapka Vedic Kundli grid aapke DOB ki energy ko reflect karta hai."
      : "Your Vedic Kundli grid reflects the cosmic energies present in your birth date.";

  if (dominant.length > 0) {
    const list = dominant.join(", ");
    summary +=
      lang === "hi"
        ? ` संख्या ${list} में प्रबल ऊर्जा दिखती है।`
        : lang === "en-hi"
        ? ` Numbers ${list} mein strong energy dikhti hai.`
        : ` Strong presence of numbers ${list} indicates focused energy.`;
  }

  return {
    matrix: VEDIC_MATRIX,
    counts,
    planes,
    summary,
    masterNumbers,
  };
}

function buildKundliCounts(dob: string): Record<number, number> {
  const m = dob.match(/^\s*(\d{1,2})\D+(\d{1,2})\D+(\d{2,4})\s*$/);
  let day = 0, month = 0, year = 0;

  if (m) {
    day = parseInt(m[1], 10);
    month = parseInt(m[2], 10);
    year = parseInt(m[3], 10);
  } else {
    const digits = dob.replace(/\D/g, "");
    day = parseInt(digits.slice(0, 2) || "0", 10);
    month = parseInt(digits.slice(2, 4) || "0", 10);
    year = parseInt(digits.slice(4) || "0", 10);
  }

  const yy = String(year).slice(-2);
  const seq = (String(day).padStart(2, "0") + String(month).padStart(2, "0") + yy).replace(/0/g, "");

  const counts: Record<number, number> = { 1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0 };
  for (const ch of seq) {
    const n = ch.charCodeAt(0) - 48;
    if (n >= 1 && n <= 9) counts[n] += 1;
  }

  let destiny = calculateLifePath(`${String(day).padStart(2,"0")}/${String(month).padStart(2,"0")}/${String(year)}`);
  if (destiny > 9) destiny = reduceTo1to9(destiny);
  if (destiny >= 1 && destiny <= 9) counts[destiny] += 1;

  if (day > 9 && day % 10 !== 0) {
    const basic = reduceTo1to9(day);
    if (basic >= 1 && basic <= 9) counts[basic] += 1;
  }

  return counts;
}
