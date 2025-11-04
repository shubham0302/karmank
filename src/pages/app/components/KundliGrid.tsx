// src/pages/app/components/KundliGrid.tsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import { computeKundliGrid, type Language } from "@/lib/numerology/compute";
import { calculateLifePath } from "@/lib/numerology/utils";
import { Sparkles, Info, Eye, EyeOff, Download, Save, Play } from "lucide-react";

type Gender = "" | "male" | "female" | "other";

interface KundliGridProps {
  dob: string;
  showPlanes: boolean;
  lang: Language;
  onSave?: () => void;
  onPdf?: () => void;
  onSpeak?: () => void;

  // Optional profile wiring from parent
  name?: string;
  gender?: Gender;
  onChangeName?: (v: string) => void;
  onChangeGender?: (v: Gender) => void;
  onChangeDob?: (v: string) => void;

  // NEW: reuse this component as a compact/read-only widget
  hideHeaderInputs?: boolean; // if true, hides the Name/Gender/DOB inputs
  condensed?: boolean;        // if true, hides legend + right-side analysis panel
}

/* ---------------- helpers for Basic/Destiny ---------------- */
const reduce1to9 = (n: number): number => {
  let x = Math.abs(n);
  while (x > 9) x = String(x).split("").reduce((a, d) => a + parseInt(d, 10), 0);
  return x;
};

