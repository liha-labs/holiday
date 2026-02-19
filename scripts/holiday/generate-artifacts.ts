import { access, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** 生成処理で扱う祝日レコード。 */
export type HolidayRecord = { date: `${number}-${number}-${number}`; name: string };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const packageRoot = path.join(repoRoot, "packages", "holiday");

const sourceDataDir = path.join(repoRoot, "data");
const sourceByYearDir = path.join(sourceDataDir, "by-year");

const publishDataDir = path.join(packageRoot, "data");
const publishByYearDir = path.join(publishDataDir, "by-year");

const generatedDir = path.join(packageRoot, "src", "generated");

/** CSV側の日付表記を `YYYY-MM-DD` へ正規化する。 */
function toYmd(value: string): `${number}-${number}-${number}` {
  const trimmed = value.trim();
  const matched = trimmed.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
  if (!matched) {
    throw new Error(`Invalid date string in source CSV: ${value}`);
  }

  const year = Number(matched[1]);
  const month = Number(matched[2]);
  const day = Number(matched[3]);
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    throw new Error(`Invalid calendar date in source CSV: ${value}`);
  }

  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

/** シンプルなCSVパーサー。ダブルクォートを考慮して行列へ展開する。 */
function csvRows(csv: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < csv.length; i += 1) {
    const ch = csv[i];

    if (ch === '"') {
      const next = csv[i + 1];
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }

    if (!inQuotes && ch === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (!inQuotes && (ch === "\n" || ch === "\r")) {
      if (ch === "\r" && csv[i + 1] === "\n") {
        i += 1;
      }
      row.push(field);
      field = "";
      if (row.some((v) => v.length > 0)) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    field += ch;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((v) => v.length > 0)) {
      rows.push(row);
    }
  }

  return rows;
}

/**
 * 公式CSV文字列から祝日レコードを抽出する。
 * ソート・重複排除・日付妥当性検証まで実施する。
 */
export function recordsFromCsv(csv: string): HolidayRecord[] {
  const rows = csvRows(csv);
  if (rows.length === 0) {
    throw new Error("CSV payload is empty");
  }

  const dataRows = rows.slice(1);
  const records: HolidayRecord[] = dataRows
    .map((row) => {
      const dateRaw = row[0]?.trim();
      const nameRaw = row[1]?.trim();
      if (!dateRaw || !nameRaw) {
        return null;
      }
      return {
        date: toYmd(dateRaw),
        name: nameRaw
      };
    })
    .filter((record): record is HolidayRecord => record !== null);

  records.sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));

  const deduped: HolidayRecord[] = [];
  const seen = new Set<string>();
  for (const record of records) {
    const key = `${record.date}\t${record.name}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(record);
  }

  for (let i = 1; i < deduped.length; i += 1) {
    if (deduped[i - 1].date > deduped[i].date) {
      throw new Error("Holiday data must be sorted by date");
    }
  }

  return deduped;
}

/** 指定ディレクトリへ `all.json` と `by-year/*.json` を書き出す。 */
async function writeDatasetSnapshot(
  dataDir: string,
  byYearDir: string,
  yearsToWrite: number[],
  grouped: Map<number, HolidayRecord[]>,
  records: HolidayRecord[]
): Promise<void> {
  await mkdir(byYearDir, { recursive: true });

  const existingYearFiles = (await readdir(byYearDir)).filter((name) => name.endsWith(".json"));
  await Promise.all(existingYearFiles.map((name) => rm(path.join(byYearDir, name))));

  await Promise.all(
    yearsToWrite.map(async (year) => {
      const yearRecords = grouped.get(year) ?? [];
      await writeFile(path.join(byYearDir, `${year}.json`), `${JSON.stringify(yearRecords, null, 2)}\n`, "utf8");
    })
  );

  await mkdir(dataDir, { recursive: true });
  await writeFile(path.join(dataDir, "all.json"), `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

/**
 * データと生成コードを一括更新する。
 *
 * - ルート `data/` はフル期間
 * - `packages/holiday/data` は配布用スナップショット
 * - `packages/holiday/src/generated/*` は実行時参照コード
 */
export async function writeDataAndGeneratedFiles(
  records: HolidayRecord[],
  options?: { generatedAt?: string; remoteBaseUrl?: string; windowCenterYear?: number }
): Promise<void> {
  if (records.length === 0) {
    throw new Error("No holiday records to generate");
  }

  const generatedAt = options?.generatedAt ?? new Date().toISOString();
  const remoteBaseUrl =
    options?.remoteBaseUrl ??
    "https://raw.githubusercontent.com/liha-labs/holiday/main";
  const centerYear = options?.windowCenterYear ?? new Date().getFullYear();
  const bundledMin = centerYear - 2;
  const bundledMax = centerYear + 2;

  await mkdir(generatedDir, { recursive: true });

  const grouped = new Map<number, HolidayRecord[]>();
  for (const record of records) {
    const year = Number(record.date.slice(0, 4));
    const bucket = grouped.get(year);
    if (bucket) {
      bucket.push(record);
    } else {
      grouped.set(year, [record]);
    }
  }

  const years = [...grouped.keys()].sort((a, b) => a - b);

  const publishYears = years.filter((year) => year >= bundledMin && year <= bundledMax);

  await writeDatasetSnapshot(sourceDataDir, sourceByYearDir, years, grouped, records);
  await writeDatasetSnapshot(publishDataDir, publishByYearDir, publishYears, grouped, records);

  const windowRecords = records.filter((record) => {
    const year = Number(record.date.slice(0, 4));
    return year >= bundledMin && year <= bundledMax;
  });

  const windowTs = [
    'import type { Holiday } from "../types";',
    "",
    `export const BUNDLED_YEARS = { min: ${bundledMin}, max: ${bundledMax} } as const;`,
    "",
    `export const WINDOW_HOLIDAYS: Holiday[] = ${JSON.stringify(windowRecords, null, 2)};`,
    ""
  ].join("\n");

  const fullTs = [
    'import type { Holiday } from "../types";',
    "",
    `export const FULL_HOLIDAYS: Holiday[] = ${JSON.stringify(records, null, 2)};`,
    ""
  ].join("\n");

  const metaTs = [
    `export const GENERATED_AT = ${JSON.stringify(generatedAt)};`,
    'export const DATASET_ID = "cao_20190522_0002" as const;',
    'export const CKAN_ENDPOINT = "https://data.e-gov.go.jp/data/api/action/package_show?id=cao_20190522_0002" as const;',
    `export const DEFAULT_REMOTE_BASE_URL = ${JSON.stringify(remoteBaseUrl)};`,
    `export const FULL_RANGE = { min: ${JSON.stringify(records[0].date)}, max: ${JSON.stringify(records[records.length - 1].date)} } as const;`,
    `export const AVAILABLE_YEARS = ${JSON.stringify(years)} as const;`,
    ""
  ].join("\n");

  await writeFile(path.join(generatedDir, "window.ts"), windowTs, "utf8");
  await writeFile(path.join(generatedDir, "full.ts"), fullTs, "utf8");
  await writeFile(path.join(generatedDir, "meta.ts"), metaTs, "utf8");
}

/** ファイルの存在確認。 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * `all.json` を読み込む。
 * 通常はルート `data/all.json` を使い、未移行時のみ package 側へフォールバックする。
 */
export async function readAllJsonRecords(): Promise<HolidayRecord[]> {
  const rootAll = path.join(sourceDataDir, "all.json");
  const packageAll = path.join(publishDataDir, "all.json");

  if (await fileExists(rootAll)) {
    const file = await readFile(rootAll, "utf8");
    return JSON.parse(file) as HolidayRecord[];
  }

  if (await fileExists(packageAll)) {
    const file = await readFile(packageAll, "utf8");
    return JSON.parse(file) as HolidayRecord[];
  }

  throw new Error(`No all.json found in ${sourceDataDir} or ${publishDataDir}`);
}
