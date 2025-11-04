// src/lib/numerology/recurring.ts
type LangMap = { [k: string]: string };
type InfluenceText = string | LangMap;

type RecurrenceRule = {
  require?: number[];                 // must be present (count >= 1)
  avoid?: number[];                   // must be absent (count == 0)
  minCounts?: Record<number, number>; // per-number minimums
  maxCounts?: Record<number, number>; // per-number maximums
  basic?: number | number[];          // Basic gate
  destiny?: number | number[];        // Destiny gate
  text?: InfluenceText;               // multilingual text
};

export type RecurringTable = {
  [num: number]: {
    // keys like "2", "2-3", "3+", or "default"
    [countKey: string]: InfluenceText | RecurrenceRule;
  };
};

const asArray = (x: any) => (Array.isArray(x) ? x : x !== undefined ? [x] : []);
const matchesCombo = (req: number | number[] | undefined, actual: number) =>
  req === undefined ? true : asArray(req).map(Number).includes(actual);

const passesCounts = (
  counts: Record<number, number>,
  minC?: Record<number, number>,
  maxC?: Record<number, number>
) => {
  if (minC) for (const k of Object.keys(minC)) {
    const n = +k, need = +minC[k];
    if ((counts[n] ?? 0) < need) return false;
  }
  if (maxC) for (const k of Object.keys(maxC)) {
    const n = +k, cap = +maxC[k];
    if (!Number.isNaN(cap) && (counts[n] ?? 0) > cap) return false;
  }
  return true;
};

const allPresent = (counts: Record<number, number>, req?: number[]) =>
  !req || req.every(n => (counts[n] ?? 0) > 0);
const allAbsent = (counts: Record<number, number>, ban?: number[]) =>
  !ban || ban.every(n => (counts[n] ?? 0) === 0);

const pickKeyByCount = (bucket: Record<string, any>, occ: number): string | null => {
  if (bucket[occ] !== undefined) return String(occ); // exact

  // ranges "a-b"
  for (const k of Object.keys(bucket)) {
    const m = /^(\d+)\-(\d+)$/.exec(k);
    if (m) {
      const a = +m[1], b = +m[2];
      if (occ >= a && occ <= b) return k;
    }
  }
  // thresholds "n+" → pick highest matching
  let best: { k: string; n: number } | null = null;
  for (const k of Object.keys(bucket)) {
    const m = /^(\d+)\+$/.exec(k);
    if (m) {
      const n = +m[1];
      if (occ >= n && (!best || n > best.n)) best = { k, n };
    }
  }
  return best ? best.k : (bucket.default !== undefined ? "default" : null);
};

export function buildRecurringAnalysis({
  kundliCounts,              // 1..9 counts from Kundli
  language,                  // "en" | "hi" | "en-hi"
  dataRecurring,             // DATA.recurringNumberInfluence
  getText,                   // your i18n helper
  basicNumber,               // numeric basic
  destinyNumber,             // numeric destiny
  minRepeat = 2,             // recurring threshold
}: {
  kundliCounts: Record<number, number>;
  language: string;
  dataRecurring: RecurringTable;
  getText: (x: InfluenceText, lang: string) => string;
  basicNumber: number;
  destinyNumber: number;
  minRepeat?: number;
}) {
  const out: { number: number; occurrences: number; influence: string }[] = [];

  for (let num = 1; num <= 9; num++) {
    const occ = kundliCounts[num] || 0;
    if (occ < minRepeat) continue;

    const bucket = (dataRecurring as any)?.[num] || {};
    const k = pickKeyByCount(bucket, occ);
    if (!k) continue;

    const entry = bucket[k];

    // If entry is raw text
    if (typeof entry === "string" || (entry && typeof entry === "object" && !("text" in entry))) {
      const influence = typeof entry === "string" ? entry : getText(entry as any, language as any);
      if (influence) out.push({ number: num, occurrences: occ, influence });
      continue;
    }

    // Else it's a rule object
    const rule = entry as RecurrenceRule;
    if (!allPresent(kundliCounts, rule.require)) continue;
    if (!allAbsent(kundliCounts, rule.avoid)) continue;
    if (!passesCounts(kundliCounts, rule.minCounts, rule.maxCounts)) continue;
    if (!matchesCombo(rule.basic, basicNumber)) continue;
    if (!matchesCombo(rule.destiny, destinyNumber)) continue;

    const influence =
      rule.text
        ? (typeof rule.text === "string" ? rule.text : getText(rule.text as any, language as any))
        : getText({ en: `When ${num} repeats ${occ} times, its influence intensifies.` } as any, language as any);

    out.push({ number: num, occurrences: occ, influence });
  }

  return out.sort((a, b) => (b.occurrences - a.occurrences) || (a.number - b.number));
}
