import { decode as decodeIconv } from "iconv-lite";
import { recordsFromCsv, writeDataAndGeneratedFiles } from "./generate-artifacts";

type CkanResource = {
  format?: string;
  url?: string;
  name?: string;
};

type CkanResponse = {
  success: boolean;
  result?: {
    resources?: CkanResource[];
  };
};

const DATASET_ID = "cao_20190522_0002";
const CKAN_ENDPOINT = `https://data.e-gov.go.jp/data/api/action/package_show?id=${DATASET_ID}`;

/** CKAN の resources からCSVリソースURLを選択する。 */
function pickCsvResource(resources: CkanResource[]): string {
  for (const resource of resources) {
    const format = resource.format?.toLowerCase() ?? "";
    const name = resource.name?.toLowerCase() ?? "";
    const url = resource.url ?? "";
    if (format === "csv" || name.includes("csv") || url.toLowerCase().endsWith(".csv")) {
      if (url) {
        return url;
      }
    }
  }

  throw new Error("CSV resource URL not found in CKAN response");
}

/** CSVバイト列を UTF-8 / Shift_JIS 判定でデコードする。 */
function decodeCsv(buffer: ArrayBuffer): string {
  const bytes = Buffer.from(buffer);
  const utf8 = bytes.toString("utf8");

  const mojibakeScore = (utf8.match(/�/g) ?? []).length;
  if (mojibakeScore <= 5) {
    return utf8;
  }

  return decodeIconv(bytes, "shift_jis");
}

/** 公式CSVを取得してデータ生成を実行するエントリーポイント。 */
const main = async (): Promise<void> => {
  const ckanRes = await fetch(CKAN_ENDPOINT);
  if (!ckanRes.ok) {
    throw new Error(`Failed to fetch CKAN package: ${ckanRes.status} ${ckanRes.statusText}`);
  }

  const ckan = (await ckanRes.json()) as CkanResponse;
  if (!ckan.success || !ckan.result?.resources?.length) {
    throw new Error("CKAN response does not include resources");
  }

  const csvUrl = pickCsvResource(ckan.result.resources);
  const csvRes = await fetch(csvUrl);
  if (!csvRes.ok) {
    throw new Error(`Failed to fetch official CSV: ${csvRes.status} ${csvRes.statusText}`);
  }

  const csvText = decodeCsv(await csvRes.arrayBuffer());
  const records = recordsFromCsv(csvText);

  await writeDataAndGeneratedFiles(records, {
    generatedAt: new Date().toISOString()
  });

  process.stdout.write(`updated holidays from ${csvUrl}: ${records.length} records\n`);
};

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
