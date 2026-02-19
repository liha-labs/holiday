# @liha-labs/holiday

日本の祝日を扱う ESM ライブラリです。

- 祝日判定は公式データベース準拠（計算ロジックなし）
- `holidayName()` は `string | null`
- `getHoliday()` / `list*()` は `weekday` 付きの詳細を返却

## Install

```bash
pnpm add @liha-labs/holiday
```

## Exports

- `@liha-labs/holiday`
- `@liha-labs/holiday/full`

default export はありません。

## Main Types

```ts
export type Holiday = { date: "YYYY-MM-DD"; name: string };
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sun ... 6=Sat
export type HolidayDetail = Holiday & { weekday: Weekday };

export type ClientOptions = {
  remoteBaseUrl?: string;
  fetch?: typeof globalThis.fetch;
  cache?: "memory" | "none";
};
```

## API

```ts
holidayName(input: Date | string): Promise<string | null>
isHoliday(input: Date | string): Promise<boolean>
getHoliday(input: Date | string): Promise<HolidayDetail | null>

listYear(year: number): Promise<HolidayDetail[]>
listMonth(ym: `${number}-${string}`): Promise<HolidayDetail[]>
listRange(start: Date | string, end: Date | string): Promise<HolidayDetail[]>
listAll(): Promise<HolidayDetail[]>

createClient(options?: ClientOptions): HolidayClient
info(): Info
```

## Basic Usage

```ts
import {
  createClient,
  getHoliday,
  holidayName,
  isHoliday,
  listMonth,
  listRange,
  listYear,
  info
} from "@liha-labs/holiday";

await holidayName("2026-01-01");
// => "元日"

await isHoliday("2026-01-02");
// => false

await getHoliday("2026-01-01");
// => { date: "2026-01-01", name: "元日", weekday: 4 }

await listYear(2026);
await listMonth("2026-01");
await listRange("2026-01-01", "2026-12-31");

const meta = info();

const client = createClient({ cache: "memory" });
await client.listYear(2035);
```

## Full Entry Usage

```ts
import { createClient, listAll, listYear } from "@liha-labs/holiday/full";

await listYear(2026);
await listAll();

const fullClient = createClient();
await fullClient.getHoliday("2026-01-01");
```

## Input Rules

- `Date` はローカル日付として `getFullYear()/getMonth()/getDate()` で正規化
- 文字列は `YYYY-MM-DD` のみ許可
- `listMonth` は `YYYY-MM` のみ許可
- 不正日付はエラー
- `weekday` はランタイムで `new Date(y, m - 1, d).getDay()` から算出
