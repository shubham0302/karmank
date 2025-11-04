import React from "react";
import type { NumerologyReport } from "./engine";
import { DATA } from "@/lib/numerology/data";

type Props = { report: NumerologyReport };

export default function NumerologySuite({ report }: Props) {
  const { name, dobISO, basicNumber, destinyNumber, baseKundliGrid } = report;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Foundational Numerology</h1>
      <div className="text-sm opacity-80">Name: {name} • DOB: {dobISO}</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border p-4">
          <h2 className="font-semibold">Basic Number</h2>
          <div className="text-3xl mt-2">{basicNumber}</div>
          <div className="mt-1 text-sm">{DATA.numberDetails[basicNumber]?.description}</div>
        </div>

        <div className="rounded-2xl border p-4">
          <h2 className="font-semibold">Destiny Number</h2>
          <div className="text-3xl mt-2">{destinyNumber}</div>
          <div className="mt-1 text-sm">{DATA.numberDetails[destinyNumber]?.description}</div>
        </div>

        <div className="rounded-2xl border p-4">
          <h2 className="font-semibold">Digit Presence (1–9)</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {Array.from({ length: 9 }, (_, i) => i + 1).map(n => (
              <span key={n} className="inline-flex items-center justify-center w-9 h-9 rounded-full border">
                {baseKundliGrid[n] ?? 0}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
