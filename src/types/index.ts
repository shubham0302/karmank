// Centralized Type Definitions for KarmAnk

// ============================================
// Language & Localization
// ============================================
export type Language = "en" | "hi" | "en-hi";

export type MultilingualText = string | {
  en?: string;
  hi?: string;
  "en-hi"?: string;
};

// ============================================
// User & Authentication
// ============================================
export const PLAN_TYPES = {
  FREE: 'Free',
  PRO: 'Pro',
  SUPREME: 'Supreme'
} as const;

export type PlanType = typeof PLAN_TYPES[keyof typeof PLAN_TYPES];

export interface UserQuotas {
  compatibility: number;
  nameAnalysis: number;
  pdfExports: number;
  ttsMinutes: number;
  chatbotPrompts: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  plan: PlanType;
  quotas: UserQuotas;
}

// ============================================
// Numerology Types
// ============================================
export interface NumerologyInput {
  name: string;
  dob: string; // Format: DD/MM/YYYY
}

export interface CoreNumbers {
  lifePath: number;
  nameNumber?: number;
  master?: 11 | 22 | 33;
}

export interface RecurringNumber {
  number: number;
  count: number;
  meaning: MultilingualText;
}

export interface Yoga {
  name: MultilingualText;
  description: MultilingualText;
  strength: "strong" | "moderate" | "weak";
}

export interface PlaneStatus {
  numbers: number[];
  status: "strong" | "balanced" | "weak" | "missing";
  description?: MultilingualText;
}

export interface KundliPlanes {
  physical: PlaneStatus;
  mental: PlaneStatus;
  emotional: PlaneStatus;
}

export interface KundliGridResult {
  matrix: number[][];
  counts: Record<number, number>;
  planes: KundliPlanes;
  summary: string;
  masterNumbers: {
    is11: boolean;
    is22: boolean;
    is33: boolean;
  };
}

export interface NumerologyReport {
  // Basic Info
  name: string;
  dob: string;

  // Core Numbers
  basicNumber: number;
  destinyNumber: number;
  nameNumber?: number;

  // Grid Analysis
  baseKundliGrid: number[];
  kundliAnalysis?: KundliGridResult;

  // Advanced Analysis
  yogas?: Yoga[];
  recurring?: RecurringNumber[];
  shapes?: any[]; // TODO: Define proper shape type

  // Forecasts
  forecast?: any; // TODO: Define proper forecast type
}

// ============================================
// Compatibility Types
// ============================================
export interface CompatibilityInput {
  person1: NumerologyInput;
  person2: NumerologyInput;
}

export interface CompatibilityResult {
  summary: string;
  strengths: string[];
  frictions: string[];
  remedies: string[];
  score?: number;
  meta?: {
    combinationKey: string;
    auspiciousDays: string[];
    favorableColors: string[];
  };
}

// ============================================
// Dasha (Time Periods) Types
// ============================================
export interface DashaPeriod {
  number: number;
  startDate: Date;
  endDate: Date;
  description: MultilingualText;
}

export interface DashaTimeline {
  mahaDasha?: DashaPeriod[];
  yearlyDasha?: DashaPeriod[];
  monthlyDasha?: DashaPeriod[];
  dailyDasha?: DashaPeriod[];
}

export interface DashaReport {
  mahaDashaTimeline?: any[];
  yearlyDashaTimeline?: any[];
  monthlyDashaTimeline?: any[];
  dailyDashaTimeline?: any[];
}

export type OverlayNumbers = Partial<
  Record<"maha" | "yearly" | "monthly" | "daily", number | null>
>;

// ============================================
// UI State Types
// ============================================
export interface FormError {
  field?: string;
  message: string;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

// ============================================
// API Types (for future backend integration)
// ============================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}
