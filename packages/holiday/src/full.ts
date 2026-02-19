import { createHolidayClient } from "./client";
import { DEFAULT_REMOTE_BASE_URL } from "./generated/meta";
import { FULL_HOLIDAYS } from "./generated/full";
import type { ClientOptions, HolidayClient } from "./types";

export type { ClientOptions, Holiday, HolidayClient, HolidayDetail, Info, Weekday } from "./types";

/** フルデータ版クライアントを生成する。remote 取得は行わない。 */
export const createClient = (_options?: ClientOptions): HolidayClient =>
  createHolidayClient(
    {
      remoteBaseUrl: DEFAULT_REMOTE_BASE_URL,
      cache: "none"
    },
    {
      source: "full",
      localAll: FULL_HOLIDAYS
    }
  );

const defaultClient = createClient();

/** 祝日名を返すトップレベルAPI。 */
export const holidayName: HolidayClient["holidayName"] = (input) => defaultClient.holidayName(input);
/** 祝日判定を返すトップレベルAPI。 */
export const isHoliday: HolidayClient["isHoliday"] = (input) => defaultClient.isHoliday(input);
/** 祝日詳細を返すトップレベルAPI。 */
export const getHoliday: HolidayClient["getHoliday"] = (input) => defaultClient.getHoliday(input);
/** 年単位の祝日一覧を返すトップレベルAPI。 */
export const listYear: HolidayClient["listYear"] = (year) => defaultClient.listYear(year);
/** 月単位の祝日一覧を返すトップレベルAPI。 */
export const listMonth: HolidayClient["listMonth"] = (ym) => defaultClient.listMonth(ym);
/** 範囲指定の祝日一覧を返すトップレベルAPI。 */
export const listRange: HolidayClient["listRange"] = (start, end) => defaultClient.listRange(start, end);
/** 取得可能な全祝日一覧を返すトップレベルAPI。 */
export const listAll: HolidayClient["listAll"] = () => defaultClient.listAll();
/** 生成情報を返すトップレベルAPI。 */
export const info: HolidayClient["info"] = () => defaultClient.info();
