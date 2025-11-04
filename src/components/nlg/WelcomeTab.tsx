import React, { useMemo } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import NlgSummaryComponent from "@/components/nlg/NlgSummaryComponent";
import SpeechControl from "@/components/nlg/SpeechControl";
import { getText } from "@/lib/numerology/utils";
import { combinationInsights } from "@/lib/numerology/data";

type Props = {
  name: string;
  basicNumber: number;
  destinyNumber: number;
  language: string;
  isPremium: boolean;
  onUpgradeClick?: () => void;
};

export default function WelcomeTab({
  name,
  basicNumber,
  destinyNumber,
  language,
  isPremium,
  onUpgradeClick,
}: Props) {
  const key = `${basicNumber}-${destinyNumber}`;
  const staticInsight =
    getText((combinationInsights as any)[key] || { en: "A unique and fascinating combination." }, language);

  // same prompt shape as your file; premium gets full output, free welcome also gets full output
  const prompt = useMemo(() => {
    const wordHint = isPremium ? "" : "**Constraint: Your response must be a complete story between 200 and 300 words.**";
    return `
**Your Persona:** KarmAnk, a wise, warm numerology guide.
**Task:** Create a holistic narrative for ${name}. Weave their Basic Number (${basicNumber}) and Destiny Number (${destinyNumber}) into one, captivating story. Do NOT simply repeat the core insight. Show how these energies cooperate across life chapters.
**Tone:** mystical, warm, empowering.
**Language:** ${language}.
${wordHint}
**Begin the holistic story for ${name}...**
`;
  }, [name, basicNumber, destinyNumber, language, isPremium]);

  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-serif font-semibold">Your Core Combination Insight</h3>
          <SpeechControl textToSpeak={staticInsight} language={language} />
        </div>
        <p className="whitespace-pre-wrap">{staticInsight}</p>
      </GlassCard>

      <NlgSummaryComponent
        prompt={prompt}
        title="Your Personal Numerology Story"
        language={language}
        isPremium={isPremium}
        onUpgradeClick={onUpgradeClick}
        isFreeWelcome={!isPremium}
      />
    </div>
  );
}
