import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, BookText, Users, ScrollText, ArrowLeft } from "lucide-react";
import { StarfieldBackground } from "@/components/StarfieldBackground";
import CosmicHoloCard from "../Landing/_CosmicHoloCard";
import { useAppStore } from "@/store/appStore";
import { MODULE_COPY } from "@/modules/copy";

export default function ModulesStack() {
  const nav = useNavigate();
  const language = useAppStore((s) => s.language);
  const t = MODULE_COPY[language];

  return (
    <div className="relative">
      <StarfieldBackground density={140} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="sri-yantra w-[26rem] h-[26rem] rounded-full opacity-20" />
      </div>

      <section className="relative z-10 container mx-auto px-4 py-10 md:py-14">
        <div className="flex justify-start mb-8">
          <button
            onClick={() => nav("/welcome")}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-white hover:border-amber-200/40 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            {t.backLabel}
          </button>
        </div>

        <div className="flex flex-col gap-6 md:gap-8">
          <CosmicHoloCard
            variant="compact"
            emblem={<Sparkles className="h-7 w-7 text-amber-200" />}
            title={t.numerology.title}
            blurb={t.numerology.paragraph}
            primaryLabel={t.numerology.cta}
            onPrimary={() => nav(t.numerology.route)}
            secondaryLabel={t.backLabel}
            onSecondary={() => nav("/welcome")}
          />

          <CosmicHoloCard
            variant="compact"
            emblem={<BookText className="h-7 w-7 text-amber-200" />}
            title={t.name.title}
            blurb={t.name.paragraph}
            primaryLabel={t.name.cta}
            onPrimary={() => nav(t.name.route)}
            secondaryLabel={t.backLabel}
            onSecondary={() => nav("/welcome")}
          />

          <CosmicHoloCard
            variant="compact"
            emblem={<Users className="h-7 w-7 text-amber-200" />}
            title={t.compatibility.title}
            blurb={t.compatibility.paragraph}
            primaryLabel={t.compatibility.cta}
            onPrimary={() => nav(t.compatibility.route)}
            secondaryLabel={t.backLabel}
            onSecondary={() => nav("/welcome")}
          />

          <CosmicHoloCard
            variant="compact"
            emblem={<ScrollText className="h-7 w-7 text-amber-200" />}
            title={t.gita.title}
            blurb={t.gita.paragraph}
            primaryLabel={t.gita.cta}
            onPrimary={() => nav(t.gita.route)}
            secondaryLabel={t.backLabel}
            onSecondary={() => nav("/welcome")}
          />
        </div>
      </section>
    </div>
  );
}
