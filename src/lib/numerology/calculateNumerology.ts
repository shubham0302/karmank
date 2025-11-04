// src/lib/numerology/calculateNumerology.ts
import { DATA } from "./data";
import {
  basicNumber,
  destinyNumber,
  personalYear,
  personalMonth,
} from "./advanced";
import {
  countDigits,
  analyzeRecurringNumbers,
  evaluateYogas,
  checkForSpecialRemedies,
} from "./utils";

export type NumerologyReport = {
  dob: string;
  basicNumber: number;
  destinyNumber: number;
  // simple frequency grid (digit -> count) for display/logic
  baseKundliGrid: Array<{ digit: number; count: number }>;
  recurringNumbersAnalysis: Array<{ number: number; occurrences: number; influence: string }>;
  yogas: Array<{ name: string; description?: string; traits?: string[] }>;
  specialInsights: Array<{ title: string; text: string }>;
};

export function calculateNumerology(dob: string, data = DATA): NumerologyReport {
  const basic = basicNumber(dob);
  const destiny = destinyNumber(dob);

  const counts = countDigits(dob);
  const recurring = analyzeRecurringNumbers(counts, destiny);
  const yogas = evaluateYogas(counts);

  const py = personalYear(dob);
  const pm = personalMonth(dob);
  const specials = checkForSpecialRemedies(counts, destiny, py, pm);

  const baseKundliGrid = Array.from({ length: 9 }, (_, i) => {
    const digit = i + 1;
    return { digit, count: counts[digit] ?? 0 };
  });

  return {
    dob,
    basicNumber: basic,
    destinyNumber: destiny,
    baseKundliGrid,
    recurringNumbersAnalysis: recurring,
    yogas,
    specialInsights: specials,
  };
}
