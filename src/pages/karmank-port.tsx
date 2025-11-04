// src/pages/karmank-port.tsx
import React, { useState, useMemo } from "react";
import { DATA } from "@/lib/numerology/data";
import {
  reduceToSingleDigit,
  calculateLifePath,
  calculateNameNumber,
  getText,
  countDigits,
} from "@/lib/numerology/utils";

// Simple shell page where we'll paste the ported Kundli UI
export default function KarmAnkPortPage() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [lang, setLang] = useState<"en" | "hi" | "en-hi">("en");

  // Basic numbers (strict—no master numbers per your decision)
  const destinyNumber = useMemo(() => (dob ? calculateLifePath(dob) : 0), [dob]);
  const nameNumber = useMemo(
    () => (name ? calculateNameNumber(name, "chaldean") : 0),
    [name]
  );
  const gridCounts = useMemo(() => (dob ? countDigits(dob) : {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0}), [dob]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">KarmAnk Kundli (Port Sandbox)</h1>

      {/* Inputs */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm mb-1">Full Name</label>
          <input
            className="w-full rounded-xl px-4 py-3 bg-[#0e1a2b]/60 border border-[#35c6f2]/30 focus:border-[#35c6f2] outline-none text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Date of Birth (DD/MM/YYYY)</label>
          <input
            className="w-full rounded-xl px-4 py-3 bg-[#0e1a2b]/60 border border-[#35c6f2]/30 focus:border-[#35c6f2] outline-none text-white"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            placeholder="12/05/1992"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Language</label>
          <select
            className="w-full rounded-xl px-4 py-3 bg-[#0e1a2b]/60 border border-[#35c6f2]/30 focus:border-[#35c6f2] outline-none text-white"
            value={lang}
            onChange={(e) => setLang(e.target.value as any)}
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="en-hi">Hinglish</option>
          </select>
        </div>
      </div>

      {/* === PASTE AREA (next step) ===
         From your file “KArmank_With autogenerate data, Chatbot and audio.txt”,
         copy the Kundli grid UI block and supporting bits here. Your file’s grid
         uses color layers/gradients per DATA.colorMap and active numbers logic,
         e.g. the 3×3 with background gradients and count repeats (see your file’s
         snippet that computes cell background and renders a 3×3 grid). 
         We'll hook those imports to our DATA and utils.
      */}

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-black/30 border border-white/10">
          <div className="text-sm opacity-80">Destiny Number</div>
          <div className="text-2xl font-bold">{destinyNumber || "-"}</div>
        </div>
        <div className="p-4 rounded-xl bg-black/30 border border-white/10">
          <div className="text-sm opacity-80">Name Number (Chaldean)</div>
          <div className="text-2xl font-bold">{nameNumber || "-"}</div>
        </div>
        <div className="p-4 rounded-xl bg-black/30 border border-white/10">
          <div className="text-sm opacity-80">Strongest Digit (DOB grid)</div>
          <div className="text-2xl font-bold">
            {Object.entries(gridCounts)
              .sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || "-"}
          </div>
        </div>
      </div>
    </div>
  );
}
