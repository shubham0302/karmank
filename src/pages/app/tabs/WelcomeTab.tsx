// src/pages/app/tabs/WelcomeTab.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";

// Data
import { combinationInsights } from "@/lib/numerology/data";
import { DATA } from "@/lib/numerology";
import { getText } from "@/lib/numerology/utils";
import type { Language } from "@/lib/numerology/utils";
import { computeKundliGrid } from "@/lib/numerology/compute";

// ✅ NEW: shared report context
import { useReport, type WelcomeReport as CtxReport } from "@/context/ReportContext";

/* ----------------------------- Helpers ----------------------------- */

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

const computeBasicAndDestiny = (dob: string): { basic: number | null; destiny: number | null } => {
  const ddmmyyyy = toDDMMYYYY(dob);
  const m = ddmmyyyy?.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return { basic: null, destiny: null };
  const dd = m[1];

  const basicSum = dd.split("").reduce((a, d) => a + parseInt(d, 10), 0);
  const basic = reduce1to9(basicSum);

  const allDigits = ddmmyyyy.replace(/\D/g, "");
  const destinySum = allDigits.split("").reduce((a, d) => a + parseInt(d, 10), 0);
  const destiny = reduce1to9(destinySum);

  return { basic, destiny };
};

/* ----------------------------- Speech ------------------------------ */

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

