import type { DateString } from "./types";

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const YM_RE = /^(\d{4})-(0[1-9]|1[0-2])$/;

/** 数値を2桁ゼロ埋めに変換する。 */
function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/** 年月日が実在する日付かをローカルタイムで検証する。 */
function isValidYmd(year: number, month: number, day: number): boolean {
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

/**
 * `Date` をローカル日付基準で `YYYY-MM-DD` へ正規化する。
 * `new Date("YYYY-MM-DD")` のUTC解釈は使わない。
 */
export function ymdFromDate(input: Date): DateString {
  if (!(input instanceof Date) || Number.isNaN(input.getTime())) {
    throw new Error("Invalid Date input");
  }

  return `${input.getFullYear()}-${pad2(input.getMonth() + 1)}-${pad2(input.getDate())}` as DateString;
}

/**
 * 日付入力を `YYYY-MM-DD` へ厳密正規化する。
 * 文字列は `YYYY-MM-DD` のみ許可し、暦上不正な日付は例外にする。
 */
export function normalizeDateInput(input: Date | string): DateString {
  if (input instanceof Date) {
    return ymdFromDate(input);
  }

  if (typeof input !== "string") {
    throw new Error("Date input must be a Date or YYYY-MM-DD string");
  }

  const match = DATE_RE.exec(input);
  if (!match) {
    throw new Error(`Invalid date string format: ${input}. Expected YYYY-MM-DD`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!isValidYmd(year, month, day)) {
    throw new Error(`Invalid calendar date: ${input}`);
  }

  return input as DateString;
}

/** `YYYY-MM-DD` から年を取り出す。 */
export function parseYearFromYmd(ymd: DateString): number {
  return Number(ymd.slice(0, 4));
}

/** `YYYY-MM` 形式を厳密検証して返す。 */
export function normalizeMonthInput(ym: string): `${number}-${string}` {
  if (!YM_RE.test(ym)) {
    throw new Error(`Invalid month format: ${ym}. Expected YYYY-MM`);
  }

  return ym as `${number}-${string}`;
}