const parseDobParts = (s: string) => {
  const m = s.match(/^\s*(\d{1,2})\D+(\d{1,2})\D+(\d{2,4})\s*$/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const yr = m[3];
  const year = yr.length === 2 ? parseInt(`20${yr}`, 10) : parseInt(yr, 10);
  return { day, month, year };
};

export default function KundliGrid({
  dob,
  showPlanes,
  lang,
  onSave,
  onPdf,
  onSpeak,
  name,
  gender,
  onChangeName,
  onChangeGender,
  onChangeDob,
  hideHeaderInputs = false,  // NEW
  condensed = false,         // NEW
}: KundliGridProps) {
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [inputDob, setInputDob] = useState(dob || "");
  const [inputName, setInputName] = useState(name ?? "");
  const [inputGender, setInputGender] = useState<Gender>(gender ?? "");
  const [showPlanesToggle, setShowPlanesToggle] = useState<boolean>(condensed ? false : !!showPlanes); // NEW

  // ref to scroll the details panel into view
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const openNumberDetails = (n: number) => {
    setSelectedCell(n);
    setTimeout(() => detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  // keep local inputs in sync if parent props change
  useEffect(() => setInputDob(dob || ""), [dob]);
  useEffect(() => setInputName(name ?? ""), [name]);
  useEffect(() => setInputGender(gender ?? ""), [gender]);

  // Recompute on typed value
  const effectiveDob = hideHeaderInputs ? dob : inputDob;
  const result = effectiveDob ? computeKundliGrid(effectiveDob, lang) : null;

  // Basic/Destiny numbers (for badges & header chips)
  const { basic, destiny } = useMemo(() => {
    const p = parseDobParts(effectiveDob);
    if (!p) return { basic: null as number | null, destiny: null as number | null };
    const b = reduce1to9(p.day);
    let d = calculateLifePath(
      `${String(p.day).padStart(2, "0")}/${String(p.month).padStart(2, "0")}/${String(p.year)}`
    );
    if (d > 9) d = reduce1to9(d);
    return { basic: b, destiny: d };
  }, [effectiveDob]);

  const getCellIntensity = (number: number) => {
    if (!result) return "dim";
    const count = result.counts[number] || 0;
    if (count === 0) return "dim";
    if (count === 1) return "base";
    if (count === 2) return "bright";
    return "pulse";
  };

  const getCellStyle = (intensity: string) => {
    const baseStyle =
      "relative flex items-center justify-center text-2xl font-bold rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden p-1";
    switch (intensity) {
      case "dim":
        return `${baseStyle} bg-cosmic-blue/20 border-primary/20 text-foreground/40 hover:bg-cosmic-blue/30`;
      case "base":
        return `${baseStyle} bg-cosmic-blue/40 border-auric-gold/30 text-auric-gold hover:bg-cosmic-blue/50 cosmic-glow`;
      case "bright":
        return `${baseStyle} bg-nebula-violet/30 border-auric-gold/50 text-auric-gold shadow-lg cosmic-glow hover:scale-105`;
      case "pulse":
        return `${baseStyle} bg-gradient-auric border-auric-gold text-cosmic-blue shadow-2xl animate-glow hover:scale-105`;
      default:
        return baseStyle;
    }
  };

  const getPlaneStatus = (status: string) => {
    switch (status) {
      case "strong":
        return { color: "text-green-400", label: "Strong" };
      case "balanced":
        return { color: "text-auric-gold", label: "Balanced" };
      case "weak":
        return { color: "text-orange-400", label: "Weak" };
      case "missing":
        return { color: "text-red-400", label: "Missing" };
      default:
        return { color: "text-gray-400", label: "Unknown" };
    }
  };

  // Missing numbers 1–9 based on counts
  const missingNumbers = useMemo(() => {
    if (!result) return [];
    return Array.from({ length: 9 }, (_, i) => i + 1).filter((n) => (result.counts[n] || 0) === 0);
  }, [result]);

  return (
    <div className="space-y-6">
      {/* Input Section (hidden in compact mode) */}
      {!hideHeaderInputs && (
        <GlassCard variant="subtle" size="sm">
          <div className="flex flex-col lg:flex-row items-end gap-4">
            {/* Name */}
            <div className="flex-1">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={inputName}
                onChange={(e) => {
                  const v = e.target.value;
                  setInputName(v);
                  onChangeName?.(v);
                }}
                className="bg-background/50 border-primary/30 focus:border-auric-gold"
              />
            </div>

            {/* Gender */}
            <div className="w-full sm:w-48">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                className="w-full h-10 rounded-md border bg-background/50 border-primary/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-auric-gold/50"
                value={inputGender}
                onChange={(e) => {
                  const v = e.target.value as Gender;
                  setInputGender(v);
                  onChangeGender?.(v);
                }}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* DOB */}
            <div className="flex-1">
              <Label htmlFor="dob">Date of Birth (DD/MM/YYYY)</Label>
              <Input
                id="dob"
                type="text"
                placeholder="22/04/1987"
                value={inputDob}
                onChange={(e) => {
                  const v = e.target.value;
                  setInputDob(v);
                  onChangeDob?.(v);
                }}
                className="bg-background/50 border-primary/30 focus:border-auric-gold"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPlanesToggle(!showPlanesToggle)}
                className="border-primary/30"
              >
                {showPlanesToggle ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                Planes
              </Button>

              {result && (
                <>
                  <Button variant="outline" size="sm" onClick={onSpeak} className="border-primary/30">
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={onSave} className="border-primary/30">
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={onPdf} className="border-primary/30">
                    <Download className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </GlassCard>
      )}

      {result && (
        <div className={`grid grid-cols-1 ${condensed ? "" : "lg:grid-cols-3"} gap-6`}>
          {/* Kundli Grid */}
          <div className={condensed ? "" : "lg:col-span-2"}>
            <GlassCard variant="cosmic" className="relative overflow-hidden">
              {/* Sri Yantra Background */}
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  <g fill="currentColor" className="text-auric-gold">
                    <polygon points="100,20 130,80 170,80 140,120 160,180 100,150 40,180 60,120 30,80 70,80" />
                    <polygon points="100,40 120,70 150,70 130,100 140,140 100,120 60,140 70,100 50,70 80,70" />
                    <circle cx="100" cy="100" r="15" />
                  </g>
                </svg>
              </div>

              <div className="relative z-10 space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-serif font-semibold flex items-center justify-center gap-2">
                    <Sparkles className="h-5 w-5 text-auric-gold" />
                    Cosmic Vedic Kundli (3×3)
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sacred numerological matrix from your birth date
                  </p>

                  {/* Basic/Destiny legend with live values */}
                  <div className="mt-2 flex items-center justify-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-500/80 text-white text-[10px] font-bold">
                        B
                      </span>
                      Basic (from Day)
                      {typeof basic === "number" && (
                        <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-emerald-600/70 text-white font-bold">
                          {basic}
                        </span>
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-amber-500/80 text-white text-[10px] font-bold">
                        D
                      </span>
                      Destiny (full DOB)
                      {typeof destiny === "number" && (
                        <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-amber-600/80 text-white font-bold">
                          {destiny}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* 3x3 Grid */}
                <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                  {result.matrix.flat().map((number, index) => {
                    const intensity = getCellIntensity(number);
                    const count = result.counts[number] || 0;

                    return (
                      <motion.div
                        key={index}
                        className={getCellStyle(intensity)}
                        style={{ aspectRatio: "1" }}
                        onClick={() => setSelectedCell(selectedCell === number ? null : number)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {/* repeats inside the cell (blank if missing) */}
                        {count > 0 && (
                          <span
                            className={`${
                              count >= 6 ? "text-sm" : count >= 4 ? "text-lg" : "text-2xl"
                            } break-all leading-tight text-center px-1`}
                            style={{ lineHeight: 1.1 }}
                          >
                            {String(number).repeat(count)}
                          </span>
                        )}

                        {/* Corner badges for Basic/Destiny */}
                        {basic === number && (
                          <div className="absolute top-1 left-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/80 text-white">
                            B
                          </div>
                        )}
                        {destiny === number && (
                          <div className="absolute top-1 right-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/80 text-white">
                            D
                          </div>
                        )}

                        {/* Plane overlays */}
                        {showPlanesToggle && (
                          <>
                            {[1, 4, 7].includes(number) && (
                              <div className="absolute inset-0 border-2 border-green-400/40 rounded-xl pointer-events-none" />
                            )}
                            {[3, 6, 9].includes(number) && (
                              <div className="absolute inset-0 border-2 border-blue-400/40 rounded-xl pointer-events-none" />
                            )}
                            {[2, 5, 8].includes(number) && (
                              <div className="absolute inset-0 border-2 border-purple-400/40 rounded-xl pointer-events-none" />
                            )}
                          </>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Legend — hidden in condensed mode */}
                {!condensed && (
                  <div className="text-center space-y-2 text-xs text-muted-foreground">
                    <p>Intensity: Missing (dim) • Present (glow) • Strong (bright) • Dominant (pulse)</p>
                    {showPlanesToggle && (
                      <div className="flex justify-center space-x-4 text-xs">
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 border border-green-400 rounded" />
                          Physical (1,4,7)
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 border border-blue-400 rounded" />
                          Mental (3,6,9)
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 border border-purple-400 rounded" />
                          Emotional (2,5,8)
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Analysis Panel — hidden in condensed mode */}
          {!condensed && (
            <div className="space-y-4">
              <GlassCard variant="elevated" size="sm">
                <h4 className="font-serif font-semibold mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4 text-auric-gold" />
                  Cosmic Summary
                </h4>
                <p className="text-sm leading-relaxed">{result.summary}</p>
              </GlassCard>

              <GlassCard variant="elevated" size="sm">
                <h4 className="font-serif font-semibold mb-3">Plane Analysis</h4>
                <div className="space-y-2">
                  {Object.entries(result.planes).map(([plane, data]) => {
                    const status = getPlaneStatus((data as any).status);
                    return (
                      <div key={plane} className="flex items-center justify-between text-sm">
                        <span className="capitalize font-medium">{plane}</span>
                        <span className={status.color}>{status.label}</span>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>

              <GlassCard variant="subtle" size="sm">
                <h4 className="font-serif font-semibold mb-3">Number Frequency</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
                    <div key={num} className="flex items-center justify-between p-1 rounded bg-background/30">
                      <span>{num}</span>
                      <span className={result.counts[num] > 0 ? "text-auric-gold" : "text-muted-foreground"}>
                        {result.counts[num] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* --- Missing Numbers --- */}
              <GlassCard variant="subtle" size="sm">
                <h4 className="font-serif font-semibold mb-3">What’s Missing</h4>

                {missingNumbers.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {missingNumbers.map((n) => (
                      <button
                        key={n}
                        onClick={() => openNumberDetails(n)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border border-red-400/40 text-red-300 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                        title={`Digit ${n} is missing. Click to view its essence & remedies.`}
                      >
                        ● {n}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-emerald-300">
                    None 🎉 — all digits 1–9 are represented at least once.
                  </div>
                )}

                <p className="text-[11px] mt-2 text-muted-foreground">
                  Tip: A missing digit highlights a growth area. Use remedies and mindful actions aligned to that number.
                </p>
              </GlassCard>
            </div>
          )}
        </div>
      )}

      {/* Selected Cell Details */}
      <AnimatePresence>
        {selectedCell && !condensed && (
          <motion.div
            ref={detailsRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <GlassCard variant="cosmic">
              <div className="space-y-3">
                <h4 className="font-serif font-semibold text-auric-gold">Number {selectedCell} Cosmic Essence</h4>
                <p className="text-sm leading-relaxed">
                  This sacred number carries the vibration of leadership, independence, and pioneering spirit. In your
                  cosmic matrix, it appears {result?.counts[selectedCell] || 0} times,
                  {result?.counts[selectedCell] === 0 && " indicating an area for conscious development."}
                  {result?.counts[selectedCell] === 1 && " showing balanced energy."}
                  {(result?.counts[selectedCell] || 0) >= 2 && " revealing dominant cosmic influence."}
                </p>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-medium text-auric-gold">Remedy:</span>
                    <p>Om Surya Namaha daily meditation</p>
                  </div>
                  <div>
                    <span className="font-medium text-auric-gold">Colors:</span>
                    <p>Orange, Gold, Red</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
