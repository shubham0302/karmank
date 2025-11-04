// src/pages/app/tabs/RemediesFinal.tsx
import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useReport } from "@/context/ReportContext";
import { DATA } from "@/lib/numerology";

/**
 * RemediesFinal.tsx
 * Single-file final remedies tab — defensive, compatible with your AdvancedDasha components.
 *
 * Key fixes made:
 *  - DynamicAdvancedRemediesDisplay now iterates dynamicGrid whether it's an Array, Map, or Object.
 *  - Safe readers for DATA blocks (handles numeric keys as numbers or strings).
 *  - Renders all sections: General, Mantra, Donation, Planetary, Rudraksha, Multiplicity, Special, Destiny, Beej.
 *
 * Paste into your repo and wire it to your route. No changes required to your AdvancedDasha code.
 */

// -------------------- Helpers --------------------
type Lang = "en" | "hi" | "en-hi" | string;
const DEFAULT_LANG: Lang = "en";

const safeText = (node: any, lang: Lang = DEFAULT_LANG): string => {
  if (!node) return "";
  if (typeof node === "string") return node;
  return node[lang] ?? node.en ?? node["en-hi"] ?? node.hi ?? "";
};

const getByNumber = (block: any, n: number) => {
  if (!block) return null;
  if (block[n]) return block[n];
  const s = String(n);
  if (block[s]) return block[s];
  // sometimes keys are nested or stored under "numberX" - negligible but attempt
  for (const k of Object.keys(block)) {
    if (k.toLowerCase().includes(String(n))) return block[k];
  }
  return null;
};

// Accept dynamicGrid in multiple formats (Array, Map, Object)
const iterateDynamicGrid = (grid: any): Array<{ number: number; count: number }> => {
  const out: Array<{ number: number; count: number }> = [];
  if (!grid) return out;

  // If it's a Map
  if (typeof grid.forEach === "function" && !(grid instanceof Array)) {
    try {
      grid.forEach((count: number, key: any) => {
        const num = Number(key);
        if (!Number.isNaN(num)) out.push({ number: num, count: Number(count) });
      });
      return out;
    } catch (e) { /* fallback */ }
  }

  // If it's an Array
  if (Array.isArray(grid)) {
    grid.forEach((count, idx) => {
      const num = Number(idx);
      if (!Number.isNaN(num)) out.push({ number: num, count: Number(count ?? 0) });
    });
    return out;
  }

  // If it's an object with numeric keys
  Object.keys(grid).forEach((k) => {
    const num = Number(k);
    if (!Number.isNaN(num)) out.push({ number: num, count: Number(grid[k] ?? 0) });
  });

  return out;
};

// quick check whether block is present (for debug UI)
const exists = (x: any) => !!x && Object.keys(x || {}).length > 0;

// -------------------- Dynamic components (fixed) --------------------

