// src/lib/numerology/dashaCalculator.ts
import { personalYear, personalMonth, personalDay } from "./advanced";

type MahaItem = { year: number; personalYearNumber: number; start: Date; end: Date };
type YearlyItem = { year: number; personalYearNumber: number };
type MonthlyItem = { ym: string; personalMonthNumber: number; date: Date };
type DailyItem = { dateISO: string; personalDayNumber: number; date: Date };

export const dashaCalculator = {
  /**
   * 9-year “Maha Dasha” style overview from current year.
   */
  calculateMahaDasha(dob: string, _basicNumber: number): MahaItem[] {
    const now = new Date();
    const currentYear = now.getFullYear();

    const out: MahaItem[] = [];
    for (let i = 0; i < 9; i++) {
      const y = currentYear + i;
      const start = new Date(y, 0, 1);
      const end = new Date(y, 11, 31, 23, 59, 59, 999);
      out.push({
        year: y,
        personalYearNumber: personalYear(dob, start),
        start,
        end,
      });
    }
    return out;
  },

  /**
   * Personal year number for each of the next 9 years.
   */
  calculateYearlyDasha(dob: string, _basicNumber: number): YearlyItem[] {
    const now = new Date();
    const currentYear = now.getFullYear();

    const out: YearlyItem[] = [];
    for (let i = 0; i < 9; i++) {
      const y = currentYear + i;
      out.push({
        year: y,
        personalYearNumber: personalYear(dob, new Date(y, 0, 1)),
      });
    }
    return out;
  },

  /**
   * 12 months from now with personal month numbers.
   */
  calculateMonthlyDasha(yearly: YearlyItem[]): MonthlyItem[] {
    const start = new Date();
    const out: MonthlyItem[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 15);
      const pm = personalMonth(yearly[0] ? `${d.getFullYear()}-${d.getMonth() + 1}-15` : "", d);
      out.push({
        ym: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        personalMonthNumber: pm,
        date: d,
      });
    }
    return out;
  },

  /**
   * 30 days from today with personal day numbers.
   */
  calculateDailyDasha(monthly: MonthlyItem[]): DailyItem[] {
    const start = new Date();
    const out: DailyItem[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      out.push({
        dateISO: d.toISOString().slice(0, 10),
        personalDayNumber: personalDay(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`, d),
        date: d,
      });
    }
    return out;
  },
};
