// Centralized Constants for KarmAnk

// ============================================
// Application Constants
// ============================================
export const APP_NAME = "KarmAnk";
export const APP_TAGLINE = "Cosmic Numerology";
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.0";

// ============================================
// Authentication Constants
// ============================================
export const DEMO_CREDENTIALS = {
  EMAIL: "demo@karmank.com",
  // Note: Demo accepts any password for development
} as const;

export const AUTH_STORAGE_KEY = "karmank-store";
export const AUTH_TOKEN_KEY = "karmank_auth";

// ============================================
// Plan Types & Quotas
// ============================================
export const PLANS = {
  FREE: {
    name: 'Free',
    quotas: {
      compatibility: 3,
      nameAnalysis: 2,
      pdfExports: 0,
      ttsMinutes: 0,
      chatbotPrompts: 10,
    },
  },
  PRO: {
    name: 'Pro',
    quotas: {
      compatibility: 10,
      nameAnalysis: 10,
      pdfExports: 5,
      ttsMinutes: 30,
      chatbotPrompts: 100,
    },
  },
  SUPREME: {
    name: 'Supreme',
    quotas: {
      compatibility: Infinity,
      nameAnalysis: Infinity,
      pdfExports: Infinity,
      ttsMinutes: 120,
      chatbotPrompts: Infinity,
    },
  },
} as const;

// ============================================
// Language Constants
// ============================================
export const LANGUAGES = [
  { code: "en" as const, label: "English", flag: "🇺🇸" },
  { code: "hi" as const, label: "हिंदी", flag: "🇮🇳" },
  { code: "en-hi" as const, label: "Hinglish", flag: "🌏" },
] as const;

export const DEFAULT_LANGUAGE = "en";

// ============================================
// Numerology Constants
// ============================================
export const VEDIC_KUNDLI_MATRIX = [
  [3, 1, 9], // Mental Plane
  [6, 7, 5], // Emotional Plane
  [2, 8, 4], // Physical Plane
] as const;

export const MASTER_NUMBERS = [11, 22, 33] as const;

export const PLANE_DEFINITIONS = {
  PHYSICAL: {
    numbers: [1, 4, 7],
    name: { en: "Physical Plane", hi: "भौतिक तल", "en-hi": "Physical Plane" },
    description: {
      en: "Material world, practical actions, and physical manifestation",
      hi: "भौतिक संसार, व्यावहारिक कार्य और शारीरिक अभिव्यक्ति",
      "en-hi": "Material duniya, practical actions aur physical manifestation"
    },
  },
  MENTAL: {
    numbers: [3, 6, 9],
    name: { en: "Mental Plane", hi: "मानसिक तल", "en-hi": "Mental Plane" },
    description: {
      en: "Intellect, communication, and creative thinking",
      hi: "बुद्धि, संचार और रचनात्मक सोच",
      "en-hi": "Buddhi, communication aur creative soch"
    },
  },
  EMOTIONAL: {
    numbers: [2, 5, 8],
    name: { en: "Emotional Plane", hi: "भावनात्मक तल", "en-hi": "Emotional Plane" },
    description: {
      en: "Feelings, relationships, and intuitive understanding",
      hi: "भावनाएं, रिश्ते और सहज समझ",
      "en-hi": "Feelings, rishte aur intuitive samajh"
    },
  },
} as const;

// ============================================
// Date Format Constants
// ============================================
export const DATE_FORMATS = {
  INPUT: "DD/MM/YYYY",
  DISPLAY: "DD MMMM YYYY",
  API: "YYYY-MM-DD",
} as const;

// ============================================
// Validation Constants
// ============================================
export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s\u0900-\u097F]+$/, // English + Devanagari
  },
  DATE: {
    MIN_YEAR: 1900,
    MAX_YEAR: new Date().getFullYear(),
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
  },
} as const;

// ============================================
// Route Paths
// ============================================
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  WELCOME: "/welcome",
  MODULES: "/modules",

  // App Routes
  APP: "/app",
  NUMEROLOGY: "/app/numerology",
  COMPATIBILITY: "/app/compatibility",
  NAME_ANALYSIS: "/app/name-analysis",
  GITA_GYAN: "/app/gita-gyan",
  GALAXY: "/galaxy",

  // Legal Routes
  PRIVACY: "/privacy",
  TERMS: "/terms",
  REFUND: "/refund",
  DISCLAIMER: "/disclaimer",
} as const;

// ============================================
// UI Constants
// ============================================
export const THEME_COLORS = {
  COSMIC_BLUE: "#0A1640",
  NEBULA_VIOLET: "#5B35AC",
  AURIC_GOLD: "#F8D26A",
  STARDUST: "#C6C6D3",
  COSMIC_GLOW: "#9F7AEA",
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// ============================================
// Storage Keys
// ============================================
export const STORAGE_KEYS = {
  AUTH_STATE: "karmank-store",
  LAST_REPORT: "karmank-last-report",
  USER_PREFERENCES: "karmank-preferences",
} as const;

// ============================================
// API Constants (for future use)
// ============================================
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "",
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || "10000"),
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// ============================================
// Error Messages
// ============================================
export const ERROR_MESSAGES = {
  NETWORK_ERROR: {
    en: "Network error. Please check your connection.",
    hi: "नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें।",
    "en-hi": "Network error. Apna connection check karein.",
  },
  INVALID_INPUT: {
    en: "Please provide valid input.",
    hi: "कृपया मान्य जानकारी प्रदान करें।",
    "en-hi": "Please valid input dijiye.",
  },
  AUTH_FAILED: {
    en: "Authentication failed. Please try again.",
    hi: "प्रमाणीकरण विफल। कृपया पुनः प्रयास करें।",
    "en-hi": "Authentication fail. Phir se try karein.",
  },
  SESSION_EXPIRED: {
    en: "Your session has expired. Please login again.",
    hi: "आपका सत्र समाप्त हो गया। कृपया फिर से लॉगिन करें।",
    "en-hi": "Aapka session expire ho gaya. Login karein.",
  },
} as const;

// ============================================
// Feature Flags
// ============================================
export const FEATURES = {
  ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
  CHATBOT: import.meta.env.VITE_ENABLE_CHATBOT === "true",
  TTS: import.meta.env.VITE_ENABLE_TTS === "true",
  PDF_EXPORT: import.meta.env.VITE_ENABLE_PDF_EXPORT === "true",
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === "true",
} as const;
