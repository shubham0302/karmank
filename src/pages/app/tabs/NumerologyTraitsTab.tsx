import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { DATA, reduceToSingleDigit } from "@/lib/numerology";
import { getText, type Language } from "@/lib/numerology/utils";
import { useReport } from "@/context/ReportContext";

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-lg font-bold text-yellow-400 mb-3">{children}</h3>
);

type ReportLike =
  | {
      destinyNumber?: number | string;
      dob?: string;
      baseKundliGrid?: Record<number, number>;
    }
  | null
  | undefined;

type Props = {
  report?: ReportLike;
  gender?: "Male" | "Female" | string;
  language?: Language;
};

const coerce1to9 = (v: unknown): number | null => {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 1 && n <= 9 ? n : null;
};

function parseDOBToDestiny(dob?: string | null): number | null {
  if (!dob || typeof dob !== "string") return null;
  const s = dob.trim();
  let dd = "", mm = "", yyyy = "";

  let m = s.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/); // DD-MM-YYYY
  if (m) { dd = m[1]; mm = m[2]; yyyy = m[3]; }
  else {
    m = s.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);   // YYYY-MM-DD
    if (m) { yyyy = m[1]; mm = m[2]; dd = m[3]; }
  }
  if (!dd || !mm || !yyyy) return null;

  const digits = (dd + mm + yyyy).replace(/\D/g, "");
  if (!digits) return null;

  const sum = digits.split("").reduce((a, d) => a + parseInt(d, 10), 0);
  return coerce1to9(reduceToSingleDigit(sum));
}

const TraitItem: React.FC<{ label: string; value?: any; language?: Language }> = ({
  label, value, language = "en",
}) => {
  if (value === undefined || value === null || value === "") return null;
  const txt =
    typeof value === "string" ? value :
    typeof value === "number" ? String(value) :
    typeof value === "object" ? getText(value, language) : String(value);
  if (!txt) return null;

  return (
    <div className="bg-gray-900/50 p-3 rounded-md">
      <h4 className="font-semibold text-yellow-500 text-sm">{label}</h4>
      <p className="text-gray-300">{txt}</p>
    </div>
  );
};

const ProfessionColumn: React.FC<{
  title: string;
  items?: string[] | any[];
  type: "suggested" | "neutral" | "ideal" | "avoid";
  language?: Language;
}> = ({ title, items, type, language = "en" }) => {
  if (!Array.isArray(items) || items.length === 0) return null;
  const styles = {
    suggested: { bg: "bg-green-500/10", text: "text-green-400" },
    neutral:   { bg: "bg-yellow-500/10", text: "text-yellow-400" },
    ideal:     { bg: "bg-blue-500/10", text: "text-blue-400" },
    avoid:     { bg: "bg-red-500/10", text: "text-red-400" },
  }[type];

  const toText = (v: any) => typeof v === "string" ? v : typeof v === "object" ? getText(v, language) : String(v);

  return (
    <div className={`p-4 rounded-lg ${styles.bg} h-full`}>
      <h4 className={`font-bold ${styles.text} mb-2 text-center`}>{title}</h4>
      <ul className="space-y-1 text-center">
        {items.map((item, i) => (
          <li key={`${title}-${i}`} className="text-gray-300 text-sm">{toText(item)}</li>
        ))}
      </ul>
    </div>
  );
};

