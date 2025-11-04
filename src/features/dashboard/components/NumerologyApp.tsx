import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";

type Lang = "en" | "hi" | "en-hi";
type Gender = "male" | "female" | "other";

type NumerologyAppProps = {
  onLogout?: () => void;
  isPremium: boolean;
  setIsPremium: (v: boolean) => void;
  // ⬇️ your existing engines (used as-is; no new logic added)
  calculateNumerology: (dob: string) => any;
  dashaCalculator: { calculate: (dob: string) => any };
};

const TABS = [
  "Welcome",
  "Foundational Analysis",
  "Advanced Dasha",
  "Forecast",
  "Asset Vibration",
  "Education",
  "Remedies & Guidance",
  "Numerology Traits",
] as const;

export default function NumerologyApp({
  onLogout,
  isPremium,
  setIsPremium,
  calculateNumerology,
  dashaCalculator,
}: NumerologyAppProps) {
  // form state
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [language, setLanguage] = useState<Lang>("en");

  // ui state
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Welcome");
  const [formError, setFormError] = useState("");
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [freeReportGenerated, setFreeReportGenerated] = useState(false);

  // results
  const [report, setReport] = useState<any>(null);
  const [dashaReport, setDashaReport] = useState<any>(null);

  const handleGenerate = (e?: React.FormEvent) => {
    e?.preventDefault();

    // require Name, DOB, Gender
    if (!name || !dob || !gender) {
      setFormError("Please provide Name, Date of Birth, and Gender.");
      return;
    }
    setFormError("");

    // simple gating: 1 free generation, then premium
    if (!isPremium && freeReportGenerated) {
      setShowPremiumModal(true);
      return;
    }

    // use your engines as-is
    const numerologyReport = calculateNumerology(dob);
    const dasha = dashaCalculator.calculate(dob);

    // store user profile fields with the report (UI only)
    setReport({
      ...(numerologyReport || {}),
      name,
      dob,
      gender,
      language, // captured for downstream use/display if needed
    });
    setDashaReport(dasha || null);
    setActiveTab("Foundational Analysis");

    if (!isPremium) setFreeReportGenerated(true);
  };

  const pretty = (v: any) => {
    try {
      if (typeof v === "string") return v;
      return JSON.stringify(v, null, 2);
    } catch {
      return String(v);
    }
  };

  const KeyValue = ({ obj }: { obj: Record<string, any> }) => {
    if (!obj || typeof obj !== "object") return null;
    const entries = Object.entries(obj).filter(
      ([_, v]) => v !== undefined && v !== null && v !== ""
    );
    if (!entries.length) return <div className="text-sm opacity-70">No data.</div>;
    return (
      <div className="space-y-2">
        {entries.map(([k, v]) => (
          <div key={k} className="flex items-start gap-2">
            <div className="min-w-[160px] text-xs uppercase tracking-wide text-muted-foreground">
              {k}
            </div>
            <div className="flex-1 whitespace-pre-wrap text-sm">{pretty(v)}</div>
          </div>
        ))}
      </div>
    );
  };

  const TabButton = ({ tab }: { tab: (typeof TABS)[number] }) => (
    <Button
      type="button"
      variant={activeTab === tab ? "default" : "outline"}
      className="rounded-full"
      onClick={() => setActiveTab(tab)}
    >
      {tab}
    </Button>
  );

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <GlassCard variant="subtle" size="sm">
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g., AAKASH SHARMA"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background/50 border-primary/30 focus:border-auric-gold"
            />
          </div>

          <div>
            <Label htmlFor="dob">Date of Birth (DD/MM/YYYY)</Label>
            <Input
              id="dob"
              placeholder="22/04/1987"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="bg-background/50 border-primary/30 focus:border-auric-gold"
            />
          </div>

          <div>
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              className="w-full h-10 rounded-md bg-background/50 border border-primary/30 px-3"
            >
              <option value="">Select…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other / Prefer not to say</option>
            </select>
          </div>

          <div>
            <Label htmlFor="lang">Language</Label>
            <select
              id="lang"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Lang)}
              className="w-full h-10 rounded-md bg-background/50 border border-primary/30 px-3"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="en-hi">Hinglish</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <Button type="submit" className="w-full">
              Generate
            </Button>
            {onLogout && (
              <Button type="button" variant="outline" onClick={onLogout}>
                Logout
              </Button>
            )}
          </div>

          {formError && (
            <div className="md:col-span-5 text-sm text-red-400 -mt-2">{formError}</div>
          )}
        </form>
      </GlassCard>

      {/* Tabs header */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <TabButton key={t} tab={t} />
        ))}
      </div>

      {/* Tab content */}
      <div>
        {/* Welcome */}
        {activeTab === "Welcome" && (
          <GlassCard variant="cosmic">
            <div className="space-y-2">
              <div className="text-lg font-semibold">Welcome to KarmAnk</div>
              <p className="text-sm opacity-80">
                Enter your Name, DOB, and Gender above, then hit <strong>Generate</strong> to view your insights.
              </p>
              {!isPremium && (
                <p className="text-xs opacity-70">
                  You can generate one free report. Further deep-dive features require an upgrade.
                </p>
              )}
            </div>
          </GlassCard>
        )}

        {/* Foundational Analysis */}
        {activeTab === "Foundational Analysis" && (
          <GlassCard variant="elevated">
            <div className="space-y-4">
              <div className="text-lg font-semibold">Foundational Analysis</div>

              {/* Profile summary row */}
              {!report ? (
                <div className="text-sm opacity-70">No report yet. Generate above.</div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/15 border border-emerald-500/30">
                      <strong>Name:</strong> {report.name}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs bg-indigo-500/15 border border-indigo-500/30">
                      <strong>DOB:</strong> {report.dob}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs bg-amber-500/15 border border-amber-500/30 capitalize">
                      <strong>Gender:</strong> {report.gender}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs bg-sky-500/15 border border-sky-500/30">
                      <strong>Language:</strong> {report.language}
                    </span>
                  </div>

                  {/* Engine output */}
                  <div className="pt-2">
                    <KeyValue obj={report} />
                  </div>
                </>
              )}
            </div>
          </GlassCard>
        )}

        {/* Advanced Dasha */}
        {activeTab === "Advanced Dasha" && (
          <GlassCard variant="elevated">
            <div className="space-y-4">
              <div className="text-lg font-semibold">Advanced Dasha</div>
              {!report ? (
                <div className="text-sm opacity-70">Generate a report to see Dasha details.</div>
              ) : !isPremium ? (
                <div className="space-y-3">
                  <div className="text-sm opacity-80">
                    Advanced Dasha is a premium feature. Upgrade to unlock detailed dasha timelines.
                  </div>
                  <Button onClick={() => setShowPremiumModal(true)}>Upgrade</Button>
                </div>
              ) : (
                <KeyValue obj={dashaReport || { note: "No dasha data returned by engine." }} />
              )}
            </div>
          </GlassCard>
        )}

        {/* Forecast */}
        {activeTab === "Forecast" && (
          <GlassCard variant="elevated">
            <div className="space-y-4">
              <div className="text-lg font-semibold">Forecast</div>
              {!report ? (
                <div className="text-sm opacity-70">Generate a report to see your forecast.</div>
              ) : !isPremium ? (
                <div className="space-y-3">
                  <div className="text-sm opacity-80">Forecast is premium-only.</div>
                  <Button onClick={() => setShowPremiumModal(true)}>Upgrade</Button>
                </div>
              ) : (
                <KeyValue
                  obj={(report && (report.forecast || report.nextPeriods)) || {
                    note: "No forecast provided.",
                  }}
                />
              )}
            </div>
          </GlassCard>
        )}

        {/* Asset Vibration */}
        {activeTab === "Asset Vibration" && (
          <GlassCard variant="elevated">
            <div className="space-y-2">
              <div className="text-lg font-semibold">Asset Vibration</div>
              <div className="text-sm opacity-70">
                Connect vehicles, properties, or numbers here (UI to be wired to your asset module).
              </div>
            </div>
          </GlassCard>
        )}

        {/* Education */}
        {activeTab === "Education" && (
          <GlassCard variant="elevated">
            <div className="space-y-2">
              <div className="text-lg font-semibold">Education</div>
              <div className="text-sm opacity-70">
                Learning resources and guides (populate from your content store or CMS).
              </div>
            </div>
          </GlassCard>
        )}

        {/* Remedies & Guidance */}
        {activeTab === "Remedies & Guidance" && (
          <GlassCard variant="elevated">
            <div className="space-y-4">
              <div className="text-lg font-semibold">Remedies & Guidance</div>
              {!report ? (
                <div className="text-sm opacity-70">Generate a report to see remedies.</div>
              ) : (
                <KeyValue
                  obj={{
                    remedies:
                      (report.remedies ||
                        report.guidance ||
                        report.recommendations) ?? "No remedies provided.",
                  }}
                />
              )}
            </div>
          </GlassCard>
        )}

        {/* Numerology Traits */}
        {activeTab === "Numerology Traits" && (
          <GlassCard variant="elevated">
            <div className="space-y-2">
              <div className="text-lg font-semibold">Numerology Traits</div>
              <div className="text-sm opacity-70">
                Personality traits, strengths, and challenges (render from your engine fields if available).
              </div>
              {report && <KeyValue obj={report.traits || { note: "No traits included in report." }} />}
            </div>
          </GlassCard>
        )}
      </div>

      {/* simple premium modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl bg-background/95 p-6 border border-primary/20 space-y-4">
            <div className="text-lg font-semibold">Upgrade to Premium</div>
            <p className="text-sm opacity-80">Unlock Advanced Dasha, Forecast and more.</p>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setIsPremium(true);
                  setShowPremiumModal(false);
                }}
              >
                Upgrade now
              </Button>
              <Button variant="outline" onClick={() => setShowPremiumModal(false)}>
                Not now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
