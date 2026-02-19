import { readAllJsonRecords, writeDataAndGeneratedFiles } from "./generate-artifacts";

/** 既存の `all.json` から生成物を再構築するエントリーポイント。 */
const main = async (): Promise<void> => {
  const records = await readAllJsonRecords();
  await writeDataAndGeneratedFiles(records);
  process.stdout.write(`generated from all.json: ${records.length} records\n`);
};

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
