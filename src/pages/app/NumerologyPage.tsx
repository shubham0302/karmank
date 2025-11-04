// src/pages/app/NumerologyPage.tsx
import React, { useState } from "react";
import { DATA, calculateNumerology, dashaCalculator } from "@/lib/numerology";

import WelcomeTab from "@/pages/app/tabs/WelcomeTab";
import FoundationalAnalysisTab from "@/pages/app/tabs/FoundationalAnalysisTab";

import {
  EducationTab,
  RemediesAndGuidanceTab,
  NumerologyTraitsTab,
  ForecastTab,
  AssetVibrationTab,
} from "@/components/numerology";

// Import AdvancedDashaTab directly
import AdvancedDashaTab from "@/pages/app/tabs/AdvancedDashaTab";

import { useReport } from "@/context/ReportContext";
import { ErrorBoundary } from "@/components/dev/ErrorBoundary";

/* -------------------- helpers: date formatting -------------------- */
function toDDMMYYYY(htmlDate: string): string {
  if (!htmlDate) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(htmlDate)) return htmlDate; // already DD/MM/YYYY
  const m = htmlDate.match(/^(\d{4})-(\d{2})-(\d{2})$/); // HTML date YYYY-MM-DD
  if (!m) return htmlDate;
  const [, yyyy, mm, dd] = m;
  return `${dd}/${mm}/${yyyy}`;
}

export default function NumerologyPage() {
  const [userData, setUserData] = useState({ dob: "", name: "", gender: "Male" });
  const [report, setReport] = useState<any>(null);
  const [dashaReport, setDashaReport] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    | "Welcome"
    | "Asset Vibration"
    | "Education"
    | "Remedies & Guidance"
    | "Numerology Traits"
    | "Forecast"
    | "Foundational Analysis"
    | "Advanced Dasha"
  >("Welcome");
  const [formError, setFormError] = useState("");

  const { setReport: setGlobalReport } = useReport();
  const language = "en";

  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userData.dob || !userData.name) {
      setFormError("Please enter a name and date of birth.");
      return;
    }
    setFormError("");

    const dobDDMMYYYY = toDDMMYYYY(userData.dob);

    const mainReport = calculateNumerology(dobDDMMYYYY, DATA);

    if (mainReport) {
      setReport(mainReport);
      setGlobalReport(mainReport);

      try {
        localStorage.setItem("karmank:lastReport", JSON.stringify(mainReport));
        localStorage.setItem(
          "karmank:lastInputs",
          JSON.stringify({
            name: userData.name,
            dob: dobDDMMYYYY,
            gender: userData.gender,
            language,
          })
        );
        window.dispatchEvent(new CustomEvent("karmank:report", { detail: mainReport }));
      } catch {
        /* ignore storage errors */
      }

      // Keep your existing engine output (used in Forecast tab, etc.)
      const dobForDasha = (mainReport.dob as string) || dobDDMMYYYY;
      const basic = mainReport.basicNumber;

      const maha = dashaCalculator.calculateMahaDasha(dobForDasha, basic);
      const yearly = dashaCalculator.calculateYearlyDasha(dobForDasha, basic);
      const monthly = dashaCalculator.calculateMonthlyDasha(yearly);
      const daily = dashaCalculator.calculateDailyDasha(monthly);

      setDashaReport({
        mahaDashaTimeline: maha,
        yearlyDashaTimeline: yearly,
        monthlyDashaTimeline: monthly,
        dailyDashaTimeline: daily,
      });

      setActiveTab("Welcome");
    }
  };

  const renderTabContent = () => {
    if (!report) return null;

    const dobDisplay = toDDMMYYYY(userData.dob); // pass this to tabs that need DOB

    switch (activeTab) {
      case "Welcome":
        return (
          <WelcomeTab
            name={userData.name}
            dob={dobDisplay}
            basicNumber={report.basicNumber}
            destinyNumber={report.destinyNumber}
            language={language}
            isPremium={false}
            onUpgradeClick={() => {}}
          />
        );

      case "Asset Vibration":
        return <AssetVibrationTab destinyNumber={report.destinyNumber} />;

      case "Education":
        return <EducationTab report={report} />;

      case "Remedies & Guidance":
        return <RemediesAndGuidanceTab report={report} />;

      case "Numerology Traits":
        return <NumerologyTraitsTab report={report} gender={userData.gender} />;

      case "Forecast":
        return <ForecastTab report={report} dashaReport={dashaReport} gender={userData.gender} />;

      case "Foundational Analysis":
        return (
          <FoundationalAnalysisTab
            name={userData.name}
            dob={dobDisplay}
            language={language}
            isPremium={false}
            onUpgradeClick={() => {}}
          />
        );

      case "Advanced Dasha":
        return (
          <AdvancedDashaTab
            dob={dobDisplay}                 // ✅ REQUIRED: enables kundli & dasha logic
            dashaReport={dashaReport}
            baseKundliGrid={report.baseKundliGrid}
            basicNumber={report.basicNumber}
            destinyNumber={report.destinyNumber}
            foundationalYogas={report.yogas}
          />
        );

      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <div
        className="min-h-screen bg-indigo-900 text-gray-200 font-sans p-4 md:p-8"
        style={{
          background:
            "radial-gradient(circle, rgba(18, 16, 46, 0.58) 0%, rgba(10, 9, 28, 0.54) 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto">
          <header className="text-center mb-6">
            <p className="text-3xl md:text-4xl font-extrabold font-serif tracking-wide">
              Discover Your True Potential
            </p>
          </header>

          {/* Input Card */}
          <div className="mb-8 rounded-xl border border-yellow-300/10 bg-gray-800/40 p-4">
            <form onSubmit={handleGenerate} className="grid md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-1">
                <label htmlFor="name" className="block text-sm font-medium text-yellow-500">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2"
                />
              </div>

              <div className="md:col-span-1">
                <label htmlFor="dob" className="block text-sm font-medium text-yellow-500">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dob"
                  value={userData.dob}
                  onChange={(e) => setUserData({ ...userData, dob: e.target.value })}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2"
                />
              </div>

              <div className="md:col-span-1">
                <label htmlFor="gender" className="block text-sm font-medium text-yellow-500">
                  Gender
                </label>
                <select
                  id="gender"
                  value={userData.gender}
                  onChange={(e) =>
                    setUserData({ ...userData, gender: e.target.value as "Male" | "Female" })
                  }
                  className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2"
                >
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>

              <div className="md:col-span-1">
                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-indigo-900 font-bold py-2 px-4 rounded-md transition duration-300"
                >
                  Generate Report
                </button>
              </div>
            </form>

            {formError && <p className="text-red-400 text-center mt-4">{formError}</p>}
          </div>

          {report ? (
            <div>
              {/* Tabs */}
              <div className="mb-4 border-b border-yellow-400/20 flex flex-wrap">
                {(
                  [
                    "Welcome",
                    "Asset Vibration",
                    "Education",
                    "Remedies & Guidance",
                    "Numerology Traits",
                    "Forecast",
                    "Foundational Analysis",
                    "Advanced Dasha",
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-4 font-medium transition-colors duration-300 ${
                      activeTab === tab
                        ? "text-yellow-400 border-b-2 border-yellow-400"
                        : "text-yellow-200/70 hover:text-yellow-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="mt-6">{renderTabContent()}</div>
            </div>
          ) : (
            <div className="text-center text-yellow-200/80 p-8 bg-gray-800/50 rounded-lg">
              <p>Please enter a name and date of birth to generate your Vedic Numerology report.</p>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
