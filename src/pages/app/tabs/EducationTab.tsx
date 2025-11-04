// src/pages/app/tabs/EducationTab.tsx
import React from "react";
import { Card } from "@/components/ui/card";
import { DATA } from "@/lib/numerology/data";
import { reduceToSingleDigit } from "@/lib/numerology";
import { getText } from "@/lib/numerology/utils";
import type { Language } from "@/lib/numerology/utils";

type ReportLike = Record<string, any> | null | undefined;

type Props = {
  report?: ReportLike;                // prefer full report
  basicNumber?: number | string;      // fallback
  destinyNumber?: number | string;    // fallback
  language?: Language;                // "en" | "hi" | "en-hi" (default "en")
};

/* ----------------------- utils ----------------------- */

const getPath = (obj: any, path: string) =>
  path.split(".").reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);

function toCoreDigit(v: unknown): number | undefined {
  if (v == null) return undefined;
  if (typeof v === "number" && Number.isFinite(v)) {
    const d = reduceToSingleDigit(v);
    return d >= 1 && d <= 9 ? d : undefined;
  }
  if (typeof v === "string") {
    const digits = v.match(/\d+/g)?.join("") ?? "";
    const n = digits ? Number(digits) : Number(v);
    if (Number.isFinite(n)) {
      const d = reduceToSingleDigit(n);
      return d >= 1 && d <= 9 ? d : undefined;
    }
  }
  return undefined;
}

/** Try common places (be generous to different report shapes) */
function extractNumber(report: ReportLike, which: "basic" | "destiny") {
  if (!report) return undefined;
  const paths =
    which === "basic"
      ? [
          "basicNumber",
          "numbers.basicNumber",
          "coreNumbers.basicNumber",
          "core.basicNumber",
          "summary.basicNumber",
          "result.basicNumber",
        ]
      : [
          "destinyNumber",
          "numbers.destinyNumber",
          "coreNumbers.destinyNumber",
          "core.destinyNumber",
          "summary.destinyNumber",
          "result.destinyNumber",
        ];
  for (const p of paths) {
    const val = toCoreDigit(getPath(report, p));
    if (val !== undefined) return val;
  }
  return undefined;
}

/** Normalize to a single language even if raw strings are "English / Hindi" */
function normalizeText(value: any, language: Language): string {
  // First, honor localized objects via getText
  const txt =
    value != null && typeof value === "object" ? getText(value, language) :
    typeof value === "string" ? value :
    value != null ? String(value) : "";

  if (!txt) return "";

  // If caller explicitly wants bilingual, return as-is
  if (language === "en-hi") return txt;

  // If the string looks bilingual in one field (e.g., "English / हिन्दी"),
  // pick the segment for the chosen language.
  const splitters = [" / ", " | ", " || ", " — "];
  for (const s of splitters) {
    if (txt.includes(s)) {
      const parts = txt.split(s).map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        return language === "hi" ? parts[parts.length - 1] : parts[0];
      }
    }
  }
  return txt;
}

/* --------------------- component --------------------- */

export default function EducationTab({
  report,
  basicNumber,
  destinyNumber,
  language = "en",
}: Props) {
  // prefer values from report; fall back to direct props
  const basic   = extractNumber(report, "basic")   ?? toCoreDigit(basicNumber);
  const destiny = extractNumber(report, "destiny") ?? toCoreDigit(destinyNumber);

  const store: Record<string, any> = (DATA as any)?.educationalGuidance ?? {};
  const basicData   = basic   !== undefined ? store[String(basic)]   : undefined;
  const destinyData = destiny !== undefined ? store[String(destiny)] : undefined;

  const InfoCard = ({
    title,
    number,
    data,
    isDestiny = false,
  }: {
    title: string;
    number: number;
    data: any;
    isDestiny?: boolean;
  }) => (
    <Card className="p-4 md:p-5 bg-gray-900/40 border border-yellow-400/10">
      <h3 className="text-lg md:text-xl font-semibold text-yellow-400 mb-4">
        {title} (Number {number})
      </h3>

      {isDestiny ? (
        <div className="space-y-3 text-gray-200">
          <p>
            <strong className="text-yellow-300">Ideal Stream:</strong>{" "}
            {normalizeText(data?.educationStream, language)}
          </p>
          <p>
            <strong className="text-yellow-300">Career Paths:</strong>{" "}
            {normalizeText(data?.careerPath, language)}
          </p>
          <p>
            <strong className="text-yellow-300">Parental Guidance:</strong>{" "}
            {normalizeText(data?.parentalGuidance, language)}
          </p>
        </div>
      ) : (
        <div className="space-y-3 text-gray-200">
          <p>
            <strong className="text-yellow-300">Learning Style:</strong>{" "}
            {normalizeText(data?.learningStyle, language)}
          </p>
          <p>
            <strong className="text-yellow-300">Strengths:</strong>{" "}
            {normalizeText(data?.strengths, language)}
          </p>
          <p>
            <strong className="text-yellow-300">Challenges:</strong>{" "}
            {normalizeText(data?.challenges, language)}
          </p>
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-yellow-400 mb-1">Educational Numerology Guide</h2>

      {basic && basicData ? (
        <InfoCard title="Student Profile / Basic Number" number={basic} data={basicData} />
      ) : (
        <Card className="p-4 bg-gray-900/30 border border-yellow-400/10">
          <p className="text-yellow-200/80">
            Basic Number details not available. Please generate the report to view the student profile.
          </p>
        </Card>
      )}

      {destiny && destinyData ? (
        <InfoCard title="Educational Path / Destiny Number" number={destiny} data={destinyData} isDestiny />
      ) : (
        <Card className="p-4 bg-gray-900/30 border border-yellow-400/10">
          <p className="text-yellow-200/80">
            Destiny Number details not available. Please generate the report to view education guidance.
          </p>
        </Card>
      )}
    </div>
  );
}