// DynamicAdvancedRemediesDisplay: uses DATA.multipleNumberRemedies
const DynamicAdvancedRemediesDisplay: React.FC<{ dynamicGrid: any }> = ({ dynamicGrid }) => {
  const applicableRemedies = useMemo(() => {
    const remediesList: Array<{ number: number; focus?: any; recommendation?: any }> = [];
    if (!dynamicGrid) return remediesList;

    const items = iterateDynamicGrid(dynamicGrid);
    items.forEach(({ number, count }) => {
      if (count > 3) {
        const remedy = (DATA && (DATA.multipleNumberRemedies ?? DATA.multipleNumberRemedies)) ? getByNumber(DATA.multipleNumberRemedies, number) : null;
        if (remedy) {
          remediesList.push({
            number,
            focus: remedy.focus ?? remedy.title ?? remedy.general,
            recommendation: remedy.recommendation ?? remedy.text ?? remedy.recommendation,
          });
        }
      }
    });
    return remediesList;
  }, [dynamicGrid]);

  if (applicableRemedies.length === 0) return null;

  return (
    <Card>
      <div className="mb-3">
        <h3 className="text-lg font-bold text-yellow-400">Dynamic Advanced Remedies</h3>
        <p className="text-sm text-yellow-200/70">Triggered because the active Dasha(s) increased certain numbers beyond the threshold.</p>
      </div>

      <div className="space-y-4">
        {applicableRemedies.map((rem) => (
          <div key={rem.number} className="p-4 bg-indigo-900/40 border-l-4 border-indigo-400 rounded-r-lg">
            <h4 className="text-indigo-300 font-bold text-xl">For Amplified Number {rem.number}: {typeof rem.focus === "string" ? rem.focus : safeText(rem.focus)}</h4>
            <p className="mt-2 text-gray-300">{typeof rem.recommendation === "string" ? rem.recommendation : safeText(rem.recommendation)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

// DynamicSpecialGuidanceDisplay: uses a checkForSpecialRemedies function (you already use one in your codebase)
// We'll attempt to call it if present on window or DATA; otherwise try to read DATA.specialRudrakshaRemedies & DATA.destinyBasedRemedies
const DynamicSpecialGuidanceDisplay: React.FC<{
  dynamicGrid: any;
  destinyNumber?: number | null;
  mahaDasha?: number | null;
  annualDasha?: number | null;
}> = ({ dynamicGrid, destinyNumber, mahaDasha, annualDasha }) => {
  // Attempt to use the project's `checkForSpecialRemedies` if it's globally available (you showed it earlier).
  // If not present, we fall back to scanning DATA.specialRudrakshaRemedies and DATA.destinyBasedRemedies.
  const fallbackSpecials = useMemo(() => {
    const out: any[] = [];
    if (DATA.specialRudrakshaRemedies) {
      // iterate numbers present in dynamicGrid
      const items = iterateDynamicGrid(dynamicGrid);
      items.forEach(({ number, count }) => {
        if (count > 0) {
          const node = getByNumber(DATA.specialRudrakshaRemedies, number);
          if (node) out.push({ type: "detailedRudraksha", ...node, number });
        }
      });
    }
    if (destinyNumber && DATA.destinyBasedRemedies) {
      const dnode = getByNumber(DATA.destinyBasedRemedies, destinyNumber);
      if (dnode) out.push({ type: "destinyBased", ...dnode, number: destinyNumber });
    }
    return out;
  }, [dynamicGrid, destinyNumber]);

  // If a global checkForSpecialRemedies function exists, prefer it.
  const specialRemedies = useMemo(() => {
    try {
      // @ts-ignore
      if (typeof (window as any).checkForSpecialRemedies === "function") {
        // call the site's function with the same signature you used earlier
        // @ts-ignore
        const res = (window as any).checkForSpecialRemedies(dynamicGrid, destinyNumber, mahaDasha, annualDasha);
        if (Array.isArray(res) && res.length > 0) return res;
      }
    } catch (e) { /* ignore */ }
    return fallbackSpecials;
  }, [dynamicGrid, destinyNumber, mahaDasha, annualDasha, fallbackSpecials]);

  if (!specialRemedies || specialRemedies.length === 0) return null;

  const SimpleRemedy = ({ remedy }: { remedy: any }) => (
    <div className="p-4 bg-red-900/40 border-l-4 border-red-400 rounded-r-lg">
      <h3 className="font-bold text-red-300 text-lg">{safeText(remedy.title)}</h3>
      <p className="text-red-200/90 mt-2">{safeText(remedy.text ?? remedy.recommendation ?? remedy.significance)}</p>
    </div>
  );

  const DetailedRudrakshaRemedy = ({ remedy }: { remedy: any }) => (
    <div className="p-4 bg-teal-900/40 border-l-4 border-teal-400 rounded-r-lg">
      <h3 className="font-bold text-teal-300 text-lg">{safeText(remedy.title ?? remedy.rudrakshaName)}</h3>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-900/50 p-3 rounded-md"><strong>Rudraksha:</strong> {safeText(remedy.rudrakshaName)}</div>
        <div className="bg-gray-900/50 p-3 rounded-md"><strong>Deity:</strong> {safeText(remedy.deity)}</div>
        <div className="bg-gray-900/50 p-3 rounded-md"><strong>Ruling Planet:</strong> {safeText(remedy.rulingPlanet)}</div>
        <div className="bg-gray-900/50 p-3 rounded-md"><strong>Mantra:</strong> {safeText(remedy.mantra)}</div>
        <div className="bg-gray-900/50 p-3 rounded-md col-span-1 md:col-span-2"><strong>Significance:</strong> {safeText(remedy.significance)}</div>
        <div className="bg-gray-900/50 p-3 rounded-md col-span-1 md:col-span-2"><strong>Benefits:</strong> {safeText(remedy.benefits)}</div>
        <div className="bg-gray-900/50 p-3 rounded-md col-span-1 md:col-span-2"><strong>Remedy For:</strong> {safeText(remedy.remedyFor)}</div>
        <div className="bg-gray-900/50 p-3 rounded-md col-span-1 md:col-span-2"><strong>Who Should Wear:</strong> {safeText(remedy.whoShouldWear)}</div>
        <div className="bg-gray-900/50 p-3 rounded-md"><strong>Availability:</strong> {safeText(remedy.availability)}</div>
        <div className="bg-gray-900/50 p-3 rounded-md"><strong>Form:</strong> {safeText(remedy.form)}</div>
      </div>
    </div>
  );

  return (
    <Card>
      <div className="mb-3">
        <h3 className="text-lg font-bold text-yellow-400">Dynamic Special Guidance</h3>
        <p className="text-sm text-yellow-200/70">Triggered by your chart's interaction with selected Dasha periods.</p>
      </div>

      <div className="space-y-6">
        {specialRemedies.map((remedy: any, idx: number) => {
          if (remedy.type === "detailedRudraksha" || remedy.type === "detailedRudrakshaRemedy") {
            return <DetailedRudrakshaRemedy key={idx} remedy={remedy} />;
          }
          return <SimpleRemedy key={idx} remedy={remedy} />;
        })}
      </div>
    </Card>
  );
};

// -------------------- Remedies Final Tab --------------------
export default function RemediesFinal({
  language = DEFAULT_LANG,
  selectedDateLabel,
}: {
  language?: Lang;
  selectedDateLabel?: string;
}) {
  // Use report context
  const { report, dashaReport, advancedDasha } = useReport() || ({} as any);
  const basic = report?.basicNumber ?? null;
  const destiny = report?.destinyNumber ?? null;
  const baseGrid = report?.baseKundliGrid ?? null;

  // find overlays (best effort: pick maha/yearly/monthly/daily structures if available)
  const today = new Date();
  const findActiveNumber = (timeline: any[]) => {
    if (!Array.isArray(timeline)) return undefined;
    const found = timeline.find((t: any) => {
      const start = new Date(t.startDate ?? t.start ?? t.from ?? t.fromDate);
      const end = new Date(t.endDate ?? t.end ?? t.to ?? t.toDate);
      return !isNaN(start.getTime()) && !isNaN(end.getTime()) && today >= start && today <= end;
    });
    return found ? Number(found.dashaNumber ?? found.dasha ?? found.num ?? found.value) : undefined;
  };

  const overlays = {
    maha: findActiveNumber(dashaReport?.mahaDashaTimeline ?? advancedDasha?.mahaDashaTimeline),
    yearly: findActiveNumber(dashaReport?.yearlyDashaTimeline ?? advancedDasha?.yearlyDashaTimeline),
    monthly: findActiveNumber(dashaReport?.monthlyDashaTimeline ?? advancedDasha?.monthlyDashaTimeline),
    daily: undefined,
  };

  // dynamicGrid default: use baseKundliGrid if present, else compute from overlays
  const dynamicGrid = useMemo(() => {
    if (baseGrid) {
      // baseGrid could be array or object — prefer array-like
      if (Array.isArray(baseGrid)) return baseGrid;
      // else convert to array 0..9
      const arr = new Array(10).fill(0);
      Object.keys(baseGrid).forEach(k => {
        const num = Number(k);
        if (!Number.isNaN(num)) arr[num] = Number(baseGrid[k] ?? 0);
      });
      // add overlays
      [overlays.maha, overlays.yearly, overlays.monthly, overlays.daily].forEach((n) => {
        if (n && !Number.isNaN(Number(n))) arr[Number(n)] = (arr[Number(n)] ?? 0) + 1;
      });
      return arr;
    }
    // fallback: compute from overlays only
    const arr = new Array(10).fill(0);
    [overlays.maha, overlays.yearly, overlays.monthly, overlays.daily].forEach((n) => {
      if (n && !Number.isNaN(Number(n))) arr[Number(n)] = (arr[Number(n)] ?? 0) + 1;
    });
    return arr;
  }, [baseGrid, overlays.maha, overlays.yearly, overlays.monthly, overlays.daily]);

  // Find data blocks in DATA (defensive)
  const remediesBlock = DATA.remedies ?? DATA.remediesGeneral ?? DATA.remediesLifestyle ?? null;
  const multiplicityBlock = DATA.multipleNumberRemedies ?? null;
  const planetaryBlock = DATA.mantraRemedies ?? DATA.mantraRemediesPlanetary ?? null;
  const rudrakshaBlock = DATA.rudrakshaRemedies ?? null;
  const specialRudrakshaBlock = DATA.specialRudrakshaRemedies ?? null;
  const destinyBasedBlock = DATA.destinyBasedRemedies ?? null;
  const beejBlock = DATA.shaktiBeejMantras ?? null;

  const overlayLabel =
    [
      overlays.maha && `Maha ${overlays.maha}`,
      overlays.yearly && `Yearly ${overlays.yearly}`,
      overlays.monthly && `Monthly ${overlays.monthly}`,
      overlays.daily && `Daily ${overlays.daily}`,
    ].filter(Boolean).join(" • ") || "—";

  // helper for rendering standard remedy card (general/mantra/donation)
  const renderRemedyCard = (title: string, number: number | null) => {
    if (!number) return null;
    const node = getByNumber(remediesBlock, number);
    if (!node) {
      return (
        <Card key={`missing-${title}-${number}`} className="p-4">
          <h4 className="font-bold text-yellow-400">{title} (#{number})</h4>
          <p className="text-sm text-gray-300">No entry found in DATA.remedies for this number.</p>
        </Card>
      );
    }
    return (
      <Card key={`remedy-${title}-${number}`} className="p-4">
        <h4 className="font-bold text-yellow-400">{title} (#{number})</h4>
        <div className="mt-2 space-y-2 text-sm text-gray-200">
          {node.general && <div><strong>General:</strong> {safeText(node.general, language)}</div>}
          {node.mantra && <div><strong>Mantra:</strong> <span className="italic">{safeText(node.mantra, language)}</span></div>}
          {node.donation && <div><strong>Donation:</strong> {safeText(node.donation, language)}</div>}
        </div>
      </Card>
    );
  };

  const beejList = beejBlock ? Object.keys(beejBlock).map(k => ({ key: k, node: beejBlock[k] })) : [];

  // Tabs state
  const [tab, setTab] = useState<"overview" | "multiplicity" | "planetary" | "rudraksha" | "special" | "beej">("overview");

  return (
    <div className="space-y-6">
      <div className="text-sm px-3 py-2 rounded bg-gray-900/40 text-gray-300 border border-gray-700/40 mb-3">
        <span className="mr-3"><b>Date:</b> {selectedDateLabel || "Today"}</span>
        <span className="mr-3"><b>Basic:</b> {basic ?? "—"}</span>
        <span className="mr-3"><b>Destiny:</b> {destiny ?? "—"}</span>
        <span className="mr-3"><b>Overlays:</b> {overlayLabel}</span>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="multiplicity">Multiplicity</TabsTrigger>
          <TabsTrigger value="planetary">Planetary</TabsTrigger>
          <TabsTrigger value="rudraksha">Rudraksha</TabsTrigger>
          <TabsTrigger value="special">Special</TabsTrigger>
          <TabsTrigger value="beej">Beej</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {renderRemedyCard("Basic Remedy", basic)}
            {renderRemedyCard("Destiny Remedy", destiny)}
          </div>

          {/* Quick planetary peek */}
          <div className="mt-4">
            <Card className="p-4">
              <h3 className="text-lg font-bold text-yellow-400">Planetary Reminders (quick)</h3>
              <p className="text-sm text-yellow-200/70 mb-3">A short glance at planetary mantras if available.</p>
              {!planetaryBlock && <p className="text-sm text-gray-300">Planetary data not found in DATA.mantraRemedies.</p>}
              {planetaryBlock && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => {
                    const node = getByNumber(planetaryBlock, n);
                    if (!node) return null;
                    return (
                      <div key={`p-${n}`} className="rounded-md p-3 bg-gray-900/50">
                        <div className="font-semibold text-gray-100 mb-1">Number {n}</div>
                        <div className="text-sm">
                          {node.planet && <div><b>Planet:</b> {safeText(node.planet, language)}</div>}
                          {node.mantra && <div><b>Mantra:</b> {safeText(node.mantra, language)}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* Multiplicity (dynamic advanced) */}
        <TabsContent value="multiplicity" className="mt-4">
          <div className="space-y-4">
            <DynamicAdvancedRemediesDisplay dynamicGrid={dynamicGrid} />
            {/* Also show multiplicity block if present */}
            <Card>
              <h3 className="text-lg font-bold text-yellow-400 mb-2">Multiplicity Reference Data</h3>
              {!multiplicityBlock && <p className="text-sm text-gray-300">No DATA.multipleNumberRemedies block found.</p>}
              {multiplicityBlock && (
                <div className="grid grid-cols-1 gap-3">
                  {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => {
                    const node = getByNumber(multiplicityBlock, n);
                    if (!node) return null;
                    return (
                      <div key={`mref-${n}`} className="p-3 bg-gray-900/50 rounded-md">
                        <div className="font-semibold text-yellow-300">#{n}</div>
                        {node.focus && <div className="text-sm text-gray-200"><b>Focus:</b> {safeText(node.focus, language)}</div>}
                        {node.recommendation && <div className="text-sm text-gray-200"><b>Recommendation:</b> {safeText(node.recommendation, language)}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* Planetary */}
        <TabsContent value="planetary" className="mt-4">
          <Card>
            <h3 className="text-lg font-bold text-yellow-400">Planetary Mantra Remedies</h3>
            {!planetaryBlock && <p className="text-sm text-gray-300">Planetary block missing in DATA.mantraRemedies.</p>}
            {planetaryBlock && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {Array.from({ length: 9 }, (_, i) => i + 1).map(n => {
                  const node = getByNumber(planetaryBlock, n);
                  if (!node) return null;
                  return (
                    <div key={`pl-${n}`} className="p-3 bg-gray-900/50 rounded-md">
                      <div className="font-semibold text-gray-100">Number {n}</div>
                      <div className="text-sm mt-1">
                        {node.planet && <div><b>Planet:</b> {safeText(node.planet, language)}</div>}
                        {node.mantra && <div><b>Mantra:</b> {safeText(node.mantra, language)}</div>}
                        {node.deity && <div><b>Deity:</b> {safeText(node.deity, language)}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Rudraksha */}
        <TabsContent value="rudraksha" className="mt-4">
          <Card>
            <h3 className="text-lg font-bold text-yellow-400">Rudraksha Remedies</h3>
            {!rudrakshaBlock && <p className="text-sm text-gray-300">Rudraksha data not found in DATA.rudrakshaRemedies.</p>}
            {rudrakshaBlock && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {Array.from({ length: 9 }, (_, i) => i + 1).map(n => {
                  const node = getByNumber(rudrakshaBlock, n);
                  if (!node) return null;
                  return (
                    <div key={`r-${n}`} className="p-3 bg-gray-900/50 rounded-md">
                      <div className="font-semibold text-gray-100">Number {n}</div>
                      <div className="text-sm mt-1">
                        {node.mukhi && <div><b>Mukhi:</b> {safeText(node.mukhi, language)}</div>}
                        {node.mantra && <div><b>Mantra:</b> {safeText(node.mantra, language)}</div>}
                        {node.benefits && <div><b>Benefits:</b> {safeText(node.benefits.general ?? node.benefits)}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Special */}
        <TabsContent value="special" className="mt-4">
          <div className="space-y-4">
            <DynamicSpecialGuidanceDisplay
              dynamicGrid={dynamicGrid}
              destinyNumber={destiny}
              mahaDasha={overlays.maha}
              annualDasha={overlays.yearly}
            />
            <Card>
              <h3 className="text-lg font-bold text-yellow-400">Special / Destiny-based Reference</h3>
              {!specialRudrakshaBlock && !destinyBasedBlock && <p className="text-sm text-gray-300">No special or destiny-based blocks found in DATA.</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {specialRudrakshaBlock && Array.from({ length: 9 }, (_, i) => i + 1).map(n => {
                  const node = getByNumber(specialRudrakshaBlock, n);
                  if (!node) return null;
                  return (
                    <div key={`sr-${n}`} className="p-3 bg-gray-900/50 rounded-md">
                      <div className="font-semibold text-gray-100">Special Rudraksha #{n}</div>
                      <div className="text-sm">{safeText(node.title ?? node.rudrakshaName, language)}</div>
                    </div>
                  );
                })}
                {destinyBasedBlock && destiny && (() => {
                  const node = getByNumber(destinyBasedBlock, destiny);
                  if (!node) return null;
                  return (
                    <div key={`db-${destiny}`} className="p-3 bg-gray-900/50 rounded-md">
                      <div className="font-semibold text-gray-100">Destiny Based #{destiny}</div>
                      <div className="text-sm">{safeText(node.title ?? node.rudrakshaName, language)}</div>
                    </div>
                  );
                })()}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Beej */}
        <TabsContent value="beej" className="mt-4">
          <Card>
            <h3 className="text-lg font-bold text-yellow-400">Shakti Beej Mantras</h3>
            {!beejBlock && <p className="text-sm text-gray-300">Shakti Beej block not found in DATA.shaktiBeejMantras.</p>}
            {beejBlock && (
              <ul className="list-disc ml-5 mt-3 space-y-1">
                {Object.keys(beejBlock).map((k) => (
                  <li key={k} className="text-sm text-gray-200">
                    <strong>{k}</strong>: {safeText(beejBlock[k].purpose ?? beejBlock[k].beej, language)}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
