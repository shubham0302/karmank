export const vowels = ["A", "E", "I", "O", "U"];

export const letterData: Record<string, { num: number; meaning: string; firstLetter: string; repeat: string }> = {
  A: { num: 1, meaning: "leadership & initiative", firstLetter: "assertive start", repeat: "amplifies drive" },
  B: { num: 2, meaning: "care & cooperation", firstLetter: "supportive start", repeat: "heightens sensitivity" },
  C: { num: 3, meaning: "creativity & expression", firstLetter: "playful start", repeat: "boosts social energy" },
  D: { num: 4, meaning: "discipline & order", firstLetter: "grounded start", repeat: "adds rigidity" },
  E: { num: 5, meaning: "change & versatility", firstLetter: "dynamic start", repeat: "restless energy" },
  F: { num: 6, meaning: "nurture & harmony", firstLetter: "caring start", repeat: "over-responsibility" },
  G: { num: 7, meaning: "insight & depth", firstLetter: "introspective start", repeat: "overthinking" },
  H: { num: 8, meaning: "power & karma", firstLetter: "forceful start", repeat: "material fixation" },
  I: { num: 9, meaning: "compassion & ideals", firstLetter: "idealistic start", repeat: "self-sacrifice" },
  // …complete mapping if you need per-letter nuance (A–Z → 1–9 pythagorean)
};
