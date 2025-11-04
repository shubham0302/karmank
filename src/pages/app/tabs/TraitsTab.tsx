// src/pages/app/tabs/TraitsTab.tsx
import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { DATA } from "@/lib/numerology/data";
import { getText } from "@/lib/numerology/utils";
import type { Language } from "@/lib/numerology/utils";

export default function TraitsTab({ language }: { language: Language }) {
  const map: any = (DATA as any)?.numberDetails || {};
  const entries = Object.keys(map)
    .map((k) => ({ n: parseInt(k, 10), detail: map[k] }))
    .sort((a, b) => a.n - b.n);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {entries.map(({ n, detail }: any) => (
        <GlassCard key={n}>
          <div className="text-sm space-y-2">
            <div className="font-serif font-semibold">Number {n}</div>
            {detail?.essence && <div className="opacity-90">{getText(detail.essence, language)}</div>}
            {Array.isArray(detail?.traits) && (
              <ul className="list-disc ml-4 opacity-90">
                {detail.traits.map((t: any, i: number) => <li key={i}>{getText(t, language)}</li>)}
              </ul>
            )}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
