// src/pages/app/tabs/FoundationalAnalysisTab.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Sparkles, Info } from "lucide-react";

import { DATA } from "@/lib/numerology";
import { getText, calculateLifePath } from "@/lib/numerology/utils";
import type { Language } from "@/lib/numerology/utils";
import { computeKundliGrid } from "@/lib/numerology/compute";

/* ----------------------------- Types ----------------------------- */
type RecurringItem = { number: number; occurrences: number; influence: string };
type YogaItem = { name: string; description: string; traits?: string[] };
type InsightItem = { title: string; text: string };

/* ----------------------------- Helpers --------------------------- */
const toDDMMYYYY = (v: string): string => {
  if (!v) return v;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) return v;
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return v;
  const [, yyyy, mm, dd] = m;
  return `${dd}/${mm}/${yyyy}`;
};

const reduce1to9 = (n: number): number => {
  let x = Math.abs(n);
  while (x > 9) x = String(x).split("").reduce((a, d) => a + parseInt(d, 10), 0);
  return x;
};

const parseDobPartsLocal = (s: string) => {
  const norm = toDDMMYYYY(s) || s;
  const m = norm.match(/^\s*(\d{1,2})\D+(\d{1,2})\D+(\d{2,4})\s*$/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const yr = m[3];
  const year = yr.length === 2 ? parseInt(`20${yr}`, 10) : parseInt(yr, 10);
  return { day, month, year };
};

/* ---------- Yoga rule helpers (aligned with AdvancedDashaTab) ---------- */
type YogaRuleLegacy = {
  allOf?: number[];
  anyOf?: number[];
  noneOf?: number[];
  minCount?: Record<number, number>;
};
type YogaRuleStrict = {
  requires_presence?: number[];
  requires_absence?: number[];
  requires_counts?: Record<number, number>;
};
type YogaRules = YogaRuleLegacy & YogaRuleStrict;

type YogaCatalogItem = {
  id?: string | number;
  name?: any;
  description?: any;
  traits?: any[];
  // legacy schema
  numbers?: number[];
  empty?: number[];
  // new strict schema
  activation_rules?: YogaRules;
  // optional Basic/Destiny gating (if provided in DATA)
  combo?: { basic?: number | number[]; destiny?: number | number[] };
  comboBD?: { basic?: number | number[]; destiny?: number | number[] };
  basicDestiny?: { basic?: number | number[]; destiny?: number | number[] };
};

const toArray = <T,>(v: T | T[] | undefined): T[] =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

function normalizeCatalog(src: YogaCatalogItem[] | Record<string, YogaCatalogItem> | any): YogaCatalogItem[] {
  if (!src) return [];
  if (Array.isArray(src)) return src as YogaCatalogItem[];
  if (typeof src === "object") return Object.keys(src).map(k => ({ id: k, ...(src as any)[k] })) as YogaCatalogItem[];
  return [];
}

function normalizeRules(rules?: YogaRules) {
  const allOf    = rules?.allOf    ?? rules?.requires_presence ?? [];
  const noneOf   = rules?.noneOf   ?? rules?.requires_absence ?? [];
  const anyOf    = rules?.anyOf    ?? [];
  const minCount = rules?.minCount ?? rules?.requires_counts  ?? {};
  return { allOf, anyOf, noneOf, minCount };
}

function checkRules(rules: YogaRules | undefined, grid: number[]): boolean {
  if (!rules) return false;
  const { allOf, anyOf, noneOf, minCount } = normalizeRules(rules);

  // must have all
  for (const n of allOf) if ((grid[n] ?? 0) <= 0) return false;

  // must have any
  if (anyOf.length) {
    let ok = false;
    for (const n of anyOf) if ((grid[n] ?? 0) > 0) { ok = true; break; }
    if (!ok) return false;
  }

  // must have none
  for (const n of noneOf) if ((grid[n] ?? 0) > 0) return false;

  // minimum counts
  for (const k of Object.keys(minCount)) {
    const n = Number(k);
    if ((grid[n] ?? 0) < Number((minCount as any)[k])) return false;
  }
  return true;
}

function legacyMatch(y: YogaCatalogItem, grid: number[]): boolean {
  if (!Array.isArray(y.numbers) || y.numbers.length === 0) return false;
  // require all "numbers" to be present
  for (const n of y.numbers) if ((grid[n] ?? 0) <= 0) return false;
  // require all "empty" to be zero
  if (Array.isArray(y.empty)) {
    for (const n of y.empty) if ((grid[n] ?? 0) > 0) return false;
  }
  return true;
}

function yogaMatches(y: YogaCatalogItem, grid: number[]): boolean {
  if (y.activation_rules) return checkRules(y.activation_rules, grid);
  return legacyMatch(y, grid);
}

function comboAllows(
  y: YogaCatalogItem,
  basic?: number,
  destiny?: number
): boolean {
  const gate = (y.comboBD ?? y.combo ?? y.basicDestiny) as
    | { basic?: number | number[]; destiny?: number | number[] }
    | undefined;
  if (!gate) return true;
  const inSet = (req: number | number[] | undefined, val?: number) => {
    if (req === undefined || val === undefined || Number.isNaN(val)) return true;
    return toArray(req).includes(val);
  };
  return inSet(gate.basic, basic) && inSet(gate.destiny, destiny);
}

/* ----------------------------- Speech ---------------------------- */
function SpeechControl({ textToSpeak, language }: { textToSpeak: string; language: string }) {
  const [speaking, setSpeaking] = useState(false);
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;
  const speak = () => {
    if (!textToSpeak || !canSpeak) return;
    const utter = new SpeechSynthesisUtterance(textToSpeak.replace(/\*/g, ""));
    utter.lang = language?.toLowerCase().startsWith("hi") ? "hi-IN" : "en-US";
    utter.onend = () => setSpeaking(false);
    setSpeaking(true);
    try { window.speechSynthesis.cancel(); window.speechSynthesis.speak(utter); } catch {}
  };
  const stop = () => { if (canSpeak) window.speechSynthesis.cancel(); setSpeaking(false); };
  return (
    <div className="flex items-center gap-2">
      <button onClick={speaking ? stop : speak} className="text-xs px-2 py-1 rounded bg-auric-gold/20 border border-auric-gold/40">
        {speaking ? "Stop" : "Speak"}
      </button>
    </div>
  );
}

/* ------------------------------ NLG ------------------------------ */
function NlgSummary({
  prompt, title, language, isPremium, onUpgradeClick, isFreeWelcome = false,
}: {
  prompt: string; title: string; language: string; isPremium: boolean; onUpgradeClick: () => void; isFreeWelcome?: boolean;
}) {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!prompt) return;
    const run = async () => {
      setIsLoading(true); setError("");
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const apiKey = import.meta.env.VITE_GEMINI_KEY || "";
        const apiUrl =
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const resp = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        if (!resp.ok) throw new Error(`API status ${resp.status}`);
        const data = await resp.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        setSummary(text || "Could not generate a detailed summary at this time.");
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error(e);
          setError("Could not generate summary right now. Please try again.");
        }
      } finally { setIsLoading(false); }
    };
    run();
    return () => abortRef.current?.abort();
  }, [prompt]);

  const truncate = (t: string, sentenceLimit = 5) => {
    const sentences = t.split(/(?<=[.?!])\s+/);
    if (sentences.length <= sentenceLimit) return { text: t, clipped: false };
    return { text: sentences.slice(0, sentenceLimit).join(" ") + "…", clipped: true };
  };

  const { text: display, clipped } = useMemo(() => {
    if (isPremium || isFreeWelcome || !summary) return { text: summary, clipped: false };
    return truncate(summary);
  }, [summary, isPremium, isFreeWelcome]);

  return (
    <GlassCard>
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-serif font-semibold">{title}</h3>
        {!isLoading && !error && summary && <SpeechControl textToSpeak={display} language={language} />}
      </div>
      {isLoading && <p className="text-sm text-muted-foreground">Generating personalized summary…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!isLoading && !error && (
        <>
          <p className="text-sm whitespace-pre-wrap">{display}</p>
          {clipped && (
            <div className="text-center mt-3">
              <button onClick={onUpgradeClick} className="bg-auric-gold/80 text-cosmic-blue font-semibold px-4 py-2 rounded hover:bg-auric-gold">
                Continue Reading…
              </button>
            </div>
          )}
        </>
      )}
    </GlassCard>
  );
}

