// src/components/HoloDestinyCard.tsx
import React from "react";
import { motion } from "framer-motion";

type Props = {
  title: string;
  blurb: string;
  ctaLabel: string;
  onPrimary: () => void;
  className?: string;
};

export default function HoloDestinyCard({
  title,
  blurb,
  ctaLabel,
  onPrimary,
  className = "",
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`relative w-full ${className}`}
    >
      {/* Cosmic aura behind the card */}
      <div
        className="absolute -inset-4 -z-10 rounded-[28px] opacity-50 blur-2xl"
        style={{
          background:
            "radial-gradient(circle at 50% 35%, rgba(84,150,255,.35) 0%, rgba(84,150,255,0.0) 55%)",
        }}
      />

      {/* Deep blue frame */}
      <div
        className="
          relative p-[2px] rounded-3xl ring-1 ring-blue-300/20
          shadow-[0_0_24px_6px_rgba(56,120,248,0.12)]
        "
        style={{
          background:
            "linear-gradient(135deg, rgba(13,28,60,0.9), rgba(9,22,48,0.9))",
        }}
      >
        {/* Glass core: fixed height + flex column so the CTA stays at the bottom */}
        <div className="relative h-[360px] md:h-[380px] rounded-[22px] overflow-hidden backdrop-blur-xl bg-transparent border border-white/10">
          {/* Subtle inner glow for depth */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(800px 420px at 50% 0%, rgba(42,78,140,0.18) 0%, transparent 60%), radial-gradient(700px 380px at 50% 100%, rgba(18,42,92,0.16) 0%, transparent 60%)",
            }}
          />

          {/* Tiny stars */}
          <div
            className="absolute inset-0 opacity-[0.10] mix-blend-screen pointer-events-none
                       bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.25)_0.5px,transparent_1px)]
                       bg-[length:3px_3px]"
          />

          {/* CONTENT */}
          <div className="relative z-10 h-full flex flex-col p-5 md:p-6">
            {/* Title */}
            <h3
              className="
                text-center text-xl md:text-2xl font-serif font-extrabold
                bg-[linear-gradient(90deg,#facc15_0%,#fbbf24_22%,#f9a8d4_60%,#c084fc_100%)]
                bg-clip-text text-transparent
                drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]
              "
            >
              {title}
            </h3>

            {/* Blurb */}
            <p className="mt-3 text-center text-white/85 tracking-[0.01em] leading-7 md:leading-7">
              {blurb}
            </p>

            {/* CTA pinned at the bottom */}
            <div className="mt-auto pt-4">
              <div className="flex justify-center">
                <button
                  onClick={onPrimary}
                  className="
                    w-full max-w-[200px]
                    px-5 py-2 rounded-xl
                    bg-gradient-to-r from-[#3b82f6] to-[#4f46e5]
                    text-white font-semibold
                    shadow-[0_8px_28px_rgba(59,130,246,0.25)]
                    hover:opacity-95 transition
                  "
                >
                  {ctaLabel}
                </button>
              </div>
            </div>
          </div>
          {/* /CONTENT */}
        </div>
      </div>
    </motion.div>
  );
}
