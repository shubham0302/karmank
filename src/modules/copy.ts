// src/modules/copy.ts
export type Language = "en" | "hi" | "en-hi";

export const MODULE_COPY: Record<
  Language,
  {
    backLabel: string;
    numerology: { title: string; paragraph: string; cta: string; route: string };
    name: { title: string; paragraph: string; cta: string; route: string };
    compatibility: { title: string; paragraph: string; cta: string; route: string };
    gita: { title: string; paragraph: string; cta: string; route: string };
  }
> = {
  en: {
    backLabel: "Back to Welcome",
    numerology: {
      title: "KARMANK • NUMEROLOGY",
      paragraph:
        "Decode your 3×3 Vedic grid, karmic patterns and the sacred mathematics shaping your life’s rhythm.",
      cta: "Explore Numerology",
      route: "/numerology",
    },
    name: {
      title: "KARMANK • NAME ANALYSIS",
      paragraph:
        "Uncover name vibrations, auspicious spellings and alignment with your destiny grid.",
      cta: "Analyze Name",
      route: "/name-analysis",
    },
    compatibility: {
      title: "KARMANK • COSMIC COMPATIBILITY",
      paragraph:
        "Measure synergy for partners, teams and relationships using authentic Vedic numerology.",
      cta: "Check Compatibility",
      route: "/compatibility",
    },
    gita: {
      title: "KARMANK • GITA GYAN",
      paragraph:
        "Timeless wisdom of the Bhagavad Gita mapped to modern decisions and your numerological signatures.",
      cta: "Open Gita Gyan",
      route: "/gita-gyan",
    },
  },
  hi: {
    backLabel: "वेलकम पर लौटें",
    numerology: {
      title: "KARMANK • अंक ज्योतिष",
      paragraph:
        "अपने 3×3 वैदिक ग्रिड, कर्म पैटर्न और जीवन की लय को गढ़ने वाली पवित्र गणना को समझें।",
      cta: "अंक ज्योतिष देखें",
      route: "/numerology",
    },
    name: {
      title: "KARMANK • नाम विश्लेषण",
      paragraph:
        "नाम के स्पंदन, शुभ वर्तनी और आपकी नियति ग्रिड से सामंजस्य का पता लगाएँ।",
      cta: "नाम विश्लेषण करें",
      route: "/name-analysis",
    },
    compatibility: {
      title: "KARMANK • कॉस्मिक कम्पैटिबिलिटी",
      paragraph:
        "साथी, रिश्ते और टीमों की सामंजस्यता को असली वैदिक अंक ज्योतिष से मापें।",
      cta: "कम्पैटिबिलिटी जाँचें",
      route: "/compatibility",
    },
    gita: {
      title: "KARMANK • गीता ज्ञान",
      paragraph:
        "भगवद गीता का कालातीत ज्ञान—आपके अंकों के साथ—आधुनिक निर्णयों से जोड़ें।",
      cta: "गीता ज्ञान खोलें",
      route: "/gita-gyan",
    },
  },
  "en-hi": {
    backLabel: "Back to Welcome",
    numerology: {
      title: "KARMANK • NUMEROLOGY",
      paragraph:
        "Apne 3×3 Vedic grid, karmic patterns aur sacred maths ko samjhein jo life ka rhythm banati hai.",
      cta: "Explore Numerology",
      route: "/numerology",
    },
    name: {
      title: "KARMANK • NAME ANALYSIS",
      paragraph:
        "Name vibrations, auspicious spellings aur destiny grid ke saath alignment jaaniye.",
      cta: "Analyze Name",
      route: "/name-analysis",
    },
    compatibility: {
      title: "KARMANK • COSMIC COMPATIBILITY",
      paragraph:
        "Partners, teams aur relationships ki synergy ko Vedic numerology se measure kijiye.",
      cta: "Check Compatibility",
      route: "/compatibility",
    },
    gita: {
      title: "KARMANK • GITA GYAN",
      paragraph:
        "Bhagavad Gita ke timeless insights ko modern decisions aur aapke numbers se map kijiye.",
      cta: "Open Gita Gyan",
      route: "/gita-gyan",
    },
  },
};
