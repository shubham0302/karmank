// src/pages/app/tabs/AdvancedDashaTab.tsx
import React, { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { DATA } from "@/lib/numerology";
import { getText } from "@/lib/numerology/utils";

/* ---------------------------- PURE HELPERS ---------------------------- */
type DOBParts = { dd: string; mm: string; yyyy: string };
function parseDOB(dob: string | undefined | null): DOBParts | null {
  if (!dob) return null;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) { const [dd, mm, yyyy] = dob.split("/"); return { dd, mm, yyyy }; }
  if (/^\d{2}-\d{2}-\d{4}$/.test(dob)) { const [dd, mm, yyyy] = dob.split("-"); return { dd, mm, yyyy }; }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) { const [yyyy, mm, dd] = dob.split("-"); return { dd, mm, yyyy }; }
  return null;
}
function reduceToSingleDigit(n: number): number { let x = Math.abs(n) || 0; while (x > 9) x = String(x).split("").reduce((a, d) => a + Number(d), 0); return x; }
function weekdayNumber(d: Date): number { const map = [1,2,9,5,3,6,8]; return map[d.getDay()] }
function fmt(date: Date): string { return date.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}); }
function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d: Date) { const x = new Date(d); x.setHours(23,59,59,999); return x; }
function addDays(d: Date, days: number) { const x = new Date(d); x.setDate(x.getDate()+days); return x; }
function addYears(d: Date, years: number) { const x = new Date(d); x.setFullYear(x.getFullYear()+years); return x; }
function nextNumber(n: number) { return n === 9 ? 1 : n + 1; }
const t = (v: any): string => (typeof v === "string" ? v : v?.en ?? v?.["en-hi"] ?? v?.hi ?? v?.name ?? "");

/* ---------------------------- KUNDLI COUNTS --------------------------- */
function kundliCountsFromDOB(dob: string): number[] {
  const p = parseDOB(dob); const out = Array(10).fill(0); if (!p) return out;
  const yy2 = p.yyyy.slice(-2);
  const raw = (p.dd + p.mm + yy2).replace(/0/g, "");
  for (const ch of raw) { const n = Number(ch); if (n >= 1 && n <= 9) out[n] += 1; }
  return out;
}
function basicDestinyFromDOB(dob: string) {
  const p = parseDOB(dob); if (!p) return { basic: 0, destiny: 0 };
  const basic = reduceToSingleDigit(Number(p.dd));
  const destiny = reduceToSingleDigit((p.dd + p.mm + p.yyyy).split("").reduce((a, x) => a + Number(x), 0));
  return { basic, destiny };
}

/* -------------------------- DASHA CALCULATIONS ------------------------ */
type Span = { dashaNumber: number; startDate: Date; endDate: Date; year?: number };
const PRATYANTAR_DURATIONS: Record<number, number> = {1:8,2:16,3:24,4:32,5:41,6:49,7:57,8:64,9:74};

