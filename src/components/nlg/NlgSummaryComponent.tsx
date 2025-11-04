import React, { useEffect, useMemo, useState } from "react";
import SpeechControl from "@/components/nlg/SpeechControl";
import { GlassCard } from "@/components/ui/glass-card";

type Props = {
  prompt: string;
  title: string;
  language: string;
  isPremium: boolean;
  onUpgradeClick?: () => void;
  isFreeWelcome?: boolean; // show full text even if not premium
};

export default function NlgSummaryComponent({
  prompt,
  title,
  language,
  isPremium,
  onUpgradeClick,
  isFreeWelcome = false,
}: Props) {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!prompt) return;
    const run = async () => {
      setIsLoading(true);
      setError("");
      try {
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const apiKey = ""; // <- put your Gemini API key
        const url =
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=" +
          apiKey;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`LLM call failed: ${res.status}`);
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        setSummary(text || "Could not generate a detailed summary at this time.");
      } catch (e: any) {
        setError(e.message || "An error occurred while generating the summary.");
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [prompt]);

  const truncateText = (text: string, sentenceLimit = 5) => {
    const pieces = text.split(/(?<=[.?!])\s+/);
    if (pieces.length <= sentenceLimit) return { truncated: text, isClipped: false };
    return { truncated: pieces.slice(0, sentenceLimit).join(" ") + "...", isClipped: true };
  };

  const { truncated, isClipped } = useMemo(() => {
    if (isPremium || isFreeWelcome || !summary) return { truncated: summary, isClipped: false };
    return truncateText(summary);
  }, [summary, isPremium, isFreeWelcome]);

  return (
    <GlassCard>
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-serif font-semibold">{title}</h3>
        {!isLoading && !error && summary && (
          <SpeechControl textToSpeak={truncated.replace(/\*/g, "")} language={language} />
        )}
      </div>

      {isLoading && <p className="text-muted-foreground">Generating your personal story…</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!isLoading && !error && (
        <>
          <p className="whitespace-pre-wrap">{truncated}</p>
          {isClipped && (
            <div className="text-center mt-4">
              <button
                onClick={onUpgradeClick}
                className="bg-auric-gold text-cosmic-blue font-semibold px-4 py-2 rounded-md"
              >
                Continue reading…
              </button>
            </div>
          )}
        </>
      )}
    </GlassCard>
  );
}
