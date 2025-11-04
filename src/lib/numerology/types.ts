export type Yoga = { name: string; description: string; traits?: string[] };

export type RecurringItem = {
  number: number;
  occurrences: number;
  influence: string;
};

export type SpecialInsight = { title: string; text: string };

export type Report = {
  dob: Date;
  name: string;
  basicNumber: number;
  destinyNumber: number;
  baseKundliGrid: number[]; // index 0 unused; 1..9
  recurringNumbersAnalysis: RecurringItem[];
  yogas: Yoga[];
  specialInsights: SpecialInsight[];
};

export type DashaSpan = {
  dashaNumber: number;
  startDate: Date;
  endDate: Date;
  year?: number;
  month?: number;
  date?: Date;
};

export type DashaReport = {
  mahaDashaTimeline: DashaSpan[];
  yearlyDashaTimeline: (DashaSpan & { year: number })[];
  monthlyDashaTimeline: (DashaSpan & { year: number; month: number })[];
  dailyDashaTimeline: { date: Date; dashaNumber: number }[];
};
