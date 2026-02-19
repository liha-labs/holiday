import { BUNDLED_YEARS, WINDOW_HOLIDAYS } from "./generated/window";
import {
  AVAILABLE_YEARS,
  CKAN_ENDPOINT,
  DATASET_ID,
  DEFAULT_REMOTE_BASE_URL,
  FULL_RANGE,
  GENERATED_AT
} from "./generated/meta";
import { normalizeDateInput, normalizeMonthInput, parseYearFromYmd } from "./normalize";
import type { ClientOptions, Holiday, HolidayClient, HolidayDetail, Info, Weekday } from "./types";

/** クライアント生成時に使う内部設定。 */
type InternalCreateOptions = {
  /** `default` は同梱+remote、`full` は同梱のみ。 */
  source: "default" | "full";
  /** `full` クライアントで使う全期間ローカルデータ。 */
  localAll: Holiday[];
};

/** 祝日配列を年ごとのマップに変換し、各年の並びを安定化する。 */
function toYearMap(holidays: Holiday[]): Map<number, Holiday[]> {
  const map = new Map<number, Holiday[]>();

  for (const holiday of holidays) {
    const year = Number(holiday.date.slice(0, 4));
    const bucket = map.get(year);
    if (bucket) {
      bucket.push(holiday);
    } else {
      map.set(year, [holiday]);
    }
  }

  for (const [year, items] of map.entries()) {
    items.sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
    map.set(year, items);
  }

  return map;
}

/** `info()` 用の返却オブジェクトを組み立てる。 */
function makeInfo(remoteBaseUrl: string): Info {
  return {
    generatedAt: GENERATED_AT,
    bundledYears: {
      min: BUNDLED_YEARS.min,
      max: BUNDLED_YEARS.max
    },
    fullRange: {
      min: FULL_RANGE.min,
      max: FULL_RANGE.max
    },
    source: {
      datasetId: DATASET_ID,
      ckanEndpoint: CKAN_ENDPOINT
    },
    remote: {
      baseUrl: remoteBaseUrl,
      mode: "year-json"
    }
  };
}

