import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Language } from "@/lib/numerology/utils";
import { getText } from "@/lib/numerology/utils";
import { computeKundliGrid } from "@/lib/numerology/compute";
import { GlassCard } from "@/components/ui/glass-card";

/* --- date helper: HTML date -> DD/MM/YYYY --- */
export const toDDMMYYYY = (v: string): string => {
  if (!v) return v;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) return v;
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return v;
  const [, yyyy, mm, dd] = m;
  return `${dd}/${mm}/${yyyy}`;
};

/* --- speech --- */
export function SpeechControl({ textToSpeak, language }: { textToSpeak: string; language: string }) {
  const [speaking, setSpeaking] = useState(false);
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;
  const speak = () => {
    if (!textToSpeak || !canSpeak) return;
    const utter = new SpeechSynthesisUtterance(textToSpeak.replace(/\*/g, ""));
    utter.lang = language?.toLowerCase().startsWith("hi") ? "hi-IN" : "en-US";
    utter.onend = () => setSpeaking(false);
    setSpeaking(true);
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch {}
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

/* --- nlg summary (Gemini) --- */
export function NlgSummary({
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
      } finally {
        setIsLoading(false);
      }
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

/* --- mini kundli preview (read-only) --- */
export function MiniKundli({ dob, language }: { dob: string; language: Language | string }) {
  if (!dob?.trim()) return null;
  let data: ReturnType<typeof computeKundliGrid> | null = null;
  try {
    const ddmmyyyy = toDDMMYYYY(dob);
    data = computeKundliGrid(ddmmyyyy, (language as Language) ?? "en");
  } catch (e) {
    console.error("[MiniKundli] computeKundliGrid error:", e);
    return null;
  }
  if (!data) return null;

  return (
    <GlassCard>
      <h3 className="text-lg font-serif font-semibold mb-2">Vedic Kundli (3×3)</h3>
      <div className="grid grid-cols-3 gap-2 max-w-xs">
        {data.matrix.flat().map((n, i) => (
          <div key={i} className="rounded-md border border-white/10 bg-background/30 p-2 text-center">
            <div className="text-sm font-semibold">{n}</div>
            <div className={(data.counts?.[n] ?? 0) > 0 ? "text-auric-gold text-xs" : "text-muted-foreground text-xs"}>
              ×{data.counts?.[n] ?? 0}
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm mt-3">{data.summary}</p>
    </GlassCard>
  );
}