function buildMahaTimeline(dob: string, horizonYears=120): Span[] {
  const p = parseDOB(dob); if (!p) return [];
  const birth = startOfDay(new Date(Number(p.yyyy), Number(p.mm)-1, Number(p.dd)));
  const { basic } = basicDestinyFromDOB(dob);
  const out: Span[] = []; let num = basic; let cursor = birth; const endH = addYears(birth, horizonYears);
  while (cursor < endH) { const start = cursor; const end = endOfDay(addDays(addYears(start, num), -1));
    out.push({ dashaNumber: num, startDate: start, endDate: end }); cursor = addYears(start, num); num = nextNumber(num); }
  return out;
}
function buildYearlyTimeline(dob: string, fromYear: number, toYear: number): Span[] {
  const p = parseDOB(dob); if (!p) return [];
  const B = reduceToSingleDigit(Number(p.dd)); const M = Number(p.mm);
  const out: Span[] = [];
  for (let y = fromYear; y <= toYear; y++) {
    const start = startOfDay(new Date(y, M-1, Number(p.dd)));
    const end = endOfDay(addDays(new Date(y+1, M-1, Number(p.dd)), -1));
    const Y = Number(String(y).slice(-2));
    const D = weekdayNumber(start);
    const dasha = reduceToSingleDigit(B + M + Y + D);
    out.push({ dashaNumber: dasha, startDate: start, endDate: end, year: y });
  }
  return out;
}
function buildMonthlyTimelineForYear(dob: string, year: number): Span[] {
  const p = parseDOB(dob); if (!p) return [];
  const yearStart = startOfDay(new Date(year, Number(p.mm)-1, Number(p.dd)));
  const yearEnd   = endOfDay(addDays(new Date(year+1, Number(p.mm)-1, Number(p.dd)), -1));
  const startNum  = buildYearlyTimeline(dob, year, year)[0]?.dashaNumber ?? 1;
  const out: Span[] = []; let num = startNum, cursor = yearStart;
  while (cursor <= yearEnd) { const dur = PRATYANTAR_DURATIONS[num] ?? 8;
    const start = cursor; let end = endOfDay(addDays(start, dur-1)); if (end > yearEnd) end = yearEnd;
    out.push({ dashaNumber: num, startDate: start, endDate: end }); cursor = addDays(end, 1); num = nextNumber(num); }
  return out;
}
function buildDailyTimelineForYear(dob: string, year: number) {
  const p = parseDOB(dob); if (!p) return [];
  const monthly = buildMonthlyTimelineForYear(dob, year);
  const start = startOfDay(new Date(year, Number(p.mm)-1, Number(p.dd)));
  const end   = endOfDay(addDays(new Date(year+1, Number(p.mm)-1, Number(p.dd)), -1));
  const out: { date: Date; dashaNumber: number }[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) {
    const md = monthly.find(s => d >= s.startDate && d <= s.endDate)?.dashaNumber ?? 1;
    const D = weekdayNumber(d);
    out.push({ date: d, dashaNumber: reduceToSingleDigit(md + D) });
  }
  return out;
}

/* --------------------------- YOGA EVALUATION -------------------------- */
type YogaRuleLegacy = { allOf?: number[]; anyOf?: number[]; noneOf?: number[]; minCount?: Record<number, number>; };
type YogaRuleStrict = { requires_presence?: number[]; requires_absence?: number[]; requires_counts?: Record<number, number>; };
type YogaRules = YogaRuleLegacy & YogaRuleStrict;
type Yoga = {
  id?: string | number;
  name?: any; description?: any; traits?: any[];
  activation_rules?: YogaRules; numbers?: number[]; empty?: number[]; category?: string;
};
function normalizeRules(rules?: YogaRules): Required<YogaRuleLegacy> {
  const allOf = rules?.allOf ?? rules?.requires_presence ?? [];
  const noneOf = rules?.noneOf ?? rules?.requires_absence ?? [];
  const minCount = rules?.minCount ?? rules?.requires_counts ?? {};
  const anyOf = rules?.anyOf ?? [];
  return { allOf, anyOf, noneOf, minCount };
}
function checkYoga(rules: YogaRules | undefined, grid: number[]): boolean {
  if (!rules) return false;
  const { allOf, anyOf, noneOf, minCount } = normalizeRules(rules);
  for (const n of allOf) if ((grid[n] ?? 0) <= 0) return false;
  if (anyOf.length) { let ok = false; for (const n of anyOf) if ((grid[n] ?? 0) > 0) { ok = true; break; } if (!ok) return false; }
  for (const n of noneOf) if ((grid[n] ?? 0) > 0) return false;
  for (const k of Object.keys(minCount)) { const n = Number(k); if ((grid[n] ?? 0) < Number(minCount[k])) return false; }
  return true;
}
function yogaMatches(y: Yoga, grid: number[]): boolean {
  if (y.activation_rules) return checkYoga(y.activation_rules, grid);
  if (Array.isArray(y.numbers) && y.numbers.length) {
    let ok = y.numbers.every((n) => (grid[n] ?? 0) > 0);
    if (ok && Array.isArray(y.empty) && y.empty.length) if (y.empty.some((n) => (grid[n] ?? 0) > 0)) ok = false;
    return ok;
  }
  return false;
}

