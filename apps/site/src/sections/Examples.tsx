import { CodeEditor, Section } from '../components'
import styles from './Examples.module.css'

export const Examples = () => {
  return (
    <Section
      id="examples"
      number="05"
      title="Examples"
      subTitle="実装済みAPIのみを使ったサンプル。"
    >
      <div className={styles.exampleBlock} id="examples-basic">
        <header className={styles.exampleHeader}>
          <div className={styles.titleArea}>
            <h3 className={styles.exampleTitle}>Basic Lookup</h3>
            <div className={styles.chips}>
              <span>holidayName</span>
              <span>getHoliday</span>
            </div>
          </div>
          <p className={styles.exampleDesc}>祝日名と詳細（weekday付き）を取得します。</p>
        </header>
        <CodeEditor
          filename="basic.ts"
          code={`
import { holidayName, getHoliday } from '@liha-labs/holiday'

const name = await holidayName('2026-01-01')
const detail = await getHoliday('2026-01-01')
          `}
        />
      </div>

      <div className={styles.exampleBlock} id="examples-date-input">
        <header className={styles.exampleHeader}>
          <div className={styles.titleArea}>
            <h3 className={styles.exampleTitle}>Date Input</h3>
            <div className={styles.chips}>
              <span>Date</span>
              <span>local date</span>
            </div>
          </div>
          <p className={styles.exampleDesc}>Date オブジェクトはローカル日付として解釈されます。</p>
        </header>
        <CodeEditor
          filename="date-input.ts"
          code={`
import { isHoliday } from '@liha-labs/holiday'

const today = new Date()
const result = await isHoliday(today)
          `}
        />
      </div>

      <div className={styles.exampleBlock} id="examples-client">
        <header className={styles.exampleHeader}>
          <div className={styles.titleArea}>
            <h3 className={styles.exampleTitle}>Custom Client</h3>
            <div className={styles.chips}>
              <span>createClient</span>
              <span>cache</span>
              <span>fetch</span>
            </div>
          </div>
          <p className={styles.exampleDesc}>取得先URLやキャッシュ戦略を差し替える例です。</p>
        </header>
        <CodeEditor
          filename="client.ts"
          code={`
import { createClient } from '@liha-labs/holiday'

const client = createClient({
  remoteBaseUrl: 'https://raw.githubusercontent.com/liha-labs/holiday/main',
  cache: 'memory',
  fetch: globalThis.fetch,
})

const holidays = await client.listYear(2023)
          `}
        />
      </div>

      <div className={styles.exampleBlock} id="examples-full-entry">
        <header className={styles.exampleHeader}>
          <div className={styles.titleArea}>
            <h3 className={styles.exampleTitle}>Full Entry</h3>
            <div className={styles.chips}>
              <span>/full</span>
              <span>local only</span>
            </div>
          </div>
          <p className={styles.exampleDesc}>
            <code>@liha-labs/holiday/full</code> は remote 取得を使わず、同じAPIで返します。
          </p>
        </header>
        <CodeEditor
          filename="full.ts"
          code={`
import { listAll, listYear } from '@liha-labs/holiday/full'

await listYear(1968)
await listAll()
          `}
        />
      </div>
    </Section>
  )
}