/** remoteの年別JSONが期待形式かを検証する。 */
function validateHolidayPayload(data: unknown, year: number): Holiday[] {
  if (!Array.isArray(data)) {
    throw new Error(`Invalid holiday payload for year ${year}: expected array`);
  }

  return data.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Invalid holiday payload for year ${year} at index ${index}`);
    }

    const record = item as Partial<Holiday>;
    if (typeof record.date !== "string" || typeof record.name !== "string") {
      throw new Error(`Invalid holiday shape for year ${year} at index ${index}`);
    }

    normalizeDateInput(record.date);
    if (Number(record.date.slice(0, 4)) !== year) {
      throw new Error(`Unexpected holiday date year in remote payload: ${record.date}`);
    }

    return { date: record.date, name: record.name };
  });
}

/** `YYYY-MM-DD` からローカルタイム基準の曜日番号を求める。 */
function weekdayFromYmd(ymd: string): Weekday {
  const year = Number(ymd.slice(0, 4));
  const month = Number(ymd.slice(5, 7));
  const day = Number(ymd.slice(8, 10));
  return new Date(year, month - 1, day).getDay() as Weekday;
}

/** 基本祝日データへ曜日情報を付与する。 */
function toHolidayDetail(holiday: Holiday): HolidayDetail {
  return {
    ...holiday,
    weekday: weekdayFromYmd(holiday.date)
  };
}

/** 祝日配列へ曜日情報を一括付与する。 */
function toHolidayDetails(holidays: Holiday[]): HolidayDetail[] {
  return holidays.map(toHolidayDetail);
}

/**
 * 祝日クライアントを生成する。
 *
 * - `default`: 同梱範囲はローカル、範囲外は年別JSONを取得
 * - `full`: すべてローカルデータのみで返す
 */
export function createHolidayClient(
  options: ClientOptions | undefined,
  internal: InternalCreateOptions
): HolidayClient {
  const remoteBaseUrl = options?.remoteBaseUrl ?? DEFAULT_REMOTE_BASE_URL;
  const cacheMode = options?.cache ?? "memory";
  const userFetch = options?.fetch ?? globalThis.fetch;

  if (internal.source === "default" && typeof userFetch !== "function") {
    throw new Error("fetch implementation is required when using default client for remote years");
  }

  const bundledMap = toYearMap(WINDOW_HOLIDAYS);
  const localAll = [...internal.localAll].sort(
    (a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name)
  );
  const localMap = toYearMap(localAll);
  const remoteCache = new Map<number, Promise<Holiday[]>>();

  /** 指定年の基本祝日データ（weekday付与前）を返す内部関数。 */
  const listYearRaw = async (year: number): Promise<Holiday[]> => {
    if (!Number.isInteger(year) || year < 1) {
      throw new Error(`Invalid year: ${year}`);
    }

    if (internal.source === "full") {
      return [...(localMap.get(year) ?? [])];
    }

    if (year >= BUNDLED_YEARS.min && year <= BUNDLED_YEARS.max) {
      return [...(bundledMap.get(year) ?? [])];
    }

    /** remoteから年別JSONを取得し、検証・整列して返す。 */
    const loadFromRemote = async (): Promise<Holiday[]> => {
      const url = `${remoteBaseUrl}/data/by-year/${year}.json`;
      const res = await userFetch(url);

      if (!res.ok) {
        throw new Error(
          `Failed to fetch holiday data for year ${year} from ${url}: ${res.status} ${res.statusText}`
        );
      }

      const payload = (await res.json()) as unknown;
      const holidays = validateHolidayPayload(payload, year);
      holidays.sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
      return holidays;
    };

    if (cacheMode === "memory") {
      const cached = remoteCache.get(year);
      if (cached) {
        return [...(await cached)];
      }

      const pending = loadFromRemote().catch((error) => {
        remoteCache.delete(year);
        throw error;
      });
      remoteCache.set(year, pending);
      return [...(await pending)];
    }

    return loadFromRemote();
  };

  /** 指定年の祝日詳細を返す。 */
  const listYear = async (year: number): Promise<HolidayDetail[]> => {
    return toHolidayDetails(await listYearRaw(year));
  };

  /** 指定日の祝日詳細を返す。祝日でなければ `null`。 */
  const getHoliday = async (input: Date | string): Promise<HolidayDetail | null> => {
    const ymd = normalizeDateInput(input);
    const year = parseYearFromYmd(ymd);
    const yearData = await listYearRaw(year);
    const holiday = yearData.find((item) => item.date === ymd);
    return holiday ? toHolidayDetail(holiday) : null;
  };

  /** 指定日の祝日名を返す。祝日でなければ `null`。 */
  const holidayName = async (input: Date | string): Promise<string | null> => {
    const holiday = await getHoliday(input);
    return holiday?.name ?? null;
  };

  /** 指定日が祝日かどうかを返す。 */
  const isHoliday = async (input: Date | string): Promise<boolean> => {
    const name = await holidayName(input);
    return name !== null;
  };

  /** 指定月（`YYYY-MM`）の祝日詳細を返す。 */
  const listMonth = async (ym: `${number}-${string}`): Promise<HolidayDetail[]> => {
    const normalizedYm = normalizeMonthInput(ym);
    const year = Number(normalizedYm.slice(0, 4));
    const yearData = await listYearRaw(year);
    return toHolidayDetails(yearData.filter((holiday) => holiday.date.startsWith(`${normalizedYm}-`)));
  };

  /** 指定範囲（終端含む）の祝日詳細を返す。 */
  const listRange = async (start: Date | string, end: Date | string): Promise<HolidayDetail[]> => {
    const startYmd = normalizeDateInput(start);
    const endYmd = normalizeDateInput(end);

    if (startYmd > endYmd) {
      throw new Error(`Invalid range: start ${startYmd} is after end ${endYmd}`);
    }

    const startYear = Number(startYmd.slice(0, 4));
    const endYear = Number(endYmd.slice(0, 4));
    const collected: Holiday[] = [];

    for (let year = startYear; year <= endYear; year += 1) {
      const yearData = await listYearRaw(year);
      for (const holiday of yearData) {
        if (holiday.date >= startYmd && holiday.date <= endYmd) {
          collected.push(holiday);
        }
      }
    }

    collected.sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
    return toHolidayDetails(collected);
  };

  /** 取得可能な全祝日詳細を返す。 */
  const listAll = async (): Promise<HolidayDetail[]> => {
    if (internal.source === "full") {
      return toHolidayDetails(localAll);
    }

    const all: Holiday[] = [];

    for (const year of AVAILABLE_YEARS) {
      all.push(...(await listYearRaw(year)));
    }

    all.sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
    return toHolidayDetails(all);
  };

  return {
    holidayName,
    isHoliday,
    getHoliday,
    listYear,
    listMonth,
    listRange,
    listAll,
    info: () => makeInfo(remoteBaseUrl)
  };
}

export { AVAILABLE_YEARS };
