// src/pages/app/tabs/AssetVibrationTab.tsx
import React, { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { DATA, reduceToSingleDigit } from "@/lib/numerology";
import { useReport } from "@/context/ReportContext"; // ✅ read global report

type ReportLike = { destinyNumber?: number | string } | null | undefined;

type Props = {
  /** Prefer the Welcome report; destinyNumber is only a fallback */
  report?: ReportLike;
  destinyNumber?: number | string;
};

type Synergy = "Auspicious" | "Good" | "Neutral" | "Avoid";

const AssetVibrationTab: React.FC<Props> = ({ report, destinyNumber }) => {
  // ---------- DESTINY: prefer context → then prop → then local report ----------
  const { report: ctxReport } = useReport();

  const parse1to9 = (v: unknown): number => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 1 && n <= 9 ? n : NaN;
  };

  const fromCtx   = parse1to9(ctxReport?.destinyNumber);
  const fromProp  = parse1to9(destinyNumber);
  const fromLocal = parse1to9((report as any)?.destinyNumber);
  const dno = Number.isNaN(fromCtx) ? (Number.isNaN(fromProp) ? fromLocal : fromProp) : fromCtx;
  const hasDestiny = Number.isFinite(dno);

  const [assetType, setAssetType] = useState<"Vehicle" | "House" | "Account">("Vehicle");
  const [subTab, setSubTab] = useState<"Analysis" | "Suggestion">("Analysis");
  const [assetNumber, setAssetNumber] = useState("");
  const [results, setResults] = useState<{
    vibrationNumber: number;
    interpretation?: string;
    synergyStatus: Synergy;
  } | null>(null);
  const [message, setMessage] = useState("");

  const assetDetails = {
    Vehicle: {
      label: "Vehicle Number",
      placeholder: "e.g., GJ23NP2654",
      interpretations: (DATA as any)?.vehicleNumberDetails ?? {},
    },
    House: {
      label: "House / Flat / Plot No.",
      placeholder: "e.g., B-404 or 12",
      interpretations: (DATA as any)?.houseNumberDetails ?? {},
    },
    Account: {
      label: "Account Number",
      placeholder: "Enter last 4-6 digits",
      interpretations: (DATA as any)?.accountNumberDetails ?? {},
    },
  } as const;

  const getCompat = (num: number) => {
    const raw = (DATA as any)?.assetCompatibility?.[num] ?? {};
    const arr = (x: any) => (Array.isArray(x) ? x : []);
    return {
      auspicious: arr(raw.auspicious),
      good: arr(raw.good),
      neutral: arr(raw.neutral),
      avoid: arr(raw.avoid),
      description: raw.description ?? {},
    };
  };

  const compat = useMemo(() => getCompat(dno), [dno]);

  const classify = (vibration: number, c = compat): Synergy => {
    if (c.auspicious.includes(vibration)) return "Auspicious";
    if (c.good.includes(vibration)) return "Good";
    if (c.neutral.includes(vibration)) return "Neutral";
    return "Avoid";
  };

  const handleAnalyze = () => {
    try {
      if (!assetNumber.trim()) {
        setMessage(`Please enter a ${assetType.toLowerCase()} number.`);
        setResults(null);
        return;
      }
      setMessage("");

      const digits = assetNumber.replace(/\D/g, "");
      if (!digits.length) {
        setMessage(`No digits found in the ${assetType.toLowerCase()} number.`);
        setResults(null);
        return;
      }

      const sum = digits.split("").reduce((acc, d) => acc + parseInt(d, 10), 0);
      const finalNumber = reduceToSingleDigit(sum);

      const interpretations = (assetDetails as any)?.[assetType]?.interpretations ?? {};
      const interpretation =
        typeof interpretations?.[finalNumber] === "string" && interpretations[finalNumber].trim()
          ? interpretations[finalNumber]
          : undefined;

      setResults({
        vibrationNumber: finalNumber,
        interpretation,
        synergyStatus: classify(finalNumber),
      });
    } catch (e) {
      console.error("Asset analyze error:", e);
      setMessage("Could not analyze this number. Please check DATA configuration.");
      setResults(null);
    }
  };

  const resetForType = (type: "Vehicle" | "House" | "Account") => {
    setAssetType(type);
    setAssetNumber("");
    setResults(null);
    setMessage("");
    setSubTab("Analysis");
  };

  // Keep synergy in sync if Destiny changes
  useEffect(() => {
    if (!results) return;
    if (!hasDestiny) {
      setResults((r) => (r ? { ...r, synergyStatus: "Avoid" } : r));
      return;
    }
    setResults((r) => (r ? { ...r, synergyStatus: classify(r.vibrationNumber) } : r));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dno, hasDestiny]);

  return (
    <Card className="p-4">
      <h3 className="text-lg font-bold text-yellow-400 mb-2">Asset Vibration Analysis</h3>
      <p className="mb-2 text-yellow-200/70">
        Analyze the vibration of your assets to see how they align with your personal destiny.
      </p>
      <p className="text-xs text-gray-400 mb-6">
        destinyNumber: {hasDestiny ? dno : "not set"} | vibration: {results?.vibrationNumber ?? "-"}
      </p>

      {!hasDestiny && (
        <p className="text-sm text-yellow-300/90 mb-4">
          Waiting for Destiny from Welcome… please enter DOB on the Welcome tab.
        </p>
      )}

      {/* Asset type pills */}
      <div className="mb-6 flex justify-center items-center bg-gray-900 rounded-full p-1 max-w-md mx-auto border border-yellow-400/20">
        {(["Vehicle", "House", "Account"] as const).map((type) => (
          <button
            key={type}
            onClick={() => resetForType(type)}
            className={`cursor-pointer rounded-full flex-1 text-center py-2 px-4 font-medium transition-colors duration-300 ${
              assetType === type ? "bg-yellow-500 text-indigo-900 shadow-md" : "text-yellow-200/70"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Vehicle-only sub tabs */}
      {assetType === "Vehicle" && (
        <div className="mb-4 border-b border-yellow-400/20 flex justify-center">
          <button
            onClick={() => setSubTab("Analysis")}
            className={`py-2 px-4 font-medium transition-colors duration-200 ${
              hasDestiny && subTab === "Analysis" ? "text-yellow-400 border-b-2 border-yellow-400" : "text-yellow-200/70"
            }`}
          >
            Analysis
          </button>
          <button
            onClick={() => setSubTab("Suggestion")}
            className={`py-2 px-4 font-medium transition-colors duration-200 ${
              hasDestiny && subTab === "Suggestion" ? "text-yellow-400 border-b-2 border-yellow-400" : "text-yellow-200/70"
            }`}
            disabled={!hasDestiny}
            title={!hasDestiny ? "Destiny not set yet" : ""}
          >
            Choice Number Suggestion
          </button>
        </div>
      )}

      {subTab === "Analysis" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label htmlFor="assetNumber" className="block text-sm font-medium text-yellow-500 mb-2">
                {assetDetails[assetType].label}
              </label>
              <input
                type="text"
                id="assetNumber"
                value={assetNumber}
                onChange={(e) => setAssetNumber(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500"
                placeholder={assetDetails[assetType].placeholder}
              />
            </div>
            <div>
              <button
                onClick={handleAnalyze}
                className="w-full bg-yellow-500 text-indigo-900 font-bold px-8 py-3 rounded-lg hover:bg-yellow-600 transition duration-200 shadow-lg"
              >
                Analyze
              </button>
            </div>
          </div>

          {message && <p className="text-red-400 text-center mt-4">{message}</p>}

          {results && (
            <div className="mt-8">
              <div
                className={`text-center p-4 rounded-lg mb-8 ${
                  results.synergyStatus === "Auspicious"
                    ? "bg-blue-900/50 text-blue-300"
                    : results.synergyStatus === "Good"
                    ? "bg-green-900/50 text-green-300"
                    : results.synergyStatus === "Neutral"
                    ? "bg-yellow-900/50 text-yellow-300"
                    : "bg-red-900/50 text-red-300"
                }`}
              >
                <h2 className="text-2xl font-bold">{results.synergyStatus}</h2>
                <p className="mt-1">
                  Vibration Number: <b>{results.vibrationNumber}</b>
                </p>
              </div>

              <Card className="p-4 bg-gray-900/40 border border-yellow-400/10">
                <h4 className="text-yellow-300 font-semibold mb-2">Interpretation</h4>
                <p className="text-gray-300">
                  {results.interpretation
                    ? results.interpretation
                    : "No specific interpretation found for this number in your data. Consider general number traits."}
                </p>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Suggestion only when Vehicle tab AND we have a valid destiny */}
      {assetType === "Vehicle" && subTab === "Suggestion" && hasDestiny && (
        <div className="mt-6 space-y-4">
          <h4 className="text-center text-xl font-semibold text-yellow-300">
            Choice Number Suggestions for Destiny #{dno}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
            <div className="p-4 bg-blue-900/50 rounded-lg">
              <h5 className="text-lg font-bold text-blue-300 mb-2">Auspicious Numbers</h5>
              <p className="text-3xl font-bold">{(compat.auspicious ?? []).join(", ") || "-"}</p>
            </div>
            <div className="p-4 bg-green-900/50 rounded-lg">
              <h5 className="text-lg font-bold text-green-300 mb-2">Good Numbers</h5>
              <p className="text-3xl font-bold">{(compat.good ?? []).join(", ") || "-"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
            <div className="p-4 bg-yellow-900/50 rounded-lg">
              <h5 className="text-lg font-bold text-yellow-300 mb-2">Neutral</h5>
              <p className="text-xl font-semibold">{(compat.neutral ?? []).join(", ") || "-"}</p>
            </div>
            <div className="p-4 bg-red-900/50 rounded-lg">
              <h5 className="text-lg font-bold text-red-300 mb-2">Avoid</h5>
              <p className="text-xl font-semibold">{(compat.avoid ?? []).join(", ") || "-"}</p>
            </div>
          </div>

          {compat.description && (
            <Card className="p-4 bg-gray-900/40 border border-yellow-400/10">
              <h5 className="text-yellow-300 font-semibold mb-2">Why these numbers?</h5>
              <p className="text-gray-300">{compat.description.en}</p>
            </Card>
          )}
        </div>
      )}
    </Card>
  );
};

export default AssetVibrationTab;
