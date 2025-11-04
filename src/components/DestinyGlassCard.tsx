import React from "react";
import { motion } from "framer-motion";

type Rim = "blue" | "auric" | "crimson";

interface Props {
  rim?: Rim;
  moduleTitle: string;
  blurb: string;
  cta: string;
  onClick: () => void;
  logoSrc?: string;
  className?: string;
}

export default function DestinyGlassCard({
  rim = "blue",
  moduleTitle,
  blurb,
  cta,
  onClick,
  logoSrc,
  className = "",
}: Props) {
  const rimClass =
    rim === "auric"
      ? "from-amber-400 via-rose-300 to-violet-400 ring-amber-300/25 shadow-[0_0_42px_8px_rgba(246,196,83,0.25)]"
      : rim === "crimson"
      ? "from-rose-500 via-pink-400 to-rose-400 ring-rose-300/25 shadow-[0_0_42px_8px_rgba(244,63,94,0.28)]"
      : "from-sky-500 via-cyan-400 to-indigo-400 ring-cyan-300/25 shadow-[0_0_42px_8px_rgba(56,189,248,0.25)]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`relative select-none ${className}`}
    >
      <div className={`relative p-[1.8px] rounded-[28px] bg-gradient-to-tr ${rimClass} ring-1`}>
        {/* glass core – translucent */}
        <div className="relative aspect-[3/4] w-full rounded-[24px] overflow-hidden border border-white/15 bg-white/5 backdrop-blur-xl">
          {/* subtle sheen only */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent" />

          <div className="relative z-10 h-full flex flex-col items-center justify-between p-6">
            <div className="mt-1 h-[56px] w-[56px] grid place-items-center rounded-full bg-white/8 border border-white/15">
              {logoSrc ? (
                <img src={logoSrc} alt="logo" className="h-8 w-8 object-contain drop-shadow-[0_0_10px_rgba(56,189,248,.45)]" />
              ) : (
                <div className="h-8 w-8" />
              )}
            </div>

            <h3 className="mt-2 text-center text-2xl md:text-[26px] font-serif font-bold text-white leading-tight">
              {moduleTitle}
            </h3>

            <p className="mt-3 text-center text-white/90 leading-relaxed">{blurb}</p>

            <button
              onClick={onClick}
              className="mt-5 mb-2 px-6 py-2 rounded-xl bg-gradient-to-r from-amber-300 to-violet-400 text-slate-900 font-semibold hover:opacity-95 transition"
            >
              {cta}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
