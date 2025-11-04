// src/pages/app/tabs/ForecastTab.tsx
import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { DATA } from "@/lib/numerology";
import { getText } from "@/lib/numerology/utils";
import { useReport } from "@/context/ReportContext";

/* ------------------------------------------------------------------ */
/* Utilities                                                           */
/* ------------------------------------------------------------------ */

// Accepts Date | "DD/MM/YYYY" | "DD-MM-YYYY" | "YYYY-MM-DD"
const parseDobToDate = (dob: unknown): Date | null => {
  if (!dob) return null;
  if (dob instanceof Date) return isNaN(dob.getTime()) ? null : dob;

  if (typeof dob === "string") {
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) {
      const [dd, mm, yyyy] = dob.split("/");
      const d = new Date(+yyyy, +mm - 1, +dd);
      return isNaN(d.getTime()) ? null : d;
    }
    if (/^\d{2}-\d{2}-\d{4}$/.test(dob)) {
      const [dd, mm, yyyy] = dob.split("-");
      const d = new Date(+yyyy, +mm - 1, +dd);
      return isNaN(d.getTime()) ? null : d;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      const [yyyy, mm, dd] = dob.split("-");
      const d = new Date(+yyyy, +mm - 1, +dd);
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(dob);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const endOfDay   = (d: Date) => { const x = new Date(d); x.setHours(23,59,59,999); return x; };
const addDays    = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
const addYears   = (d: Date, n: number) => { const x = new Date(d); x.setFullYear(x.getFullYear()+n); return x; };
const nextNumber = (n: number) => (n === 9 ? 1 : n + 1);

type DOBParts = { dd: string; mm: string; yyyy: string };
function parseDOB(d?: string | null): DOBParts | null {
  if (!d) return null;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) { const [dd, mm, yyyy] = d.split("/"); return { dd, mm, yyyy }; }
  if (/^\d{2}-\d{2}-\d{4}$/.test(d))   { const [dd, mm, yyyy] = d.split("-"); return { dd, mm, yyyy }; }
  if (/^\d{4}-\d{2}-\d{2}$/.test(d))   { const [yyyy, mm, dd] = d.split("-"); return { dd, mm, yyyy }; }
  return null;
}
function reduceToSingleDigit(n: number | string): number {
  let x = typeof n === "number" ? Math.abs(n) : String(n).split("").reduce((a, d) => a + Number(d), 0);
  while (x > 9) x = String(x).split("").reduce((a, d) => a + Number(d), 0);
  return x;
}
function weekdayNumber(d: Date): number { const map = [1,2,9,5,3,6,8]; return map[d.getDay()]; }

function kundliCountsFromDOBStr(dob: string): Record<number, number> {
  const out: Record<number, number> = Object.fromEntries(Array.from({ length: 9 }, (_, i) => [i + 1, 0]));
  const p = parseDOB(dob); if (!p) return out;
  const yy2 = p.yyyy.slice(-2);
  const raw = (p.dd + p.mm + yy2).replace(/0/g, "");
  for (const ch of raw) { const n = Number(ch); if (n >= 1 && n <= 9) out[n] = (out[n] ?? 0) + 1; }
  return out;
}
function basicDestinyFromDOBStr(dob: string) {
  const p = parseDOB(dob); if (!p) return { basic: 0, destiny: 0 };
  const basic = reduceToSingleDigit(Number(p.dd));
  const destiny = reduceToSingleDigit((p.dd + p.mm + p.yyyy).split("").reduce((a, x) => a + Number(x), 0));
  return { basic, destiny };
}

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type DashaSpan = { startDate: Date; endDate: Date; dashaNumber: number; label?: string; year?: number };
type DashaReport = {
  mahaDashaTimeline: DashaSpan[];
  yearlyDashaTimeline: DashaSpan[];
  monthlyDashaTimeline?: DashaSpan[];
  dailyDashaTimeline?: DashaSpan[];
};

type Report = {
  dob: string | Date;
  basicNumber: number;
  destinyNumber: number;
  baseKundliGrid: Record<number, number>;
  recurringNumbersAnalysis?: any[];
  yogas?: any[];
  specialInsights?: any[];
};

type Props = {
  report: Report | null;
  dashaReport: DashaReport | null;
  gender: "Male" | "Female" | string;
  dobStr?: string;
  language?: string;
};

/* ------------------------------------------------------------------ */
/* Timelines (aligned with Advanced Dasha)                            */
/* ------------------------------------------------------------------ */

function buildMahaTimeline(dob: string, horizonYears = 120): DashaSpan[] {
  const p = parseDOB(dob); if (!p) return [];
  const birth = startOfDay(new Date(+p.yyyy, +p.mm - 1, +p.dd));
  const { basic } = basicDestinyFromDOBStr(dob);
  const out: DashaSpan[] = [];
  let num = basic;
  let cursor = birth;
  const endH = addYears(birth, horizonYears);
  while (cursor < endH) {
    const start = cursor;
    const end = endOfDay(addDays(addYears(start, num), -1));
    out.push({ dashaNumber: num, startDate: start, endDate: end });
    cursor = addYears(start, num);
    num = nextNumber(num);
  }
  return out;
}
function buildYearlyTimeline(dob: string, fromYear: number, toYear: number): DashaSpan[] {
  const p = parseDOB(dob); if (!p) return [];
  const B = reduceToSingleDigit(+p.dd); const M = +p.mm;
  const out: DashaSpan[] = [];
  for (let y = fromYear; y <= toYear; y++) {
    const start = startOfDay(new Date(y, M - 1, +p.dd));
    const end = endOfDay(addDays(new Date(y + 1, M - 1, +p.dd), -1));
    const Y = +String(y).slice(-2);
    const D = weekdayNumber(start);
    const dasha = reduceToSingleDigit(B + M + Y + D);
    out.push({ dashaNumber: dasha, startDate: start, endDate: end, year: y });
  }
  return out;
}

/* Fallbacks if parent didn’t compute report/dashas */
function buildReportFallback(dobStr: string): Report {
  const { basic, destiny } = basicDestinyFromDOBStr(dobStr);
  const grid = kundliCountsFromDOBStr(dobStr);
  const p = parseDOB(dobStr)!;
  const dob = new Date(+p.yyyy, +p.mm - 1, +p.dd);
  return { dob, basicNumber: basic, destinyNumber: destiny, baseKundliGrid: grid };
}
function buildDashaReportFallback(dobStr: string): DashaReport {
  const p = parseDOB(dobStr)!;
  const fromY = +p.yyyy;
  return {
    mahaDashaTimeline: buildMahaTimeline(dobStr, 120),
    yearlyDashaTimeline: buildYearlyTimeline(dobStr, fromY, fromY + 120),
  };
}

/* ------------------------------------------------------------------ */
/* UI bits                                                            */
/* ------------------------------------------------------------------ */

const SectionTitle: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <h3 className={`font-semibold text-lg md:text-xl text-yellow-300 mb-2 ${className || ""}`}>{children}</h3>
);