/* ------------------------- Mini Kundli (3×3) ---------------------- */
function MiniKundli({ dob, language }: { dob: string; language: Language | string }) {
  if (!dob?.trim()) return null;
  let data: ReturnType<typeof computeKundliGrid> | null = null;
  try {
    const ddmmyyyy = toDDMMYYYY(dob);
    data = computeKundliGrid(ddmmyyyy, (language as Language) ?? "en");
  } catch (e) {
    console.error("[FoundationalAnalysisTab] computeKundliGrid error:", e);
    return null;
  }
  if (!data) return null;

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-serif font-semibold">Vedic Kundli (Mini 3×3)</h3>
        <Sparkles className="h-4 w-4 text-auric-gold" />
      </div>
      <div className="grid grid-cols-3 gap-2 max-w-xs">
        {data.matrix.flat().map((n, i) => {
          const count = data.counts?.[n] ?? 0;
          return (
            <div key={i} className="rounded-md border border-white/10 bg-background/30 p-2 text-center">
              {count > 0 && <div className="text-base font-mono whitespace-nowrap leading-none">{String(n).repeat(count)}</div>}
            </div>
          );
        })}
      </div>
      <p className="text-xs mt-3 text-muted-foreground">{data.summary}</p>
    </GlassCard>
  );
}

