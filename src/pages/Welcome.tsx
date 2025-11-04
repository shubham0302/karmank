import React from "react";
import { useNavigate } from "react-router-dom";
import CosmicBackground from "@/components/CosmicBackground"; // ✅ shared background
import { useAppStore, type Language } from "@/store/appStore";
import HoloDestinyCard from "@/components/HoloDestinyCard";

const COPY: Record<
  Language,
  {
    headingTop: string;
    headingBottom: string;
    subtitle: string;
    numerology: { title: string; blurb: string; cta: string };
    name: { title: string; blurb: string; cta: string };
    compatibility: { title: string; blurb: string; cta: string };
    gita: { title: string; blurb: string; cta: string };
  }
> = {
  en: {
    headingTop: "Choose your cosmic path",
    headingBottom: "to begin your KarmAnk journey",
    subtitle: "Each card is a gateway. Enter any module—switch anytime from the top navigation.",
    numerology: { title: "KARMANK • NUMEROLOGY", blurb: "Decode your 3×3 Vedic grid, karmic patterns and the sacred mathematics shaping your life’s rhythm.", cta: "Explore" },
    name:        { title: "KARMANK • NAME ANALYSIS", blurb: "Uncover name vibrations, auspicious spellings and alignment with your destiny grid.", cta: "Analyze" },
    compatibility:{ title: "KARMANK • COSMIC COMPATIBILITY", blurb: "Measure synergy for partners, teams and relationships using authentic Vedic numerology.", cta: "Check" },
    gita:        { title: "KARMANK • GITA GYAN", blurb: "Timeless wisdom of the Bhagavad Gita mapped to modern decisions and your numerological signatures.", cta: "Open" },
  },
  hi: {
    headingTop: "अपना कॉस्मिक मार्ग चुनें",
    headingBottom: "और KarmAnk यात्रा शुरू करें",
    subtitle: "हर कार्ड एक द्वार है। किसी भी मॉड्यूल में प्रवेश करें—ऊपर के नेविगेशन से कभी भी बदलें।",
    numerology: { title: "KARMANK • अंक ज्योतिष", blurb: "अपने 3×3 वैदिक ग्रिड, कर्म पैटर्न और जीवन की लय को गढ़ने वाली पवित्र गणना को समझें।", cta: "देखें" },
    name:        { title: "KARMANK • नाम विश्लेषण", blurb: "नाम के स्पंदन, शुभ वर्तनी और आपकी नियति ग्रिड से सामंजस्य का पता लगाएं।", cta: "विश्लेषण" },
    compatibility:{ title: "KARMANK • कॉस्मिक कम्पैटिबिलिटी", blurb: "साथी, रिश्ते और टीमों की सामंजस्यता को असली वैदिक अंक ज्योतिष से मापें।", cta: "जाँचें" },
    gita:        { title: "KARMANK • गीता ज्ञान", blurb: "भगवद गीता का कालातीत ज्ञान—आपके अंकों के साथ—आधुनिक निर्णयों से जोड़ें।", cta: "खोलें" },
  },
  "en-hi": {
    headingTop: "Apna cosmic raasta chuniye",
    headingBottom: "aur KarmAnk yatra shuru karein",
    subtitle: "Har card ek gateway hai. Kisi bhi module me jaaiye—top nav se kabhi bhi switch kijiye.",
    numerology: { title: "KARMANK • NUMEROLOGY", blurb: "Apne 3×3 Vedic grid, karmic patterns aur sacred maths ko samjhein jo life ka rhythm banati hai.", cta: "Explore" },
    name:        { title: "KARMANK • NAME ANALYSIS", blurb: "Name vibrations, auspicious spellings aur destiny grid ke saath alignment jaaniye.", cta: "Analyze" },
    compatibility:{ title: "KARMANK • COSMIC COMPATIBILITY", blurb: "Partners, teams aur relationships ki synergy ko Vedic numerology se measure kijiye.", cta: "Check" },
    gita:        { title: "KARMANK • GITA GYAN", blurb: "Bhagavad Gita ke timeless insights ko modern decisions aur aapke numbers se map kijiye.", cta: "Open" },
  },
};

const AUTOSET_KEY = "karmank-lang-autoset";

export default function Welcome() {
  const nav = useNavigate();
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const t = COPY[language];

  React.useEffect(() => {
    if (localStorage.getItem(AUTOSET_KEY)) return;
    const navLang = (navigator.language || navigator.languages?.[0] || "en").toLowerCase();
    let detected: Language = "en";
    if (navLang.startsWith("hi")) detected = "hi";
    else if (navLang.startsWith("en-in")) detected = "en-hi";
    setLanguage(detected);
    localStorage.setItem(AUTOSET_KEY, "1");
  }, [setLanguage]);

  return (
    <CosmicBackground density={140}>
      <div className="min-h-screen relative px-4 md:px-6 py-6 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* language pill */}
          <div className="flex justify-end mb-4">
            <div className="inline-flex gap-1 rounded-full border border-white/10 bg-black/30 p-1 backdrop-blur">
              {(["en", "hi", "en-hi"] as Language[]).map((lng) => (
                <button
                  key={lng}
                  onClick={() => setLanguage(lng)}
                  className={`px-3 py-1 text-sm rounded-full transition ${
                    language === lng ? "bg-white/15 text-white" : "text-muted-foreground hover:text-white"
                  }`}
                >
                  {lng === "en" ? "English" : lng === "hi" ? "हिंदी" : "Hinglish"}
                </button>
              ))}
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-6 md:mb-8">
            <h1
              className="
                text-center text-4xl md:text-6xl font-serif font-extrabold leading-snug
                bg-[linear-gradient(90deg,#facc15_0%,#fbbf24_20%,#f9a8d4_60%,#c084fc_100%)]
                bg-clip-text text-transparent
                drop-shadow-[0_0_12px_rgba(0,255,255,.25)]
              "
            >
              {t.headingTop}
              <br className="hidden md:block" />
              {t.headingBottom}
            </h1>
            <p className="mt-3 text-sm md:text-base text-muted-foreground">{t.subtitle}</p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            <HoloDestinyCard
              title={t.numerology.title}
              blurb={t.numerology.blurb}
              ctaLabel={t.numerology.cta}
              onPrimary={() => nav("/app/numerology")}
              rim="blue"
              tint="none"
            />
            <HoloDestinyCard
              title={t.name.title}
              blurb={t.name.blurb}
              ctaLabel={t.name.cta}
              onPrimary={() => nav("/app/name-analysis")}
              rim="blue"
              tint="none"
            />
            <HoloDestinyCard
              title={t.compatibility.title}
              blurb={t.compatibility.blurb}
              ctaLabel={t.compatibility.cta}
              onPrimary={() => nav("/app/compatibility")}
              rim="blue"
              tint="none"
            />
            <HoloDestinyCard
              title={t.gita.title}
              blurb={t.gita.blurb}
              ctaLabel={t.gita.cta}
              onPrimary={() => nav("/app/gita-gyan")}
              rim="blue"
              tint="none"
            />
          </div>
        </div>
      </div>
    </CosmicBackground>
  );
}
