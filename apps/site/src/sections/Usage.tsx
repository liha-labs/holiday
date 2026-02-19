import { CodeEditor, Section } from '../components'
import styles from './Usage.module.css'

export const Usage = () => {
  return (
    <Section
      id="usage"
      number="03"
      title="Usage"
      subTitle="実運用で使う主要パターンを、実装仕様に沿って整理。"
    >
      <div className={styles.subSection}>
        <h3 className={styles.subTitle}>Top-level Functions</h3>
        <p className={styles.desc}>最小コードで使うならトップレベル関数が最短です。</p>
        <CodeEditor
          filename="top-level.ts"
          code={`
import { holidayName, isHoliday, getHoliday } from '@liha-labs/holiday'

await holidayName('2026-01-01')
await isHoliday('2026-01-02')
await getHoliday('2026-01-01')
          `}
        />
      </div>

      <div className={styles.subSection}>
        <h3 className={styles.subTitle}>createClient(options)</h3>
        <p className={styles.desc}>
          remote base URL / fetch 実装 / キャッシュ戦略を差し替える場合はクライアントを生成します。
        </p>
        <CodeEditor
          filename="client.ts"
          code={`
import { createClient } from '@liha-labs/holiday'

const client = createClient({
  remoteBaseUrl: 'https://raw.githubusercontent.com/liha-labs/holiday/main',
  fetch: globalThis.fetch,
  cache: 'memory',
})

await client.listYear(2023)
          `}
        />
      </div>

      <div className={styles.subSection}>
        <h3 className={styles.subTitle}>Date Input Rules</h3>
        <CodeEditor
          filename="input.ts"
          code={`
import { listMonth, holidayName } from '@liha-labs/holiday'

await holidayName(new Date())
await holidayName('2026-01-01')
await listMonth('2026-01')

// 以下は例外
await holidayName('2026/01/01')
await holidayName('2026-1-1')
          `}
        />
      </div>

      <div className={styles.subSection}>
        <h3 className={styles.subTitle}>Range and All</h3>
        <CodeEditor
          filename="range.ts"
          code={`
import { listRange, listAll, info } from '@liha-labs/holiday'

const selected = await listRange('2026-01-01', '2026-12-31')
const all = await listAll()
const meta = info()

console.log(meta.fullRange)
          `}
        />
      </div>

      <div className={styles.subSection}>
        <h3 className={styles.subTitle}>Full Entry</h3>
        <p className={styles.desc}>
          <code>@liha-labs/holiday/full</code> は全期間同梱で、remote 取得を使いません。
        </p>
        <CodeEditor
          filename="full.ts"
          code={`
import { listYear, createClient } from '@liha-labs/holiday/full'

await listYear(1960)

const fullClient = createClient()
await fullClient.listAll()
          `}
        />
      </div>
    </Section>
  )
}
