// src/lib/i18n.ts
export type Lang = "en" | "hi" | "en-hi";
export type Multi = string | { en?: string; hi?: string; "en-hi"?: string };

// Reuse your existing translator so we only have one implementation
import { getText as _getText } from "@/lib/numerology/utils";

export const t = (value: Multi | unknown, lang: Lang = "en"): string => _getText(value, lang as any);