const NumerologyTraitsTab: React.FC<Props> = ({ report, gender, language = "en" }) => {
  const { report: ctxReport } = useReport();

  // Pull from prop → context → localStorage
  const [persisted, setPersisted] = useState<ReportLike>(null);
  useEffect(() => {
    try {
      const r = localStorage.getItem("karmank:lastReport");
      if (r) setPersisted(JSON.parse(r));
    } catch { /* ignore */ }
    const onRpt = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) setPersisted(detail);
    };
    window.addEventListener("karmank:report", onRpt as EventListener);
    return () => window.removeEventListener("karmank:report", onRpt as EventListener);
  }, []);

  const effectiveReport = report ?? ctxReport ?? persisted;

  // Destiny detection chain
  let destiny = coerce1to9(effectiveReport?.destinyNumber);
  if (!destiny) {
    // try DOB from report or last saved inputs
    let dob = (effectiveReport as any)?.dob;
    if (!dob) {
      try {
        const savedInputs = localStorage.getItem("karmank:lastInputs");
        if (savedInputs) {
          const obj = JSON.parse(savedInputs);
          dob = obj?.dob || obj?.dateOfBirth || obj?.birthDate;
        }
      } catch { /* ignore */ }
    }
    destiny = parseDOBToDestiny(dob);
  }

  if (!destiny) {
    return (
      <Card className="p-6">
        <SectionTitle>Numerology Traits</SectionTitle>
        <p className="text-yellow-200/80">
          Destiny Number not detected. Please fill your DOB on the <b>Welcome</b> tab and click <b>Generate Report</b>.
        </p>
      </Card>
    );
  }

  const traits = (DATA as any)?.destinyTraits?.[destiny] ?? null;
  const professions = (DATA as any)?.destinyProfessions?.[destiny] ?? null;
  const numberDetail = (DATA as any)?.numberDetails?.[destiny];

  const supportAnalysis = useMemo(() => {
    if (!professions || !professions.supportNeeded) return [];
    const supportNumbers =
      String(professions.supportNeeded).match(/\d+/g)?.map((s: string) => Number(s)) || [];
    const grid = effectiveReport?.baseKundliGrid || {};
    return supportNumbers.map((num) => ({
      number: num,
      isPresent: (grid as Record<number, number>)[num] > 0,
    }));
  }, [professions, effectiveReport?.baseKundliGrid]);

  const T = (v: any) =>
    v === undefined || v === null ? "" : typeof v === "string" ? v : typeof v === "object" ? getText(v, language) : String(v);

  const safe = (obj: any, key: string) => (obj && key in obj ? obj[key] : undefined);

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <SectionTitle>
          Detailed Traits for Destiny Number {destiny}
          {gender ? ` — ${gender}` : ""}
        </SectionTitle>

        {numberDetail?.essence && (
          <p className="text-gray-300 mb-4">
            {getText(numberDetail.essence || numberDetail.summary || { en: "" }, language)}
          </p>
        )}

        {traits ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TraitItem label="Planet (Grah)" value={safe(traits, "Planet")} language={language} />
            <TraitItem label="Finance" value={safe(traits, "Finance")} language={language} />
            <TraitItem label="Health Defects" value={safe(traits, "Health Defects")} language={language} />
            <TraitItem label="Lucky Days" value={safe(traits, "Lucky Days")} language={language} />
            <TraitItem label="Lucky Colours" value={safe(traits, "Lucky Colours")} language={language} />
            <TraitItem label="Lucky Jewels" value={safe(traits, "Lucky Jewels")} language={language} />
            <TraitItem label="Important Years" value={safe(traits, "Important Years")} language={language} />
            <TraitItem label="Friendly Number" value={safe(traits, "Friendly Number")} language={language} />
            <TraitItem label="Good Quality" value={safe(traits, "Good Quality")} language={language} />
            <TraitItem label="Spiritual Insights" value={safe(traits, "Spiritual Insights")} language={language} />
            <TraitItem label="Drawback" value={safe(traits, "Drawback")} language={language} />
            <div className="md:col-span-2 lg:col-span-3">
              <TraitItem
                label={gender === "Female" ? "As Wife" : "As Husband"}
                value={gender === "Female" ? safe(traits, "As Wife") : safe(traits, "As Husband")}
                language={language}
              />
            </div>
          </div>
        ) : (
          <p className="text-gray-300">No detailed traits available for Destiny Number {destiny}.</p>
        )}
      </Card>

      {professions && (
        <Card className="p-4">
          <SectionTitle>Career & Profession Profile</SectionTitle>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <ProfessionColumn title="Suggested Professions" items={professions.suggested} type="suggested" language={language} />
              <ProfessionColumn title="Neutral Fields" items={professions.neutral} type="neutral" language={language} />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <ProfessionColumn title="Ideal Corporate Roles" items={professions.idealCorporate} type="ideal" language={language} />
              <ProfessionColumn title="Fields to Avoid" items={professions.avoid} type="avoid" language={language} />
            </div>
            {(professions.supportNeeded || supportAnalysis.length > 0) && (
              <div className="p-4 rounded-lg bg-indigo-500/10 text-center">
                <h4 className="font-bold text-indigo-400 mb-2">Support Needed</h4>
                {professions.supportNeeded && <p className="text-gray-300 text-sm mb-3">{T(professions.supportNeeded)}</p>}
                <div className="flex justify-center flex-wrap gap-3">
                  {supportAnalysis.map((item) => (
                    <div
                      key={item.number}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        item.isPresent ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {item.isPresent ? "✅" : "⚠️"}
                      <span>Number {item.number} {item.isPresent ? "Present" : "Missing"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default NumerologyTraitsTab;
