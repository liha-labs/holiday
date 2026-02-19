# holiday monorepo

`@liha-labs/holiday` の実装とデータ同期を管理する pnpm workspace です。

## Repository Layout

- `data/`: 公式CSVから同期したフル期間データ（source of truth）
- `scripts/holiday/`: 同期・生成スクリプト
- `packages/holiday/`: npm 配布パッケージ本体

## Data Strategy

- ルート `data/` はフル期間を保持
- `packages/holiday/data/all.json` はフル期間を保持
- `packages/holiday/data/by-year/` は「現在年の前後2年」の年別JSONのみを保持
- `packages/holiday/src/generated/*` は同期時に再生成される

## Commands

```bash
pnpm update:holidays
```

- e-Gov CKAN から公式CSVを取得
- ルート `data/` をフル同期
- `packages/holiday/data` を配布用に再生成
- `packages/holiday/src/generated/*` を再生成

```bash
pnpm generate:holidays
```

- 既存 `data/all.json` から再生成のみ実行（再ダウンロードなし）

## Scheduling

- `.github/workflows/update-holidays.yml` は月1回実行（毎月1日 03:00 UTC）
- 実行コマンドは `pnpm update:holidays`

## Notes

- 祝日ロジックは計算しない。判定は公式データ準拠。
- 文字コードは CSV の UTF-8 / Shift_JIS 両方に対応。