/* ------------------------------ UI PARTS ------------------------------ */
const SectionTitle: React.FC<React.PropsWithChildren> = ({ children }) => (
  <h3 className="text-lg md:text-xl font-bold text-yellow-400 mb-3">{children}</h3>
);
const KundliGrid: React.FC<{
  baseCounts: number[]; basic: number; destiny: number;
  active?: Partial<Record<"maha" | "yearly" | "monthly" | "daily", number>>;
}> = ({ baseCounts, basic, destiny, active = {} }) => {
  const layout = [3,1,9,6,7,5,2,8,4];
  const color = { daily:"#a78bfa", monthly:"#34d399", yearly:"#60a5fa", maha:"#f59e0b", destiny:"#ef4444", basic:"#fde047", dob:"#4f46e5", empty:"#4b5563" };
  const countsWithBD = useMemo(() => {
    const c = [...baseCounts]; if (basic>=1&&basic<=9) c[basic]=(c[basic]??0)+1; if (destiny>=1&&destiny<=9) c[destiny]=(c[destiny]??0)+1; return c;
  }, [baseCounts, basic, destiny]);
  const painted = useMemo(() => {
    const c = [...countsWithBD]; Object.values(active).forEach((n)=>{ if(n&&n>=1&&n<=9) c[n]=(c[n]??0)+1; }); return c;
  }, [countsWithBD, active]);
  const bgFor = (n: number) => {
    const colors: string[] = [];
    if (active.daily===n) colors.push(color.daily); if (active.monthly===n) colors.push(color.monthly);
    if (active.yearly===n) colors.push(color.yearly); if (active.maha===n) colors.push(color.maha);
    if (destiny===n) colors.push(color.destiny); if (basic===n) colors.push(color.basic);
    if (!colors.length) return (countsWithBD[n] ?? 0) > 0 ? color.dob : color.empty;
    return colors.length===1 ? colors[0] : `linear-gradient(45deg, ${colors.join(", ")})`;
  };
  const Badge = ({ text, cls }: { text: string; cls: string }) => <span className={`text-[9px] px-1 rounded border ${cls}`}>{text}</span>;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto bg-gray-900/50 p-2 rounded-md aspect-square">
        {layout.map((n, i) => {
          const cnt = painted[n] ?? 0; const isBasic = basic===n; const isDestiny = destiny===n;
          const showBadges = isBasic || isDestiny || active.daily===n || active.monthly===n || active.yearly===n || active.maha===n;
          return (
            <div key={i} style={{ background: bgFor(n) }} className="relative flex items-center justify-center text-2xl font-bold rounded-md aspect-square text-white" title={`#${n}`}>
              {cnt > 0 ? String(n).repeat(cnt) : ""}
              {showBadges && (
                <div className="absolute top-1 right-1 flex gap-1">
                  {isBasic && <Badge text="Basic" cls="bg-yellow-500/30 text-yellow-100 border-yellow-400/40" />}
                  {isDestiny && <Badge text="Destiny" cls="bg-amber-600/30 text-amber-100 border-amber-400/40" />}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-center text-xs text-gray-300">
        <strong className="text-yellow-400">Basic Number:</strong> {basic} • <strong className="text-amber-400">Destiny Number:</strong> {destiny}
      </p>
    </div>
  );
};

/* ------------------------------ CATALOG ------------------------------ */
function normalizeYogaCatalog(src: any): Yoga[] {
  if (!src) return [];
  if (Array.isArray(src)) return src as Yoga[];
  if (typeof src === "object") return Object.keys(src).map((key) => ({ id: key, ...(src as any)[key] })) as Yoga[];
  return [];
}

/* ================= Recurring-number evaluation (Foundational parity) ============= */
type RecurringEval = { number: number; occurrences: number; influence: string };
function evaluateRecurring(counts: number[], destiny: number, language: string): RecurringEval[] {
  const rules = (DATA as any)?.recurringNumberInfluence || {};
  const out: RecurringEval[] = [];
  for (let num = 1; num <= 9; num++) {
    const count = counts[num] ?? 0;
    if (count <= 1) continue; // recurring := 2+
    const rule = rules[num] || rules[String(num)];
    if (!rule) continue;

    const bits: string[] = [];
    if (rule.base) bits.push(getText(rule.base, language as any));
    if (count >= 3 && rule.threeOrMore) bits.push(getText(rule.threeOrMore, language as any));
    if (num === destiny && rule.withDestiny) bits.push(getText(rule.withDestiny, language as any));
    if (rule.evenCount && count % 2 === 0) bits.push(getText(rule.evenCount, language as any));
    if (rule.oddCount  && count % 2 !== 0) bits.push(getText(rule.oddCount, language as any));

    Object.keys(rule).forEach(k => {
      const plus = /^(\d+)\+$/.exec(k);
      if (plus) { const n = parseInt(plus[1], 10); if (count >= n) bits.push(getText(rule[k], language as any)); }
      const range = /^(\d+)-(\d+)$/.exec(k);
      if (range) { const a = parseInt(range[1], 10), b = parseInt(range[2], 10); if (count >= a && count <= b) bits.push(getText(rule[k], language as any)); }
    });

    const influence = bits.filter(Boolean).join(" ");
    if (influence) out.push({ number: num, occurrences: count, influence });
  }
  return out.sort((a, b) => (b.occurrences - a.occurrences) || (a.number - b.number));
}

/* ------------------------------ PAGE ------------------------------ */
type Props = { dob: string; extraYogas?: Yoga[]; language?: string; };

const AdvancedDashaTab: React.FC<Props & any> = ({ dob, extraYogas = [], language = "en" }) => {
  const [activeSubTab, setActiveSubTab] =
    useState<"maha" | "yearly" | "monthly" | "daily">("maha");

  // ✅ LOCAL date (not UTC slice) to avoid off-by-one issues
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    new Date().toLocaleDateString("en-CA") // YYYY-MM-DD in local time
  );

  // Silent humanised text from /api/rephrase
  const [humanSummary, setHumanSummary] = useState<string>("");

  // Yoga catalog
  const yogaCatalog: Yoga[] = useMemo(() => {
    const fromData = (DATA as any)?.yogaDetails;
    const base = normalizeYogaCatalog(fromData);
    return [...base, ...extraYogas].filter(Boolean);
  }, [extraYogas]);

  // Base numerology + grids
  const baseCounts = useMemo(() => kundliCountsFromDOB(dob), [dob]);
  const { basic, destiny } = useMemo(() => basicDestinyFromDOB(dob), [dob]);

  // Timelines
  const mahaTimeline = useMemo(() => buildMahaTimeline(dob, 120), [dob]);

  // ✅ Derive year in local time
  const selectedYear = useMemo(
    () => startOfDay(new Date(selectedDate)).getFullYear(),
    [selectedDate]
  );

  const yearlyTimeline = useMemo(() => {
    const parts = parseDOB(dob)!; const startY = Number(parts.yyyy);
    return buildYearlyTimeline(dob, startY, startY + 120);
  }, [dob]);
  const monthlyTimeline = useMemo(() => buildMonthlyTimelineForYear(dob, selectedYear), [dob, selectedYear]);
  const dailyTimeline = useMemo(() => buildDailyTimelineForYear(dob, selectedYear), [dob, selectedYear]);

  // Active layers for selected date
  // ✅ Local midnight target
  const target = startOfDay(new Date(selectedDate));
  const currentMaha    = mahaTimeline.find(s => target >= s.startDate && target <= s.endDate);
  const currentYearly  = yearlyTimeline.find(s => target >= s.startDate && target <= s.endDate);
  const currentMonthly = monthlyTimeline.find(s => target >= s.startDate && target <= s.endDate);
  const currentDaily   = dailyTimeline.find(d => d.date.getTime() === target.getTime());

  const activeForGrid = useMemo(() => {
    const a: Partial<Record<"maha" | "yearly" | "monthly" | "daily", number>> = {};
    if (currentMaha) a.maha = currentMaha.dashaNumber;
    if (["yearly","monthly","daily"].includes(activeSubTab) && currentYearly) a.yearly = currentYearly.dashaNumber;
    if (["monthly","daily"].includes(activeSubTab) && currentMonthly) a.monthly = currentMonthly.dashaNumber;
    if (activeSubTab === "daily" && currentDaily) a.daily = currentDaily.dashaNumber;
    return a;
  }, [activeSubTab, currentMaha, currentYearly, currentMonthly, currentDaily]);

  // foundational (base + B + D)
  const foundationalGrid = useMemo(() => {
    const g = [...baseCounts];
    if (basic>=1&&basic<=9) g[basic] = (g[basic]??0)+1;
    if (destiny>=1&&destiny<=9) g[destiny] = (g[destiny]??0)+1;
    return g;
  }, [baseCounts, basic, destiny]);

  // dynamic = foundational + overlays
  const dynamicGrid = useMemo(() => {
    const g = [...foundationalGrid];
    if (currentMaha)    g[currentMaha.dashaNumber]    = (g[currentMaha.dashaNumber]    ?? 0) + 1;
    if (currentYearly)  g[currentYearly.dashaNumber]  = (g[currentYearly.dashaNumber]  ?? 0) + 1;
    if (currentMonthly) g[currentMonthly.dashaNumber] = (g[currentMonthly.dashaNumber] ?? 0) + 1;
    if (currentDaily)   g[currentDaily.dashaNumber]   = (g[currentDaily.dashaNumber]   ?? 0) + 1;
    return g;
  }, [foundationalGrid, currentMaha, currentYearly, currentMonthly, currentDaily]);

  /* --------------------- Dynamic Yogas (overlay-formed only) --------------------- */
  type LayerKey = "maha" | "yearly" | "monthly" | "daily";
  const layerNumbers: Partial<Record<LayerKey, number>> = {
    maha: currentMaha?.dashaNumber, yearly: currentYearly?.dashaNumber,
    monthly: currentMonthly?.dashaNumber, daily: currentDaily?.dashaNumber
  };
  const gridWithoutLayer = (layer: LayerKey): number[] => {
    const g = [...foundationalGrid];
    (Object.keys(layerNumbers) as LayerKey[]).forEach((k) => {
      if (k === layer) return;
      const num = layerNumbers[k];
      if (num && num >= 1 && num <= 9) g[num] = (g[num] ?? 0) + 1;
    });
    return g;
  };

  const dynamicYogas = useMemo(() => {
    const out: Array<Yoga & { formedBy: LayerKey[] }> = [];
    for (const y of yogaCatalog) {
      const matchesDynamic      = yogaMatches(y, dynamicGrid);
      const matchesFoundational = yogaMatches(y, foundationalGrid);
      if (!matchesDynamic || matchesFoundational) continue; // only new (overlay-formed)

      const formedBy: LayerKey[] = [];
      (Object.keys(layerNumbers) as LayerKey[]).forEach((layer) => {
        const num = layerNumbers[layer]; if (!num) return;
        const gridMinus = gridWithoutLayer(layer);
        if (!yogaMatches(y, gridMinus)) formedBy.push(layer);
      });
      out.push({ ...y, formedBy });
    }
    return out;
  }, [yogaCatalog, dynamicGrid, foundationalGrid, layerNumbers]);

  /* -------------------- Recurring numbers (Foundational logic, delta) -------------------- */
  const baseRecurring = useMemo(() => evaluateRecurring(foundationalGrid, destiny, language), [foundationalGrid, destiny, language]);
  const dynRecurring  = useMemo(() => evaluateRecurring(dynamicGrid,      destiny, language), [dynamicGrid, destiny, language]);
  const baseMap = useMemo(() => { const m = new Map<number, RecurringEval>(); baseRecurring.forEach(r => m.set(r.number, r)); return m; }, [baseRecurring]);

  // Only items whose recurrence/influence changed due to overlays (simple cards)
  const simpleRecurring = useMemo(() => {
    const list: RecurringEval[] = [];
    for (const d of dynRecurring) {
      const baseRec = baseMap.get(d.number);
      const changed = !baseRec || d.occurrences > baseRec.occurrences || baseRec.influence !== d.influence;
      if (changed) list.push(d);
    }
    return list.sort((a, b) => a.number - b.number);
  }, [dynRecurring, baseMap]);

  /* ============================= NLG SUMMARY ============================= */
  function joinList(items: string[], conj: "and" | "or" = "and") {
    if (items.length === 0) return "";
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} ${conj} ${items[1]}`;
    return `${items.slice(0, -1).join(", ")}, ${conj} ${items[items.length - 1]}`;
  }
  const nlgSummary = useMemo(() => {
    const parts: string[] = [];
    const layers: string[] = [];
    if (currentMaha) layers.push(`Maha ${currentMaha.dashaNumber}`);
    if (currentYearly) layers.push(`Yearly ${currentYearly.dashaNumber}`);
    if (currentMonthly) layers.push(`Monthly ${currentMonthly.dashaNumber}`);
    if (currentDaily) layers.push(`Daily ${currentDaily.dashaNumber}`);

    parts.push(`For ${fmt(target)}, your active layers are ${layers.length ? joinList(layers) : "none"}.`);

    if (dynamicYogas.length) {
      const top = dynamicYogas.slice(0, 4);
      const items = top.map((y) => {
        const by = (y as any).formedBy as LayerKey[] | undefined;
        return `${t(y.name)}${by?.length ? ` (via ${joinList(by)})` : ""}`;
      });
      parts.push(`Newly formed yogas: ${joinList(items)}.`);
    } else {
      parts.push(`No new yogas arise solely from today’s overlays.`);
    }

    if (simpleRecurring.length) {
      const items = simpleRecurring.slice(0, 3).map(r => `#${r.number} appears ${r.occurrences}× — ${r.influence}`);
      parts.push(`Recurring numbers influenced by dasha: ${items.join(" | ")}`);
    }

    const layerNums = [currentMaha?.dashaNumber, currentYearly?.dashaNumber, currentMonthly?.dashaNumber, currentDaily?.dashaNumber]
      .filter((x): x is number => !!x);
    if (layerNums.length) {
      const freq: Record<number, number> = {};
      layerNums.forEach(n => { freq[n] = (freq[n] ?? 0) + 1; });
      const dominant = Object.entries(freq).sort((a,b) => b[1]-a[1])[0][0];
      parts.push(`Overall tone today leans toward number ${dominant}. Align plans with its qualities where possible.`);
    }

    return parts.join(" ");
  }, [currentMaha, currentYearly, currentMonthly, currentDaily, target, dynamicYogas, simpleRecurring]);

  /* ========================= SILENT GOOGLE REPHRASE ========================= */
  useEffect(() => {
    let ignore = false;
    async function run() {
      if (!nlgSummary) { setHumanSummary(""); return; }
      try {
        const r = await fetch("/api/rephrase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: nlgSummary, locale: language || "en" }),
        });
        const j = await r.json();
        if (!ignore) setHumanSummary(j?.ok && j?.text ? j.text : nlgSummary);
      } catch {
        if (!ignore) setHumanSummary(nlgSummary);
      }
    }
    run();
    return () => { ignore = true; };
  }, [nlgSummary, language]);

  /* ------------------------------- TABLES ------------------------------ */
  const renderTable = () => {
    if (activeSubTab === "daily") {
      return (
        <div className="text-center p-8 bg-gray-900/50 rounded-lg h-full flex flex-col justify-center">
          <p className="text-gray-400">Dasha for {fmt(target)}</p>
          <p className="text-7xl font-bold my-4 text-yellow-400">{currentDaily ? currentDaily.dashaNumber : "—"}</p>
        </div>
      );
    }
    if (activeSubTab === "maha") {
      let start = 0;
      if (currentMaha) { const idx = mahaTimeline.findIndex(s => s.startDate.getTime() === currentMaha.startDate.getTime()); start = Math.max(0, idx - 3); }
      const slice = mahaTimeline.slice(start, start + 12);
      return (
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-yellow-400/30"><th className="p-2 text-yellow-500">Dasha</th><th className="p-2 text-yellow-500">Start</th><th className="p-2 text-yellow-500">End</th></tr>
            </thead>
            <tbody>
              {slice.map((p, i) => {
                const active = currentMaha && p.startDate.getTime() === currentMaha.startDate.getTime();
                return (
                  <tr key={i} className={`border-b border-gray-700 ${active ? "bg-yellow-500/20" : ""}`}>
                    <td className="p-2 font-bold">{p.dashaNumber}</td><td className="p-2">{fmt(p.startDate)}</td><td className="p-2">{fmt(p.endDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    if (activeSubTab === "yearly") {
      const idx = yearlyTimeline.findIndex(s => s.startDate.getFullYear() === selectedYear);
      const start = Math.max(0, (idx === -1 ? 0 : idx - 10));
      const slice = yearlyTimeline.slice(start, start + 21);
      return (
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-yellow-400/30"><th className="p-2 text-yellow-500">Year</th><th className="p-2 text-yellow-500">Dasha</th><th className="p-2 text-yellow-500">Start</th><th className="p-2 text-yellow-500">End</th></tr>
            </thead>
            <tbody>
              {slice.map((p, i) => {
                const active = currentYearly && p.startDate.getTime() === currentYearly.startDate.getTime();
                return (
                  <tr key={i} className={`border-b border-gray-700 ${active ? "bg-yellow-500/20" : ""}`}>
                    <td className="p-2">{p.year}</td><td className="p-2 font-bold">{p.dashaNumber}</td><td className="p-2">{fmt(p.startDate)}</td><td className="p-2">{fmt(p.endDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    // monthly
    const slice = monthlyTimeline;
    return (
      <div className="max-h-96 overflow-y-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-yellow-400/30"><th className="p-2 text-yellow-500">Dasha</th><th className="p-2 text-yellow-500">Start</th><th className="p-2 text-yellow-500">End</th></tr>
          </thead>
          <tbody>
            {slice.map((p, i) => {
              const active = currentMonthly && p.startDate.getTime() === currentMonthly.startDate.getTime();
              return (
                <tr key={i} className={`border-b border-gray-700 ${active ? "bg-yellow-500/20" : ""}`}>
                  <td className="p-2 font-bold">{p.dashaNumber}</td><td className="p-2">{fmt(p.startDate)}</td><td className="p-2">{fmt(p.endDate)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* NLG SUMMARY — show only Google result */}
      {humanSummary && (
      <Card className="p-4 md:p-5">
        <SectionTitle>Your Dynamic Blueprint</SectionTitle>
        <p className="text-sm leading-6 text-gray-200">{humanSummary}</p>
      </Card>)}

      {/* Summary of active layers */}
      <Card className="p-4 md:p-5">
        <SectionTitle>Summary for {fmt(target)}</SectionTitle>
        <div className="text-sm text-gray-300 space-y-1">
          <p>
            <span className="text-yellow-300 font-semibold">Active Dasha (DOB-linked):</span>{" "}
            {[
              currentMaha && `Maha ${currentMaha.dashaNumber}`,
              currentYearly && `Yearly ${currentYearly.dashaNumber}`,
              currentMonthly && `Monthly ${currentMonthly.dashaNumber}`,
              currentDaily && `Daily ${currentDaily.dashaNumber}`,
            ].filter(Boolean).join(" • ") || "None"}
          </p>
        </div>
      </Card>

      {/* Controls + Grid + Timelines */}
      <Card className="p-4 md:p-5">
        <SectionTitle>Advanced Dasha System</SectionTitle>
        <div className="mb-4">
          <label htmlFor="dasha-date" className="block text-sm font-medium text-yellow-500 mb-1">Select Date for Analysis</label>
          <input
            type="date" id="dasha-date" value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-1 block w-full md:w-1/3 bg-gray-700 border-gray-600 rounded-md shadow-sm p-2"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold text-center text-yellow-300 mb-2">Dasha Kundli ({activeSubTab})</h3>
            <KundliGrid baseCounts={baseCounts} basic={basic} destiny={destiny} active={activeForGrid} />
            <div className="mt-4 text-center p-2 bg-gray-900/50 rounded-lg text-xs">
              <p className="text-gray-300">
                Basic: <span className="font-bold text-yellow-400">{basic}</span>{" "}
                | Destiny: <span className="font-bold text-amber-400">{destiny}</span>{" "}
                | Maha: <span className="font-bold text-purple-400">{currentMaha ? currentMaha.dashaNumber : "—"}</span>{" "}
                | Yearly: <span className="font-bold text-indigo-400">{currentYearly ? currentYearly.dashaNumber : "—"}</span>{" "}
                | Monthly: <span className="font-bold text-emerald-400">{currentMonthly ? currentMonthly.dashaNumber : "—"}</span>{" "}
                | Daily: <span className="font-bold text-fuchsia-400">{currentDaily ? currentDaily.dashaNumber : "—"}</span>
              </p>
            </div>
          </div>
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {(["maha", "yearly", "monthly", "daily"] as const).map((k) => (
                <button
                  key={k} onClick={() => setActiveSubTab(k)}
                  className={`py-2 px-4 rounded-md font-semibold transition-colors duration-200 text-sm ${
                    activeSubTab === k ? "bg-yellow-500 text-indigo-900" : "bg-gray-700 hover:bg-gray-600 text-yellow-200/80"
                  }`}
                >
                  {k[0].toUpperCase() + k.slice(1)}
                </button>
              ))}
            </div>
            <div className="mt-4">{renderTable()}</div>
          </div>
        </div>
      </Card>

      {/* Recurring Numbers — Simple cards */}
      <Card className="p-4 md:p-5">
        <SectionTitle>Influence of Recurring Numbers</SectionTitle>
        {simpleRecurring.length ? (
          <div className="space-y-3">
            {simpleRecurring.map(({ number, occurrences, influence }) => (
              <div key={number} className="relative bg-gray-900/40 p-4 rounded-xl border border-yellow-400/20">
                <div className="absolute right-3 top-2 text-xs text-gray-400">Occurrences: {occurrences}</div>
                <div className="text-yellow-300 font-semibold mb-1">Number: {number}</div>
                <div className="text-sm text-gray-300">
                  <span className="font-semibold">Influence: </span>{influence}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No recurring-number changes caused by the current dasha layers.</p>
        )}
      </Card>

      {/* Dynamic Yogas — formed by overlays */}
      <Card className="p-4 md:p-5">
        <SectionTitle>Dynamic Yogas — Formed by Current Overlays</SectionTitle>
        {dynamicYogas.length > 0 ? (
          <div className="space-y-2">
            {dynamicYogas.map((y, i) => (
              <div key={i} className="bg-gray-900/40 p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <strong className="text-emerald-400">{t(y.name)}</strong>
                  <div className="flex gap-1">
                    {(y as any).formedBy?.map((layer: "maha"|"yearly"|"monthly"|"daily") => (
                      <span key={layer}
                        className="text-[10px] px-2 py-0.5 rounded bg-emerald-600/20 border border-emerald-500/30 text-emerald-200"
                        title="Overlay necessary for this yoga to form"
                      >
                        {layer}
                      </span>
                    ))}
                  </div>
                </div>
                {t(y.description) && <p className="text-sm text-gray-300 mt-1">{t(y.description)}</p>}
                {Array.isArray(y.traits) && y.traits.length > 0 && (
                  <ul className="list-disc list-inside text-xs mt-1 text-gray-400">
                    {y.traits.map((tr, idx) => <li key={idx}>{t(tr)}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-300 text-sm">No new yogas are created by the active overlays on this date.</p>
        )}
      </Card>
    </div>
  );
};

export default AdvancedDashaTab;