/* ----------------------- NLG: Personal Story ----------------------- */

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
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const resp = await fetch(apiUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: controller.signal });
        if (!resp.ok) throw new Error(`API status ${resp.status}`);
        const data = await resp.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        setSummary(text || "Could not generate a detailed summary at this time.");
      } catch (e: any) {
        if (e?.name !== "AbortError") { console.error(e); setError("Could not generate summary right now. Please try again."); }
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
      {isLoading && <p className="text-sm text-muted-foreground">Generating personalized story…</p>}
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

/* ----------------------- Main Kundli (Detailed) --------------------- */

function MainKundli({
  dob,
  language,
  basic,
  destiny,
}: {
  dob: string;
  language: Language | string;
  basic: number | null;
  destiny: number | null;
}) {
  if (!dob?.trim()) return null;

  let data: ReturnType<typeof computeKundliGrid> | null = null;
  try {
    const ddmmyyyy = toDDMMYYYY(dob);
    data = computeKundliGrid(ddmmyyyy, (language as Language) ?? "en");
  } catch (e) {
    console.error("[WelcomeTab] computeKundliGrid error:", e);
    return null;
  }
  if (!data) return null;

  const getCellStyle = (intensity: "dim" | "base" | "bright" | "pulse") => {
    const baseStyle = "relative flex items-center justify-center rounded-xl border transition-all duration-300 overflow-hidden p-0.5";
    switch (intensity) {
      case "dim":   return `${baseStyle} bg-cosmic-blue/20 border-primary/20`;
      case "base":  return `${baseStyle} bg-cosmic-blue/40 border-auric-gold/30`;
      case "bright":return `${baseStyle} bg-nebula-violet/30 border-auric-gold/50 shadow-lg`;
      case "pulse": return `${baseStyle} bg-gradient-auric border-auric-gold text-cosmic-blue shadow-2xl`;
    }
  };

  return (
    <GlassCard variant="cosmic" className="relative overflow-hidden mx-auto w-[380px] md:w-[420px] p-3 md:p-4">
      <div className="relative z-10 space-y-4">
        <div className="text-center">
          <h3 className="text-lg md:text-xl font-serif font-semibold">Cosmic Vedic Kundli (3×3)</h3>

          {(basic !== null || destiny !== null) && (
            <div className="mt-3 flex items-stretch justify-center gap-4">
              {basic !== null && (
                <div className="rounded-xl bg-emerald-600/20 border border-emerald-500/40 px-4 py-3 min-w-[110px]">
                  <div className="text-[11px] uppercase tracking-wide text-emerald-300/90">Basic No.</div>
                  <div className="text-2xl font-extrabold text-emerald-300 leading-none mt-1 text-center">{basic}</div>
                </div>
              )}
              {destiny !== null && (
                <div className="rounded-xl bg-amber-600/20 border border-amber-500/40 px-4 py-3 min-w-[110px]">
                  <div className="text-[11px] uppercase tracking-wide text-amber-300/90">Destiny No.</div>
                  <div className="text-2xl font-extrabold text-amber-300 leading-none mt-1 text-center">{destiny}</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1.5 max-w-[200px] mx-auto">
          {data.matrix.flat().map((number, index) => {
            const count = data.counts[number] || 0;
            const intensity: "dim" | "base" | "bright" | "pulse" =
              count === 0 ? "dim" : count === 1 ? "base" : count === 2 ? "bright" : "pulse";

            return (
              <div key={index} className={getCellStyle(intensity)} style={{ aspectRatio: "1" }}>
                {count > 0 && (
                  <span className="text-lg md:text-xl font-mono whitespace-nowrap leading-none" title={`Digit ${number} appears ${count} time(s)`}>
                    {String(number).repeat(count)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}

/* ------------------------------ Main ------------------------------- */

export type WelcomeReport = {
  basicNumber: number | null;
  destinyNumber: number | null;
};

export default function WelcomeTab({
  name,
  dob,
  basicNumber,   // kept for story prompt
  destinyNumber, // kept for story prompt
  language,
  isPremium,
  onUpgradeClick,
  onReportChange, // optional legacy callback
}: {
  name: string;
  dob: string;
  basicNumber: number;
  destinyNumber: number;
  language: string;
  isPremium: boolean;
  onUpgradeClick: () => void;
  onReportChange?: (report: WelcomeReport) => void;
}) {
  const lang = String(language).toLowerCase() as any;
  const { setReport } = useReport(); // ✅ publish to global context

  // ✅ Compute once, reuse everywhere
  const { basic: keyBasic, destiny: keyDestiny } = useMemo(() => computeBasicAndDestiny(dob), [dob]);

  // 🔁 stable report object
  const report: CtxReport = useMemo(
    () => ({ basicNumber: keyBasic, destinyNumber: keyDestiny }),
    [keyBasic, keyDestiny]
  );

  // 🔔 publish to context (+ keep optional legacy callback)
  useEffect(() => {
    setReport(report);
    onReportChange?.(report);
  }, [report, setReport, onReportChange]);

  const pairKey = `${keyBasic ?? ""}-${keyDestiny ?? ""}`;
  const tryKeys = [
    pairKey,
    `${keyBasic}${keyDestiny}`,
    `B${keyBasic}-D${keyDestiny}`,
    `${String(keyBasic ?? "").padStart(2, "0")}-${String(keyDestiny ?? "").padStart(2, "0")}`,
    `${keyBasic}_${keyDestiny}`,
  ];

  const kundli = useMemo(() => {
    try { return computeKundliGrid(toDDMMYYYY(dob), (language as Language) ?? "en"); }
    catch { return null; }
  }, [dob, language]);

  // Snapshot
  const snapshotNode = tryKeys.map(k => (combinationInsights as any)?.[k]).find(Boolean);
  const snapshotText = getText(snapshotNode ?? null, lang) || "";

  // Core Numbers (multilingual)
  const destinyNode = (DATA as any)?.destinyNumberDetails?.[keyDestiny ?? ""]?.description;
  const destinyText = getText(destinyNode ?? null, lang) || "";

  const rawBasicNode = (DATA as any)?.basicNumberDetails?.[keyBasic ?? ""]?.description;
  const fallbackBasicNode = (DATA as any)?.destinyNumberDetails?.[keyBasic ?? ""]?.description;
  const basicText = getText(rawBasicNode ?? fallbackBasicNode ?? null, lang) || "";

  // Present numbers (excluding core)
  const presentNumbers: number[] = useMemo(() => {
    if (!kundli?.counts) return [];
    const list: number[] = [];
    for (let n = 1; n <= 9; n++) {
      if ((kundli.counts[n] || 0) > 0 && n !== keyBasic && n !== keyDestiny) list.push(n);
    }
    return list;
  }, [kundli, keyBasic, keyDestiny]);

  const otherNumberDetails = useMemo(() => {
    const lines: { n: number; text: string }[] = [];
    presentNumbers.forEach((n) => {
      const node = (DATA as any)?.numberDetails?.[n]?.description;
      const text = getText(node ?? null, lang);
      if (text) lines.push({ n, text });
    });
    return lines;
  }, [presentNumbers, lang]);

  // Story
  const storyTitle = getText(
    { en: "Your Personal Numerology Story", hi: "आपकी व्यक्तिगत अंक ज्योतिष कहानी", "en-hi": "Aapki Personal Numerology Story" } as any,
    lang
  );
  const prompt = useMemo(() => {
    const clamp = isPremium ? "" : "**Constraint: Your response must be a complete story between 200 and 300 words.**";
    return `
**Your Persona: KarmAnk, a wise, mystical, and warm numerology guide.**
**Your Task:** Create a holistic narrative for ${name}. Weave their Basic Number (${basicNumber}) and Destiny Number (${destinyNumber}) into a single, captivating story. Do NOT simply repeat the core insight. Instead, tell a story about how these two energies work together in their life's journey.
**Tonal Guidelines:** Use mystical, warm, playful, and empowering language.
**Language:** ${language}.
${clamp}
**Begin the holistic story for ${name}...**
`.trim();
  }, [name, basicNumber, destinyNumber, language, isPremium]);

  return (
    <div className="space-y-6">
      <MainKundli dob={dob} language={language as Language} basic={keyBasic} destiny={keyDestiny} />

      {snapshotText ? (
        <GlassCard className="mx-auto max-w-3xl">
          <h3 className="text-xl font-serif font-semibold mb-2">Your Numerology Snapshot</h3>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{snapshotText}</p>
        </GlassCard>
      ) : null}

      {(destinyText || basicText || keyBasic !== null || keyDestiny !== null) && (
        <GlassCard className="mx-auto max-w-3xl">
          <h3 className="text-xl font-serif font-semibold mb-3">Core Numbers</h3>
          <div className="space-y-3">
            {keyDestiny !== null && (
              <div>
                <div className="text-sm font-semibold text-amber-300">Destiny Number {keyDestiny}</div>
                {destinyText && <p className="text-sm whitespace-pre-wrap">{destinyText}</p>}
              </div>
            )}
            {keyBasic !== null && (
              <div>
                <div className="text-sm font-semibold text-emerald-300">Basic Number {keyBasic}</div>
                {basicText && <p className="text-sm whitespace-pre-wrap">{basicText}</p>}
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {otherNumberDetails.length > 0 && (
        <GlassCard className="mx-auto max-w-3xl">
          <h3 className="text-xl font-serif font-semibold mb-3">Other Numbers Present in Your Chart</h3>
          <ul className="space-y-3 list-disc list-inside text-sm">
            {otherNumberDetails.map(({ n, text }) => (
              <li key={n}>
                <span className="font-semibold">Number {n}: </span>
                <span className="whitespace-pre-wrap">{text}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      <NlgSummary
        prompt={prompt}
        title={storyTitle}
        language={language}
        isPremium={isPremium}
        onUpgradeClick={onUpgradeClick}
        isFreeWelcome={!isPremium}
      />
    </div>
  );
}
