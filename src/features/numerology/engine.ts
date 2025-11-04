export interface NumerologyReport {
  name: string;
  dobISO: string;            // YYYY-MM-DD
  basicNumber: number;       // from day
  destinyNumber: number;     // full DOB reduced (11/22/33 kept)
  baseKundliGrid: number[];  // counts of digits 1..9 (index = digit)
}

export const reduceToSingleDigit = (numOrStr: number | string) => {
  const s = String(numOrStr).replace(/\D/g, "");
  if (!s) return 0;
  let n = s.split("").reduce((a, b) => a + parseInt(b, 10), 0);
  while (n > 9 && ![11, 22, 33].includes(n)) {
    n = String(n).split("").reduce((a, b) => a + parseInt(b, 10), 0);
  }
  return n;
};

export function buildBaseKundliGrid(day: number, month: number, year: number) {
  const grid = Array(10).fill(0); // 0..9 (we'll ignore index 0)
  const s = String(day).padStart(2, "0") + String(month).padStart(2, "0") + String(year);
  for (const ch of s.replace(/0/g, "")) grid[parseInt(ch, 10)]++;
  return grid;
}

export function computeReport(name: string, dobISO: string): NumerologyReport {
  const dt = new Date(dobISO);
  const day = dt.getDate(), month = dt.getMonth() + 1, year = dt.getFullYear();

  const basicNumber = reduceToSingleDigit(day);
  const destinyNumber = reduceToSingleDigit(`${day}${month}${year}`);

  const baseKundliGrid = buildBaseKundliGrid(day, month, year);
  // Optionally emphasize these:
  baseKundliGrid[destinyNumber] = (baseKundliGrid[destinyNumber] ?? 0) + 1;
  if (day > 9 && day % 10 !== 0) {
    baseKundliGrid[basicNumber] = (baseKundliGrid[basicNumber] ?? 0) + 1;
  }

  return { name, dobISO, basicNumber, destinyNumber, baseKundliGrid };
}
