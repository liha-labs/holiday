/** `YYYY-MM-DD` 形式の日付文字列。 */
export type DateString = `${number}-${number}-${number}`;

/** 祝日の基本データ。 */
export type Holiday = { date: DateString; name: string };
/** 曜日番号。`0=日曜 ... 6=土曜` */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
/** 祝日データに曜日情報を付与した詳細型。 */
export type HolidayDetail = Holiday & { weekday: Weekday };

/** ライブラリ生成情報とデータソース情報。 */
export type Info = {
  generatedAt: string;
  bundledYears: { min: number; max: number };
  fullRange: { min: string; max: string };
  source: { datasetId: string; ckanEndpoint: string };
  remote: { baseUrl: string; mode: "year-json" };
};

/** クライアント生成時のオプション。 */
export type ClientOptions = {
  /** 年別JSON取得に使うベースURL。 */
  remoteBaseUrl?: string;
  /** 取得に使う `fetch` 実装。 */
  fetch?: typeof globalThis.fetch;
  /** 年別取得のキャッシュ戦略。 */
  cache?: "memory" | "none";
};

/** 祝日操作API。 */
export type HolidayClient = {
  /** 指定日が祝日の場合は祝日名を返す。 */
  holidayName(input: Date | string): Promise<string | null>;
  /** 指定日が祝日かどうかを返す。 */
  isHoliday(input: Date | string): Promise<boolean>;
  /** 指定日の祝日詳細を返す。祝日でなければ `null`。 */
  getHoliday(input: Date | string): Promise<HolidayDetail | null>;

  /** 指定年の祝日一覧を返す。 */
  listYear(year: number): Promise<HolidayDetail[]>;
  /** 指定月（`YYYY-MM`）の祝日一覧を返す。 */
  listMonth(ym: `${number}-${string}`): Promise<HolidayDetail[]>;
  /** 指定範囲（終端含む）の祝日一覧を返す。 */
  listRange(start: Date | string, end: Date | string): Promise<HolidayDetail[]>;
  /** 取得可能な全祝日一覧を返す。 */
  listAll(): Promise<HolidayDetail[]>;

  /** 生成情報・データソース情報を返す。 */
  info(): Info;
};