/* ------------------------------- Main ---------------------------- */
type Props = {
  name: string;
  dob: string;                   // DD/MM/YYYY or HTML date
  language: Language | string;
  isPremium: boolean;
  onUpgradeClick: () => void;
};

export default function FoundationalAnalysisTab({
  name, dob, language, isPremium, onUpgradeClick,
}: Props) {
  /* ---- Basic & Destiny (needed for combo + recurring rules) ---- */
  const basicDestiny = useMemo(() => {
    const p = parseDobPartsLocal(dob);
    if (!p) return { basic: "-", destiny: "-" };
    const basic = String(reduce1to9(p.day));
    let d = calculateLifePath(`${String(p.day).padStart(2, "0")}/${String(p.month).padStart(2, "0")}/${String(p.year)}`);
    if (d > 9) d = reduce1to9(d);
    return { basic, destiny: String(d) };
  }, [dob]);

  /* ---- Kundli (single source of truth) ---- */
  const ddmmyyyy = toDDMMYYYY(dob);
  const kundli = useMemo(() => {
    try { return computeKundliGrid(ddmmyyyy, (language as Language) ?? "en"); }
    catch { return null; }
  }, [ddmmyyyy, language]);

  /* ================= Recurring numbers (canonical rules) ================ */
  const analysis: RecurringItem[] = useMemo(() => {
    if (!kundli?.counts) return [];
    const rules = (DATA as any)?.recurringNumberInfluence || {};
    const destinyNumber = Number(basicDestiny.destiny) || 0;

    const out: RecurringItem[] = [];
    for (let num = 1; num <= 9; num++) {
      const count = kundli.counts[num] ?? 0;
      if (count <= 1) continue; // recurring := 2+

      const rule = rules[num];
      if (!rule) continue;

      const influenceBits: string[] = [];

      if (rule.base) influenceBits.push(getText(rule.base, language as any));
      if (count >= 3 && rule.threeOrMore) influenceBits.push(getText(rule.threeOrMore, language as any));
      if (num === destinyNumber && rule.withDestiny) influenceBits.push(getText(rule.withDestiny, language as any));
      if (rule.evenCount && count % 2 === 0) influenceBits.push(getText(rule.evenCount, language as any));
      if (rule.oddCount && count % 2 !== 0) influenceBits.push(getText(rule.oddCount, language as any));

      Object.keys(rule).forEach(k => {
        const mPlus = /^(\d+)\+$/.exec(k);
        if (mPlus) {
          const n = parseInt(mPlus[1], 10);
          if (count >= n) influenceBits.push(getText(rule[k], language as any));
        }
        const mRange = /^(\d+)-(\d+)$/.exec(k);
        if (mRange) {
          const a = parseInt(mRange[1], 10), b = parseInt(mRange[2], 10);
          if (count >= a && count <= b) influenceBits.push(getText(rule[k], language as any));
        }
      });

      if (influenceBits.length > 0) {
        out.push({
          number: num,
          occurrences: count,
          influence: influenceBits.filter(Boolean).join(" "),
        });
      }
    }

    return out.sort((a, b) => (b.occurrences - a.occurrences) || (a.number - b.number));
  }, [kundli?.counts, basicDestiny.destiny, language]);

  /* =================== Yogas (AdvancedDasha-style rules) =================
     Supports BOTH legacy:
       { numbers: [1,2], empty: [3,6] }
     and strict activation rules:
       { activation_rules: { requires_counts: {"2":2}, requires_presence:[6], requires_absence:[3] } }
     Optional Basic/Destiny gating via combo/comboBD/basicDestiny.
  */
  const yogas: YogaItem[] = useMemo(() => {
    if (!kundli?.counts) return [];
    const catalog = normalizeCatalog((DATA as any)?.yogaDetails);
    const basicNum = Number(basicDestiny.basic);
    const destinyNum = Number(basicDestiny.destiny);
    const t = (v: any) => getText(v, language as any);

    const result: YogaItem[] = [];
    for (const y of catalog) {
      if (!yogaMatches(y, kundli.counts)) continue;
      if (!comboAllows(y, basicNum, destinyNum)) continue;

      result.push({
        name: t(y.name ?? { en: "Yoga" }),
        description: t(y.description ?? { en: "" }),
        traits: Array.isArray(y.traits) ? y.traits.map(t).filter(Boolean) : [],
      });
    }

    return result;
  }, [kundli?.counts, basicDestiny.basic, basicDestiny.destiny, language]);

  /* --------- Optional special insights (from DATA if provided) --- */
  const specialInsights: InsightItem[] = useMemo(() => {
    const gen = (DATA as any)?.specialFoundationalInsights?.generate;
    if (typeof gen === "function") {
      try { return gen(kundli) ?? []; } catch {}
    }
    const list = (DATA as any)?.specialFoundationalInsights?.list ?? [];
    if (!Array.isArray(list)) return [];
    const out: InsightItem[] = [];
    for (const it of list) {
      const ok = typeof it.match === "function" ? (it.match(kundli) ?? false) : false;
      if (ok) out.push({
        title: getText(it.title ?? { en: "Insight" }, language as any),
        text:  getText(it.text  ?? { en: "" }, language as any),
      });
    }
    return out;
  }, [kundli, language]);

  /* -------------------- Foundational NLG prompt ------------------- */
  const foundationalPrompt = useMemo(() => {
    if (!kundli) return "";
    if (yogas.length === 0 && analysis.length === 0 && specialInsights.length === 0) return "";

    let prompt =
      "You are a Vedic numerologist. Based on the following foundational chart analysis, write a 2–4 sentence summary of the person's key strengths and challenges.\n\n";

    if (yogas.length > 0) {
      prompt += "Foundational Yogas Present:\n";
      yogas.forEach((y) => { prompt += `- ${y.name}: ${y.description}\n`; });
    } else {
      prompt += "No significant foundational yogas are present.\n";
    }

    if (analysis.length > 0) {
      prompt += "\nInfluence of Recurring Numbers:\n";
      analysis.forEach((it) => { prompt += `- Number ${it.number} (appears ${it.occurrences} times): ${it.influence}\n`; });
    }

    if (specialInsights.length > 0) {
      prompt += "\nSpecial Foundational Insights:\n";
      specialInsights.forEach((ins) => { prompt += `- ${ins.title}: ${ins.text}\n`; });
    }

    prompt += `\nUser’s Basic Number: ${basicDestiny.basic}, Destiny Number: ${basicDestiny.destiny}.`;
    prompt += "\nSummarize the most important takeaways for the user in a gentle and empowering tone.";
    return prompt;
  }, [kundli, yogas, analysis, specialInsights, basicDestiny]);

  /* ---------------- Story prompt (distinct from Welcome) ---------- */
  const storyTitle = useMemo(
    () => getText(
      { en: "Your Personal Numerology Story", hi: "आपकी व्यक्तिगत अंक ज्योतिष कहानी", "en-hi": "Aapki Personal Numerology Story" } as any,
      language as any
    ),
    [language]
  );

  const nlgPrompt = useMemo(() => {
    const clamp = isPremium ? "" : "**Constraint: Your response must be a complete story between 200 and 300 words.**";
    return `
**Your Persona: KarmAnk, a wise, mystical, and warm numerology guide.**
**Your Task:** Create a holistic narrative for ${name}. Weave their Basic Number (${basicDestiny.basic}) and Destiny Number (${basicDestiny.destiny}) into a single, captivating story. Do NOT repeat Welcome-tab insights.
**Tonal Guidelines:** Mystical, warm, empowering.
**Language:** ${language}.
${clamp}
**Begin the holistic story for ${name}...**
`.trim();
  }, [name, language, isPremium, basicDestiny]);

  /* -------------------------------- UI ---------------------------- */
  return (
    <div className="space-y-6">
      {/* Kundli first (source of truth) */}
      <MiniKundli dob={dob} language={language} />

      {/* Foundational Blueprint (auto from Kundli + DATA) */}
      {foundationalPrompt && (
        <NlgSummary
          title="Your Foundational Blueprint"
          prompt={foundationalPrompt}
          language={String(language)}
          isPremium={isPremium}
          onUpgradeClick={onUpgradeClick}
        />
      )}

      {/* Influence of Recurring Numbers */}
      <GlassCard>
        <h4 className="font-serif font-semibold mb-2">Influence of Recurring Numbers</h4>
        {analysis.length > 0 ? (
          <div className="space-y-4">
            {analysis.map((item) => (
              <div key={item.number} className="bg-background/40 p-4 rounded-md border-l-4 border-auric-gold/70">
                <div className="flex justify-between items-baseline">
                  <h5 className="text-lg font-bold text-auric-gold">Number: {item.number}</h5>
                  <span className="text-xs text-muted-foreground">Occurrences: {item.occurrences}</span>
                </div>
                <div className="mt-2 text-sm text-foreground/90">
                  <span className="font-medium text-auric-gold/90">Influence: </span>
                  {item.influence}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No numbers recur in your chart. The energy of each number is balanced.</p>
        )}
      </GlassCard>

      {/* Special Foundational Insights */}
      {specialInsights.length > 0 && (
        <GlassCard>
          <h4 className="font-serif font-semibold mb-2">Special Foundational Insights</h4>
          <div className="space-y-3">
            {specialInsights.map((insight, idx) => (
              <div key={`${insight.title}-${idx}`} className="bg-indigo-900/30 p-3 rounded-md border-l-4 border-indigo-400/70">
                <h5 className="text-base font-semibold text-indigo-200">{insight.title}</h5>
                <p className="text-sm text-indigo-100/90 mt-1">{insight.text}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Foundational Yogas */}
      <GlassCard>
        <h4 className="font-serif font-semibold mb-2">Foundational Yogas</h4>
        <div className="text-center bg-blue-900/30 text-blue-300 p-2 rounded-md mb-3 text-xs">
          These yogas are derived strictly from your Base Chart (Kundli grid).
        </div>
        {yogas.length > 0 ? (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {yogas.map((y, i) => (
              <div key={`${y.name}-${i}`} className="bg-background/30 p-3 rounded-md">
                <strong className="text-auric-gold">{y.name}</strong>
                <p className="text-xs text-foreground/90 mt-1">{y.description}</p>
                {y.traits && y.traits.length > 0 && (
                  <ul className="list-disc list-inside text-[11px] mt-1 text-foreground/70">
                    {y.traits.map((t, ti) => <li key={`${t}-${ti}`}>{t}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No foundational yogas detected in the birth chart.</p>
        )}
      </GlassCard>

      {/* Cosmic summary / planes / counts */}
      {kundli ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard variant="elevated" size="sm" className="lg:col-span-1">
            <h4 className="font-serif font-semibold mb-2 flex items-center gap-2">
              <Info className="h-4 w-4 text-auric-gold" />
              Cosmic Summary
            </h4>
            <p className="text-sm leading-relaxed">{kundli.summary}</p>
          </GlassCard>

          <GlassCard variant="subtle" size="sm" className="lg:col-span-1">
            <h4 className="font-serif font-semibold mb-2">Plane Analysis</h4>
            <div className="space-y-2 text-sm">
              {Object.entries(kundli.planes).map(([plane, data]) => {
                const status = (data as any).status;
                const label =
                  status === "strong" ? "Strong" :
                  status === "balanced" ? "Balanced" :
                  status === "weak" ? "Weak" :
                  status === "missing" ? "Missing" : "Unknown";
                const color =
                  status === "strong" ? "text-green-400" :
                  status === "balanced" ? "text-auric-gold" :
                  status === "weak" ? "text-orange-400" :
                  status === "missing" ? "text-red-400" : "text-gray-400";
                return (
                  <div key={plane} className="flex items-center justify-between">
                    <span className="capitalize font-medium">{plane}</span>
                    <span className={color}>{label}</span>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard variant="subtle" size="sm" className="lg:col-span-1">
            <h4 className="font-serif font-semibold mb-3">Number Frequency</h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              {Array.from({ length: 9 }, (_, i) => i + 1)
                .map((num) => (
                  <div key={num} className="flex items-center justify-between p-1 rounded bg-background/30">
                    <span>{num}</span>
                    <span className="text-auric-gold">{kundli.counts?.[num] ?? 0}</span>
                  </div>
                ))}
            </div>
          </GlassCard>
        </div>
      ) : null}
    </div>
  );
}
