import React from "react";
import { motion } from "framer-motion";
import { StarfieldBackground } from "@/components/StarfieldBackground";

type Variant = "full" | "compact";

export default function CosmicHoloCard({
  emblem,
  title,
  blurb,
  primaryLabel,
  onPrimary,
  secondaryLabel = "Back to Gateway",
  onSecondary,
  variant = "full",
}: {
  emblem?: React.ReactNode;
  title: string;
  blurb: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary: () => void;
  variant?: Variant;
}) {
  const isFull = variant === "full";

  return (
    <div
      className={[
        isFull ? "min-h-screen p-6" : "min-h-0 p-0",
        "relative flex items-center justify-center overflow-hidden",
      ].join(" ")}
    >
      {isFull && <StarfieldBackground density={160} />}
      {isFull && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
          <div className="sri-yantra w-[22rem] h-[22rem] rounded-full opacity-30" />
        </div>
      )}

      <div
        className={[
          "relative z-10",
          isFull ? "max-w-2xl w-full" : "w-full",
        ].join(" ")}
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={[
            "holo",
            isFull
              ? "p-8 md:p-10"
              : "p-6 md:p-7 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl",
          ].join(" ")}
        >
          {/* Emblem */}
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full holo-ring grid place-items-center">
              {emblem}
            </div>
          </div>

          {/* Title – gradient text */}
          <h1
            className="
              text-center text-3xl md:text-4xl font-serif font-extrabold
              bg-[linear-gradient(90deg,#facc15_0%,#fbbf24_22%,#f9a8d4_60%,#c084fc_100%)]
              bg-clip-text text-transparent
              drop-shadow-[0_0_10px_rgba(255,255,255,.15)]
            "
          >
            {title}
          </h1>

          {/* Divider */}
          <div className="mt-5 mb-5 h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />

          {/* Blurb – visible */}
          <p className="text-white/90 leading-7 md:leading-8 tracking-[0.01em] text-center">
            {blurb}
          </p>

          {/* CTAs */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onPrimary}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-300 to-violet-400 text-slate-900 font-semibold hover:opacity-95 transition"
            >
              {primaryLabel}
            </button>
            <button
              onClick={onSecondary}
              className="px-5 py-2 rounded-lg border border-white/15 hover:border-amber-200/40 bg-white/5 text-white transition"
            >
              {secondaryLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