const StatusIcon = ({ status }: { status: "Green" | "Yellow" | "Red" | string }) => {
  if (status === "Green") return <span className="text-green-500 text-2xl mr-3" title="Favorable">🟢</span>;
  if (status === "Yellow") return <span className="text-yellow-500 text-2xl mr-3" title="Mixed Signals">🟡</span>;
  if (status === "Red") return <span className="text-red-500 text-2xl mr-3" title="High Caution">🔴</span>;
  return null;
};

const InsightCard = ({ title, items, status, icon }: { title: string; items: string[]; status: "Green"|"Yellow"|"Red"; icon: string }) => {
  if (!items || items.length === 0) return null;
  const colorClass = status === "Green" ? "border-green-500/50" : status === "Red" ? "border-red-500/50" : "border-yellow-500/50";
  return (
    <div>
      <h4 className="font-semibold text-lg text-yellow-300 mb-2">{icon} {title}</h4>
      <ul className={`list-disc list-inside space-y-2 pl-4 border-l-4 ${colorClass}`}>
        {items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    </div>
  );
};
const countInGrid = (grid: Record<number, number>, num: number) => grid?.[num] ?? 0;

/* ---- TEMP fallback until the real NLG component is wired ---- */
function NlgChildBirthForecast({ analysis }: { analysis: any }) {
  if (!analysis) return null;
  return (
    <div>
      {analysis.text && <p className="mb-2">{analysis.text}</p>}
      {Array.isArray(analysis.highlights) && analysis.highlights.length > 0 && (
        <ul className="list-disc list-inside space-y-1 text-sm text-yellow-200/80">
          {analysis.highlights.map((h: string, i: number) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main container                                                     */
/* ------------------------------------------------------------------ */

const ForecastTab: React.FC<Props> = ({ report, dashaReport, gender, dobStr, language = "en" }) => {
  const safeReport = useMemo(() => {
    if (report) return report;
    if (dobStr) return buildReportFallback(dobStr);
    return null;
  }, [report, dobStr]);

  const safeDashaReport = useMemo(() => {
    if (dashaReport) return dashaReport;
    if (dobStr) return buildDashaReportFallback(dobStr);
    return null;
  }, [dashaReport, dobStr]);

  if (!safeReport) return null;

  const [forecastYear, setForecastYear] = useState<number>(new Date().getFullYear());
  const dobNormalized = safeReport.dob instanceof Date ? safeReport.dob : parseDobToDate(safeReport.dob);
  const dob = dobNormalized ?? new Date(1990, 0, 1);
  const targetDate = new Date(forecastYear, dob.getMonth(), dob.getDate());
  const endDate = addDays(addYears(targetDate, 1), -1);

  const [activeSubTab, setActiveSubTab] = useState<"Profession" | "Travel" | "Property" | "Marriage" | "Child Birth">("Profession");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 mb-2 border-b border-gray-700">
        {(["Profession", "Travel", "Property", "Marriage", "Child Birth"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`py-2 px-4 font-semibold transition-colors duration-200 ${
              activeSubTab === tab ? "text-yellow-400 border-b-2 border-yellow-400" : "text-yellow-200/70 hover:text-yellow-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="forecast-year" className="block text-sm font-medium text-yellow-500 mb-1">
              Select Forecast Year
            </label>
            <input
              type="number"
              id="forecast-year"
              value={forecastYear}
              onChange={(e) => setForecastYear(parseInt(e.target.value, 10) || new Date().getFullYear())}
              className="bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 w-32"
            />
          </div>
          <div className="bg-gray-900/50 p-2 rounded-md text-center">
            <p className="text-sm text-yellow-200/80">Showing Forecast For:</p>
            <p className="font-bold text-yellow-400">
              {formatDate(targetDate)} to {formatDate(endDate)}
            </p>
          </div>
        </div>
      </Card>

      {activeSubTab === "Profession" && (
        <ProfessionForecastTab report={safeReport} dashaReport={safeDashaReport} gender={gender} targetDate={targetDate} language={language} />
      )}
      {activeSubTab === "Travel" && (
        <TravelForecastTab report={safeReport} dashaReport={safeDashaReport} targetDate={targetDate} language={language} />
      )}
      {activeSubTab === "Property" && (
        <PropertyForecastTab report={safeReport} dashaReport={safeDashaReport} targetDate={targetDate} language={language} />
      )}
      {activeSubTab === "Marriage" && (
        <MarriageForecastTab report={safeReport} dashaReport={safeDashaReport} targetDate={targetDate} language={language} />
      )}
      {activeSubTab === "Child Birth" && (
        <ChildBirthForecastTab report={safeReport} dashaReport={safeDashaReport} gender={gender} targetDate={targetDate} language={language} />
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Profession                                                         */
/* ------------------------------------------------------------------ */

const ProfessionForecastTab: React.FC<{
  report: Report;
  dashaReport: DashaReport | null;
  gender: string;
  targetDate: Date;
  language?: string;
}> = ({ report, dashaReport, gender, targetDate }) => {
  if (!report || !dashaReport) return null;

  const professionAnalysis = useMemo(() => {
    const yearlyDasha = dashaReport.yearlyDashaTimeline?.find(d => targetDate >= d.startDate && targetDate <= d.endDate);
    const mahaDasha = dashaReport.mahaDashaTimeline?.find(d => targetDate >= d.startDate && targetDate <= d.endDate);

    if (!yearlyDasha || !mahaDasha) {
      return {
        outlook: { title: "N/A", text: "Forecast not available for this date.", status: "Yellow" as const },
        opportunities: [] as string[],
        challenges: [] as string[],
        advice: [] as string[],
        partnership: [] as {status:"Green"|"Yellow"|"Red"; text:string}[],
        milestones: [] as number[]
      };
    }

    const { destinyNumber, baseKundliGrid } = report;
    const annualDashaNumber = yearlyDasha.dashaNumber;
    const mahaDashaNumber = mahaDasha.dashaNumber;

    const outlook: { title: string; text: string; status: "Green"|"Yellow"|"Red" } = { title: "", text: "", status: "Yellow" };
    const opportunities: string[] = [];
    const challenges: string[] = [];
    const advice: string[] = [];
    const partnership: {status:"Green"|"Yellow"|"Red"; text:string}[] = [];
    let isMahaDashaDominant = false;

    const c = (n: number) => countInGrid(baseKundliGrid, n);

    if (mahaDashaNumber === 1) {
      const positive = (c(1) <= 1 || destinyNumber === 1);
      if (positive) {
        outlook.status = "Green";
        outlook.title = "Long-Term Favorable Period (Maha Dasha of 1)";
        outlook.text  = "Major life period supports leadership and career growth; Annual Dasha adds nuances.";
        isMahaDashaDominant = true;
      }
    }

    if (!isMahaDashaDominant) {
      switch (annualDashaNumber) {
        case 1: {
          outlook.title = "Influenced by Number 1 – The Leader’s Code";
          const positive = (c(1) <= 1 || destinyNumber === 1);
          if (positive) {
            outlook.status = "Green";
            outlook.text = "Confidence, promotions, leadership roles; wealth via authority.";
          } else {
            outlook.status = "Red";
            outlook.text = "Watch ego clashes, impulsive moves, and rejections in high-stake opportunities.";
          }
          break;
        }
        case 2:
          outlook.title = "Influenced by Number 2 – Emotional Mirror";
          outlook.status = "Red";
          outlook.text = "Heightened sensitivity; postpone big career decisions. Keep clarity.";
          advice.push("Avoid emotionally driven job switches or investments this year.");
          break;
        case 3:
          outlook.title = "Influenced by Number 3 – The Guru’s Blueprint";
          if (c(3) <= 1) {
            outlook.status = "Green";
            outlook.text = "Respect, name, and growth — especially for teaching/consultation fields.";
          } else if (c(3) === 2) {
            outlook.status = "Yellow";
            outlook.text = "Career grows but domestic frictions may rise; balance home/work.";
          } else {
            outlook.status = "Red";
            outlook.text = "Over-Jupiter → scattered focus, arrogance; stalled growth.";
          }
          break;
        case 4:
          outlook.title = "Influenced by Number 4 – The Unpredictable Disruptor";
          if (destinyNumber === 4) {
            outlook.status = "Yellow";
            outlook.text = "Could become a catalyst for structured growth; be meticulous.";
          } else {
            outlook.status = "Red";
            outlook.text = "Risk of losses, deception, or documentation issues. Triple-check contracts.";
            advice.push("Extreme diligence on contracts, written terms, and compliance.");
          }
          break;
        case 5: {
          outlook.title = "Influenced by Number 5 – Transformer’s Gateway";
          const n5 = c(5);
          if (n5 === 0 || destinyNumber === 5) {
            outlook.status = "Green";
            outlook.text = "Breakthrough offers, cashflow boosts, favorable switches.";
          } else if (n5 === 1) {
            outlook.status = "Green";
            outlook.text = "Excellent for finance/analytics; leverage your precision.";
          } else {
            outlook.status = "Red";
            outlook.text = "Over-activation → anxiety, scattered goals, poor decisions.";
          }
          const masculine = c(1) + c(3) + c(9);
          const feminine  = c(2) + c(6) + c(8);
          if (feminine > masculine) {
            partnership.push({ status: "Red", text: "Risk of being misled in contractual/financial matters." });
          } else {
            partnership.push({ status: "Yellow", text: "Temptation to cut corners or mislead for gains — avoid." });
          }
          break;
        }
        case 6:
          outlook.title = "Influenced by Number 6 – The Magnet of Luxury";
          if (c(6) === 0 || destinyNumber === 6) {
            outlook.status = "Green";
            outlook.text = "Great for branding, partnerships, luxury industries, hospitality.";
          } else {
            outlook.status = "Red";
            outlook.text = "Beware overindulgence, vanity, and romance-work entanglements.";
          }
          break;
        case 7:
          outlook.title = "Influenced by Number 7 – The Spiritual Teacher";
          if (c(7) >= 3 && destinyNumber !== 7) {
            outlook.status = "Red";
            outlook.text = "Possible job loss/transfers/confusion; karmic tests of detachment.";
          } else {
            outlook.status = "Green";
            outlook.text = "Grace/network support for roles in tech, research, healing, teaching.";
          }
          break;
        case 8: {
          outlook.title = "Influenced by Number 8 – The Karma Financier";
          let effective8 = c(8);
          if (mahaDashaNumber === 8) effective8++;
          if (annualDashaNumber === 8) effective8++;
          if (effective8 > 0 && effective8 % 2 === 0) {
            outlook.status = "Green";
            outlook.text = "Bonuses, recovery of stuck money, legal wins, authority & power.";
            if (destinyNumber === 8) {
              opportunities.push("With Destiny 8, magnetize wealth within large/legacy systems.");
            }
            advice.push("Even 8s favor trading/speculation with discipline.");
          } else {
            outlook.status = "Red";
            outlook.text = "Unpredictable losses/delays; avoid leverage without buffers.";
          }
          break;
        }
        case 9:
          outlook.title = "Influenced by Number 9 – The Commander";
          if (destinyNumber === 9) {
            outlook.status = "Green";
            outlook.text = "Power and elevation through courageous leadership; land/property gains possible.";
          } else if (c(9) === 1) {
            outlook.status = "Yellow";
            outlook.text = "Largely neutral on finances.";
          } else {
            outlook.status = "Red";
            outlook.text = "Beware clashes with superiors, public image issues, hidden enemies.";
          }
          break;
        default:
          outlook.text = "No specific professional forecast for this Dasha period.";
      }
    } else {
      if (annualDashaNumber === 4) challenges.push("Annual 4: expect paperwork delays; stay hyper-organized.");
      if (annualDashaNumber === 2) challenges.push("Annual 2: keep emotions out of key job moves.");
    }

    const currentYear = new Date().getFullYear();
    const milestoneYears =
      dashaReport.yearlyDashaTimeline
        .filter(d => (d.year ?? d.startDate.getFullYear()) >= currentYear)
        .filter(d => [1,3,5,6].includes(d.dashaNumber))
        .slice(0, 10)
        .map(d => d.year ?? d.startDate.getFullYear());

    return { outlook, opportunities, challenges, advice, partnership, milestones: milestoneYears };
  }, [report, dashaReport, gender, targetDate]);

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <SectionTitle>Professional Forecast</SectionTitle>
        <div className="p-4 bg-gray-900/50 rounded-lg space-y-6">
          <div>
            <h3 className="font-bold text-xl text-yellow-400 mb-2">{professionAnalysis.outlook.title}</h3>
            <div className="flex items-start">
              <StatusIcon status={professionAnalysis.outlook.status} />
              <p>{professionAnalysis.outlook.text}</p>
            </div>
          </div>
          <InsightCard title="Key Opportunities" items={professionAnalysis.opportunities} status="Green" icon="✅" />
          <InsightCard title="Potential Challenges" items={professionAnalysis.challenges} status="Red" icon="❌" />
          <InsightCard title="Strategic Advice" items={professionAnalysis.advice} status="Yellow" icon="💡" />
        </div>
      </Card>

      <Card className="p-4">
        <SectionTitle>Partnership & Risk Analysis</SectionTitle>
        {professionAnalysis.partnership.length > 0 ? (
          professionAnalysis.partnership.map((item, i) => (
            <div key={i} className="flex items-start p-3 mb-2 bg-gray-900/50 rounded-md">
              <StatusIcon status={item.status} />
              <p>{item.text}</p>
            </div>
          ))
        ) : (
          <p>No specific partnership risks detected for this period.</p>
        )}
      </Card>

      <Card className="p-4">
        <SectionTitle>Potential Career Milestone Years</SectionTitle>
        <p className="text-sm text-gray-400 mb-4">High-probability job/career changes by favorable Annual Dashas.</p>
        <div className="flex flex-wrap gap-3">
          {professionAnalysis.milestones.length > 0 ? (
            professionAnalysis.milestones.map(year => (
              <div key={year} className="bg-green-500/20 text-green-300 font-bold py-2 px-4 rounded-full">
                {year}
              </div>
            ))
          ) : (
            <span className="text-yellow-300/80">No immediate milestone years detected.</span>
          )}
        </div>
      </Card>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Travel                                                             */
/* ------------------------------------------------------------------ */

const TravelForecastTab: React.FC<{
  report: Report;
  dashaReport: DashaReport | null;
  targetDate: Date;
  language?: string;
}> = ({ report, dashaReport, targetDate }) => {
  if (!report || !dashaReport) return null;

  const travelAnalysis = useMemo(() => {
    const annualDasha = dashaReport.yearlyDashaTimeline.find(d => targetDate >= d.startDate && targetDate <= d.endDate);
    const mahaDasha   = dashaReport.mahaDashaTimeline.find(d => targetDate >= d.startDate && targetDate <= d.endDate);

    if (!annualDasha || !mahaDasha) {
      return {
        outlook: { title: "N/A", text: "Forecast not available for this date.", status: "Yellow" as const },
        opportunities: [] as string[], challenges: [] as string[], advice: [] as string[], warnings: [] as string[],
        score: "Low" as "Low"|"Moderate"|"High", visaEase: "Moderate" as "Easy"|"Moderate"|"Difficult", countryType: "N/A"
      };
    }

    const { baseKundliGrid, basicNumber, destinyNumber } = report;
    const has7 = (baseKundliGrid[7] ?? 0) > 0 || basicNumber === 7 || destinyNumber === 7;
    const has4 = (baseKundliGrid[4] ?? 0) > 0 || basicNumber === 4 || destinyNumber === 4;

    const total7s = (baseKundliGrid[7] ?? 0) + (mahaDasha.dashaNumber === 7 ? 1 : 0) + (annualDasha.dashaNumber === 7 ? 1 : 0);

    const outlook: { title: string; text: string; status: "Green"|"Yellow"|"Red" } = { title: "", text: "", status: "Yellow" };
    const opportunities: string[] = [];
    const challenges: string[] = [];
    const advice: string[] = [];
    const warnings: string[] = [];
    let score: "Low" | "Moderate" | "High" = "Low";
    let visaEase: "Easy" | "Moderate" | "Difficult" = "Moderate";
    let countryType = "N/A";

    if (total7s >= 4) {
      warnings.push("7777 pattern: involuntary, chronic travel without stability → mental exhaustion.");
    } else if (total7s === 3) {
      warnings.push("777 pattern: unstable or forced travel; anxiety and lack of peace likely.");
    }

    if (has4 && has7) {
      outlook.title = "Combined 4 & 7 Influence";
      if ([3,5,6].includes(annualDasha.dashaNumber)) {
        outlook.status = "Green"; score = "High"; visaEase = "Easy"; countryType = "Developed";
        outlook.text = "Favorable Annual Dasha balances 4–7 conflict — travel outcome likely positive.";
        if (annualDasha.dashaNumber === 3) opportunities.push("Education/professional growth travel highlighted.");
        if (annualDasha.dashaNumber === 5) opportunities.push("Tourism/exploration travel favored.");
        if (annualDasha.dashaNumber === 6) opportunities.push("Luxury/high-end destinations supported.");
      } else {
        outlook.status = "Red"; score = "Low"; visaEase = "Difficult"; countryType = "Developing";
        outlook.text = "Negative Annual Dasha amplifies 4–7 conflict — documentation hurdles/tension.";
      }
    } else if (has7) {
      outlook.title = "Number 7 – The Global Voyager";
      outlook.status = "Green"; score = "High"; visaEase = "Easy"; countryType = "Developed";
      outlook.text = "Strong potential for fruitful travel/relocation to developed nations.";
      opportunities.push("Work visas/PR/citizenship chances rise during favorable dashas.");
      if (annualDasha.dashaNumber === 3) opportunities.push("Education/professional expansion travel.");
      if (annualDasha.dashaNumber === 5) opportunities.push("Tourism-led journeys.");
      if (annualDasha.dashaNumber === 6) opportunities.push("Luxury travel.");
      if (annualDasha.dashaNumber === 7) opportunities.push("Year powerfully activates inherent travel karma.");
      if (annualDasha.dashaNumber === 2) { challenges.push("Delays/postponements common."); visaEase = "Difficult"; }
      if (annualDasha.dashaNumber === 4) { challenges.push("Documentation/legal formalities slow things down."); visaEase = "Difficult"; }
    } else if (has4) {
      outlook.title = "Number 4 – The Karmic Relocator";
      outlook.status = "Yellow"; score = "Low"; countryType = "Developing/Underdeveloped";
      outlook.text = "Relocation driven by push factors; more friction with approvals and costs.";
      challenges.push("Middle East / developing destinations more likely.", "Expect visa scrutiny, documentation checks, extra expenses.");
      advice.push("For developed nations, leverage marriage/relationship routes or higher investment/effort.");
      if ([5,6,7].includes(annualDasha.dashaNumber)) {
        outlook.status = "Green"; score = "Moderate";
        outlook.text += " Favorable Annual Dasha improves odds.";
      }
      if ((baseKundliGrid[4] ?? 0) >= 2) warnings.push("Double 4 (44) helps neutralize some single-4 negatives.");
    } else {
      outlook.title = "Dasha-Driven Travel Potential";
      if (mahaDasha.dashaNumber === 7) {
        outlook.status = "Yellow"; score = "Moderate";
        outlook.text = "Maha 7 gives moderate travel opportunity even without 7 in base.";
        if ([5,6,7].includes(annualDasha.dashaNumber)) { outlook.status = "Green"; score = "High"; outlook.text += " Favorable Annual Dasha further enhances."; }
        else if ([2,4].includes(annualDasha.dashaNumber)) { outlook.status = "Red"; score = "Low"; outlook.text += " Annual Dasha warns of obstacles."; }
      } else {
        outlook.text = "No strong innate indicators for foreign travel; depends on specific dashas.";
      }
    }

    return { outlook, opportunities, challenges, advice, warnings, score, visaEase, countryType };
  }, [report, dashaReport, targetDate]);

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <SectionTitle>Travel & Relocation Forecast</SectionTitle>
        <div className="bg-gray-900/50 p-4 rounded-lg">
          <h3 className="font-bold text-xl text-yellow-400 mb-2">{travelAnalysis.outlook.title}</h3>
          <div className="flex items-start mb-6">
            <StatusIcon status={travelAnalysis.outlook.status} />
            <p>{travelAnalysis.outlook.text}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6 text-center text-sm">
            <div className="bg-gray-800 p-2 rounded-md">
              <p className="text-gray-400">Travel Score</p>
              <p className="font-bold text-xl">{travelAnalysis.score}</p>
            </div>
            <div className="bg-gray-800 p-2 rounded-md">
              <p className="text-gray-400">Visa Ease</p>
              <p className="font-bold text-xl">{travelAnalysis.visaEase}</p>
            </div>
            <div className="bg-gray-800 p-2 rounded-md">
              <p className="text-gray-400">Destination Type</p>
              <p className="font-bold text-xl">{travelAnalysis.countryType}</p>
            </div>
          </div>

          <div className="space-y-6">
            <InsightCard title="Key Opportunities" items={travelAnalysis.opportunities} status="Green" icon="✅" />
            <InsightCard title="Potential Challenges" items={travelAnalysis.challenges} status="Red" icon="❌" />
            <InsightCard title="Strategic Advice" items={travelAnalysis.advice} status="Yellow" icon="💡" />
          </div>

          {travelAnalysis.warnings.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-lg text-red-400 mb-2">⚠️ Warnings</h4>
              <ul className="list-disc list-inside space-y-2 pl-4 border-l-4 border-red-500/50">
                {travelAnalysis.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Property                                                           */
/* ------------------------------------------------------------------ */

const PropertyForecastTab: React.FC<{
  report: Report;
  dashaReport: DashaReport | null;
  targetDate: Date;
  language?: string;
}> = ({ report, dashaReport, targetDate }) => {
  if (!report || !dashaReport) return null;

  const propertyAnalysis = useMemo(() => {
    const annual = dashaReport.yearlyDashaTimeline.find(d => targetDate >= d.startDate && targetDate <= d.endDate);
    const maha   = dashaReport.mahaDashaTimeline.find(d => targetDate >= d.startDate && targetDate <= d.endDate);
    if (!annual || !maha) return { opportunities: [] as {type:string; text:string}[], warnings: [] as string[], specialInsights: [] as {title:string; text:string; status:"Green"|"Yellow"|"Red"}[] };

    const { baseKundliGrid, destinyNumber } = report;
    const c1 = baseKundliGrid[1] ?? 0;
    const c8 = baseKundliGrid[8] ?? 0;

    const opportunities: {type:string; text:string}[] = [];
    const warnings: string[] = [];
    const specialInsights: {title: string; text: string; status: "Green"|"Yellow"|"Red"}[] = [];

    if (annual.dashaNumber === 1 || maha.dashaNumber === 1) {
      if (c1 === 1) {
        specialInsights.push({ title: "Number 1 — Single ‘1’", text: "Favorable for property purchase (better to buy than sell).", status: "Green" });
      } else if (c1 > 1 && destinyNumber === 1) {
        specialInsights.push({ title: "Number 1 — Multiple ‘1’ with Destiny 1", text: "Very favorable for real-estate business & consistent profits.", status: "Green" });
      } else if (c1 > 1 && destinyNumber !== 1) {
        warnings.push("Multiple 1s without Destiny 1: avoid risky projects; prefer ready-to-move with crystal-clear titles.");
      } else if (c1 === 0) {
        specialInsights.push({ title: "Number 1 — Missing ‘1’", text: "You may still buy/renovate a home, but don’t treat real estate as a business.", status: "Yellow" });
      }
    }

    const mahaIs8 = maha.dashaNumber === 8;
    let effective8 = c8;
    if (mahaIs8 || annual.dashaNumber === 8) effective8++;
    const even8 = effective8 > 0 && effective8 % 2 === 0;

    if (mahaIs8 && even8) {
      specialInsights.push({
        title: "Even ‘8’ activated by Dasha",
        text: "Bulk gains, recovery of disputed/ancestral property, legal wins. Great for buying land/long-term assets.",
        status: "Green"
      });
      switch (annual.dashaNumber) {
        case 1:
          if (c1 === 1 || (c1 > 1 && destinyNumber === 1) || c1 === 0)
            opportunities.push({ type: "Property", text: "Highly auspicious for acquisitions, title finalization, or entering the real-estate business." });
          break;
        case 3:
          opportunities.push({ type: "Expansion", text: "Second home, bigger place, or long-term investment favored; family harmony rises." });
          break;
        case 5:
          opportunities.push({ type: "Cash Flow", text: "Liquidity/bonus/inheritance helps down payments or clears loans." });
          break;
        case 6:
          opportunities.push({ type: "Luxury & Vehicle", text: "Vehicle/home upgrade, premium assets & renovations favored." });
          break;
        case 4:
          warnings.push("Annual 4: opportunities may hide legal/structural issues; proceed with strong diligence.");
          break;
      }
    } else if (mahaIs8 && !even8) {
      warnings.push("Unstable ‘8’ period — avoid major property/asset moves. Re-evaluate after this dasha.");
    }

    const isPositive6 = (c6: number, d6: number) => (c6 === 0 || (c6 > 0 && d6 === 6));
    if (annual.dashaNumber === 6 && isPositive6(baseKundliGrid[6] ?? 0, destinyNumber) && !mahaIs8) {
      opportunities.push({ type: "Luxury Purchase", text: "Annual 6 supports vehicle upgrades, branded gadgets, premium home enhancements." });
    }

    return { opportunities, warnings, specialInsights };
  }, [report, dashaReport, targetDate]);

  const InsightBlock = ({ title, text, status }: { title: string; text: string; status: "Green"|"Yellow"|"Red" }) => {
    const colorClass =
      status === "Green" ? "border-green-500 bg-green-900/20 text-green-300" :
      status === "Yellow" ? "border-yellow-500 bg-yellow-900/20 text-yellow-300" :
      "border-red-500 bg-red-900/20 text-red-300";
    return (
      <div className={`p-4 rounded-lg border-l-4 ${colorClass}`}>
        <h4 className="font-bold text-lg mb-1">{title}</h4>
        <p className="text-gray-300">{text}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <SectionTitle>Property & Asset Forecast</SectionTitle>
        <div className="space-y-4">
          {propertyAnalysis.warnings.length > 0 && (
            <div className="p-4 bg-red-900/50 rounded-lg">
              <h3 className="font-bold text-xl text-red-400 mb-2">⚠️ High Caution Period</h3>
              <ul className="list-disc list-inside text-red-300 space-y-2">
                {propertyAnalysis.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}
          {propertyAnalysis.specialInsights.map((ins, i) => (
            <InsightBlock key={i} title={ins.title} text={ins.text} status={ins.status} />
          ))}
          {propertyAnalysis.opportunities.length > 0 ? (
            <div className="p-4 bg-green-900/50 rounded-lg">
              <h3 className="font-bold text-xl text-green-400 mb-2">✅ Favorable Period for Assets</h3>
              <ul className="list-disc list-inside text-green-300 space-y-2">
                {propertyAnalysis.opportunities.map((opp, i) => <li key={i}><strong>{opp.type}:</strong> {opp.text}</li>)}
              </ul>
            </div>
          ) : (
            propertyAnalysis.warnings.length === 0 && propertyAnalysis.specialInsights.length === 0 && (
              <p className="text-center text-yellow-200/80 p-4">No specific asset triggers in this Dasha window.</p>
            )
          )}
        </div>
      </Card>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Marriage                                                           */
/* ------------------------------------------------------------------ */

const MarriageForecastTab: React.FC<{
  report: Report;
  dashaReport: DashaReport | null;
  targetDate: Date;
  language?: string;
}> = ({ report, dashaReport, targetDate, language = "en" }) => {
  if (!report || !dashaReport) return null;

  // Defensive: convert any multilingual object or non-string into a string safely
  const toDisplayText = (v: any): string => {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    try {
      return getText(v, language as any) ?? String(v);
    } catch {
      return String(v);
    }
  };

  const SafeText: React.FC<{ value: any; className?: string }> = ({ value, className }) => (
    <span className={className}>{toDisplayText(value)}</span>
  );

  const marriageAnalysis = useMemo(() => {
    const yearly = dashaReport.yearlyDashaTimeline.find(
      d => targetDate >= d.startDate && targetDate <= d.endDate
    );
    const maha   = dashaReport.mahaDashaTimeline.find(
      d => targetDate >= d.startDate && targetDate <= d.endDate
    );
    if (!yearly || !maha) {
      return {
        mahaDashaInsights: [] as { text: string; status: "Green" | "Yellow" | "Red" }[],
        annualDashaInsights: [] as { text: string; status: "Green" | "Yellow" | "Red" }[],
      };
    }

    const { destinyNumber, baseKundliGrid } = report;
    const annual = yearly.dashaNumber;
    const mahaN  = maha.dashaNumber;
    const c = (n:number) => baseKundliGrid?.[n] ?? 0;

    const mahaDashaInsights: { text: string; status: "Green" | "Yellow" | "Red" }[] = [];
    const annualDashaInsights: { text: string; status: "Green" | "Yellow" | "Red" }[] = [];

    // Maha dasha rules
    switch (mahaN) {
      case 3:
        mahaDashaInsights.push({
          text: "Expansive & positive for relationships; supports marriage/family growth.",
          status: "Green",
        });
        break;
      case 6:
        if (destinyNumber === 6 || c(6) === 0) {
          mahaDashaInsights.push({
            text: "Harmonious, luxurious time for love; strong marriage vibe.",
            status: "Green",
          });
        }
        break;
      case 7:
        if (destinyNumber === 7 || c(7) === 0) {
          mahaDashaInsights.push({
            text: "Spiritual bonding and deeper understanding.",
            status: "Green",
          });
        }
        break;
      case 8:
        if (((c(8) + 1) % 2) === 0) {
          mahaDashaInsights.push({
            text: "Even-8 effect favors reconciliation/new stable bonds.",
            status: "Green",
          });
        }
        break;
      default:
        break;
    }

    // Annual dasha rules
    switch (annual) {
      case 2:
        annualDashaInsights.push({
          text: "Heightened emotions; may signal entry of a new person.",
          status: "Yellow",
        });
        break;
      case 3:
        annualDashaInsights.push({
          text: "Highly favorable for marriage/childbirth.",
          status: "Green",
        });
        break;
      case 6:
        if (destinyNumber === 6 || c(6) === 0) {
          annualDashaInsights.push({
            text: "Excellent, harmonious year for relationships.",
            status: "Green",
          });
        }
        break;
      case 7:
        if (c(7) <= 1 || destinyNumber === 7) {
          annualDashaInsights.push({
            text: "Positive, peaceful, spiritually attuned time.",
            status: "Green",
          });
        }
        break;
      case 8:
        if (((c(8) + 1) % 2) === 0) {
          annualDashaInsights.push({
            text: "Good for reconciliation/healing & new romantic chances.",
            status: "Green",
          });
        }
        break;
      default:
        break;
    }

    return { mahaDashaInsights, annualDashaInsights };
  }, [report, dashaReport, targetDate, language]);

  // Year-wise probability view (Age 20–40)
  const marriageProbabilityChart = useMemo(() => {
    const startAge = 20;
    const endAge = 40;
    const birth = report.dob instanceof Date ? report.dob : new Date(report.dob);
    const birthYear = isNaN(birth.getTime()) ? NaN : birth.getFullYear();
    if (Number.isNaN(birthYear)) return [];

    const out: { age: number; year: number; probability: "High"|"Moderate"|"Neutral"; status: "Green"|"Yellow"|"Red" }[] = [];

    for (let age = startAge; age <= endAge; age++) {
      const y = birthYear + age;
      const dY = dashaReport?.yearlyDashaTimeline.find(d => (d.year ?? d.startDate.getFullYear()) === y);
      if (!dY) continue;

      const dNum = dY.dashaNumber;
      const c = (n:number) => report.baseKundliGrid?.[n] ?? 0;

      let probability: "High"|"Moderate"|"Neutral" = "Neutral";
      let status: "Green"|"Yellow"|"Red" = "Yellow";

      switch (dNum) {
        case 3:
          probability = "High"; status = "Green"; break;
        case 6:
          if (report.destinyNumber === 6 || c(6) === 0) { probability = "High"; status = "Green"; }
          break;
        case 7:
          if (c(7) <= 1 || report.destinyNumber === 7) { probability = "High"; status = "Green"; }
          break;
        case 8:
          if (((c(8) + 1) % 2) === 0) { probability = "High"; status = "Green"; }
          break;
        case 2:
          probability = "Moderate"; status = "Yellow"; break;
        default:
          break;
      }

      out.push({ age, year: y, probability, status });
    }
    return out;
  }, [report, dashaReport]);

  const badge = (status: "Green"|"Yellow"|"Red") =>
    status === "Green" ? "bg-green-500/20 text-green-300" :
    status === "Red"   ? "bg-red-500/20 text-red-300" :
                         "bg-yellow-500/20 text-yellow-300";

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <SectionTitle>Marriage Forecast</SectionTitle>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-lg text-yellow-300 mb-2">Maha-Dasha Influences</h4>
            {marriageAnalysis.mahaDashaInsights.length > 0 ? (
              marriageAnalysis.mahaDashaInsights.map((it, i) => (
                <p key={i} className={it.status === "Green" ? "text-green-400" : it.status === "Red" ? "text-red-400" : "text-yellow-400"}>
                  <SafeText value={it.text} />
                </p>
              ))
            ) : (
              <p>Neutral influence from current Maha Dasha.</p>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-lg text-yellow-300 mb-2">Yearly (Annual) Influences</h4>
            {marriageAnalysis.annualDashaInsights.length > 0 ? (
              marriageAnalysis.annualDashaInsights.map((it, i) => (
                <p key={i} className={it.status === "Green" ? "text-green-400" : it.status === "Red" ? "text-red-400" : "text-yellow-400"}>
                  <SafeText value={it.text} />
                </p>
              ))
            ) : (
              <p>Neutral influence from current Annual Dasha.</p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <SectionTitle>Year-wise Marriage Probability (Age 20–40)</SectionTitle>
        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
          {marriageProbabilityChart.map((item) => (
            <div key={item.year} className="flex items-center justify-between p-2 bg-gray-900/50 rounded-md">
              <div className="font-bold">{item.year} (Age {item.age})</div>
              <div className={`px-3 py-1 text-sm font-semibold rounded-full ${badge(item.status)}`}>
                {item.probability}
              </div>
            </div>
          ))}
          {marriageProbabilityChart.length === 0 && (
            <p className="text-sm text-gray-400">No dasha data available to compute probabilities.</p>
          )}
        </div>
      </Card>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Child Birth                                                        */
/* ------------------------------------------------------------------ */

const ChildBirthForecastTab: React.FC<{
  report: Report;
  dashaReport: DashaReport | null;
  gender: string;
  targetDate: Date;
  language?: string;
}> = ({ report, dashaReport, gender, targetDate }) => {
  if (!report || !dashaReport || !targetDate) {
    return <div className="p-4 bg-red-900/50 text-red-300 rounded-lg">Missing data (report/dashaReport/targetDate).</div>;
  }

  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState(new Date().toISOString().slice(0,10));

  const possibilityAnalysis = useMemo(() => {
    const yearlyRec = dashaReport.yearlyDashaTimeline.find(d => targetDate >= d.startDate && targetDate <= d.endDate);
    const mahaRec   = dashaReport.mahaDashaTimeline.find(d => targetDate >= d.startDate && targetDate <= d.endDate);
    if (!yearlyRec || !mahaRec) return { status: "Neutral", dasha3: { active: false }, even8: { active: false } };

    const yearly = yearlyRec.dashaNumber;
    const maha   = mahaRec.dashaNumber;
    const { baseKundliGrid, destinyNumber } = report;

    const c3 = baseKundliGrid[3] ?? 0;
    const c8 = baseKundliGrid[8] ?? 0;

    const out: any = { dasha3: { active: false, favorable: false }, even8: { active: false, count: 0 }, status: "Neutral" };

    if (yearly === 3) {
      out.dasha3.active = true;
      out.dasha3.favorable = (c3 === 0) || (c3 === 1) || (c3 === 2 && destinyNumber === 3);
    }
    let eff8 = c8; if (yearly === 8 || maha === 8) eff8++;
    if (eff8 > 0 && eff8 % 2 === 0) { out.even8.active = true; out.even8.count = eff8; }
    if ((out.dasha3.active && out.dasha3.favorable) || out.even8.active) out.status = "Green";
    else if (out.dasha3.active) out.status = "Yellow";

    return out;
  }, [report, dashaReport, targetDate]);

  const avoidanceAnalysis = useMemo(() => {
    if (gender !== "Female") return { text: "This analysis applies only to the female chart.", status: "Neutral" as const };

    const yearly = dashaReport.yearlyDashaTimeline.find(d => targetDate >= d.startDate && targetDate <= d.endDate)?.dashaNumber;
    if (!yearly) return { text: "Dasha data not available.", status: "Neutral" as const };

    const resultant = { ...report.baseKundliGrid };
    resultant[yearly] = (resultant[yearly] ?? 0) + 1;

    const has888 = (resultant[8] ?? 0) >= 3;
    const has4   = (resultant[4] ?? 0) >= 1;
    const has77  = (resultant[7] ?? 0) >= 2;
    const has22  = (resultant[2] ?? 0) >= 2;
    const has66  = (resultant[6] ?? 0) >= 2;

    if (has888 || has4 || has77 || has22 || has66) {
      return { text: "Not a Favorable Period", status: "Red" as const };
    }
    return { text: "This is a Favorable Period", status: "Green" as const };
  }, [report, dashaReport, targetDate, gender]);

  const deliveryDateAnalysis = useMemo(() => {
    if (!selectedDeliveryDate) return { basicNumber: null, destinyNumber: null, feedback: "Select a date" };
    const dateObj = new Date(selectedDeliveryDate + "T00:00:00");
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    const basic = reduceToSingleDigit(day);
    const destiny = reduceToSingleDigit(`${day}${month}${year}`);
    let feedback: "Unfavorable" | "Preferred" | "Neutral";
    if (basic === 4 || basic === 8 || destiny === 4 || destiny === 8) feedback = "Unfavorable";
    else if ([1,3,5,6].includes(destiny)) feedback = "Preferred";
    else feedback = "Neutral";
    return { basicNumber: basic, destinyNumber: destiny, feedback };
  }, [selectedDeliveryDate]);

  const getFeedbackColor = (status: string) =>
    status === "Unfavorable" ? "bg-red-500/20 text-red-300" :
    status === "Preferred"    ? "bg-green-500/20 text-green-300" :
    status === "Neutral"      ? "bg-blue-500/20 text-blue-300" : "bg-gray-700 text-gray-300";

  const StatusBlock: React.FC<{ status: "Green"|"Yellow"|"Red"|"Neutral"; children: React.ReactNode }> = ({ status, children }) => {
    const color =
      status === "Green" ? "bg-green-500/20 text-green-300" :
      status === "Yellow" ? "bg-yellow-500/20 text-yellow-300" :
      status === "Red" ? "bg-red-500/20 text-red-300" : "bg-gray-700/50 text-gray-300";
    return <div className={`p-4 rounded-lg ${color}`}>{children}</div>;
  };

  return (
    <div className="space-y-8">
      <Card className="p-4">
        <SectionTitle>Childbirth Possibility Prediction</SectionTitle>
        <p className="text-sm text-yellow-200/70 mb-4">Analyzes the current forecast year using Annual/Maha Dasha & base chart.</p>
        <StatusBlock status={possibilityAnalysis.status}>
          <NlgChildBirthForecast analysis={possibilityAnalysis} />
        </StatusBlock>
      </Card>

      <Card className="p-4">
        <SectionTitle>Pregnancy Planning Window</SectionTitle>
        <p className="text-sm text-gray-400 mb-4">Most relevant for the female chart; checks if the current window is supportive.</p>
        <StatusBlock status={avoidanceAnalysis.status as any}>
          <p className="font-bold text-xl text-center">{avoidanceAnalysis.text}</p>
        </StatusBlock>
      </Card>

      <Card className="p-4">
        <SectionTitle>Planned Delivery Date Validator</SectionTitle>
        <p className="text-sm text-gray-400 mb-4">Pick a tentative delivery date for quick numerology feedback.</p>
        <div className="mb-4">
          <label htmlFor="deliveryDate" className="block text-sm font-medium text-yellow-500 mb-1">Select a Date</label>
          <input
            type="date"
            id="deliveryDate"
            value={selectedDeliveryDate}
            onChange={(e) => setSelectedDeliveryDate(e.target.value)}
            className="mt-1 block w-full md:w-1/2 bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white"
          />
        </div>
        {selectedDeliveryDate && (
          <div className="space-y-4 p-4 bg-gray-900/50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Calculated Basic Number:</span>
              <span className="font-bold text-2xl text-indigo-400">{deliveryDateAnalysis.basicNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Calculated Destiny Number:</span>
              <span className="font-bold text-2xl text-indigo-400">{deliveryDateAnalysis.destinyNumber}</span>
            </div>
            <div className={`p-4 rounded-md text-center ${getFeedbackColor(deliveryDateAnalysis.feedback)}`}>
              <p className="font-bold text-xl">{deliveryDateAnalysis.feedback}</p>
            </div>
          </div>
        )}
        <div className="mt-6 p-4 rounded-md bg-yellow-900/50 text-yellow-300 border-l-4 border-yellow-500">
          <p className="font-bold">Disclaimer:</p>
          <p className="text-sm">This is preliminary guidance. Get a full Vedic analysis for a final decision.</p>
        </div>
      </Card>
    </div>
  );
};

export default ForecastTab;
