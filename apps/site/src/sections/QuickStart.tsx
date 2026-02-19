import { CodeEditor, Section } from '../components'
import styles from './QuickStart.module.css'

export const QuickStart = () => {
  const installCode = `pnpm add @liha-labs/holiday`

  const minimalCode = `
import { holidayName, getHoliday } from '@liha-labs/holiday'

const name = await holidayName('2026-01-01')
const detail = await getHoliday('2026-01-01')
  `.trim()

  const listCode = `
import { listMonth, listRange } from '@liha-labs/holiday'

const january = await listMonth('2026-01')
const spring = await listRange('2026-03-01', '2026-05-31')
  `.trim()

  const strictCode = `
import { holidayName } from '@liha-labs/holiday'

await holidayName('2026-01-01') // OK
await holidayName('2026-1-1')   // Error: YYYY-MM-DD のみ許可
await holidayName('2026-02-30') // Error: 暦上不正
  `.trim()

  return (
    <Section
      id="quickstart"
      number="02"
      title="Quick Start"
      subTitle="最小限の導入で、公式データ準拠の祝日判定をすぐ利用できます。"
    >
      <div className={styles.step}>
        <div className={styles.stepInfo}>
          <span className={styles.stepNumber}>STEP 01</span>
          <h4>Install</h4>
          <p>
            標準として <code>pnpm</code> を推奨します。
          </p>
        </div>
        <CodeEditor code={`$ ${installCode}`} lang="bash" withHeader={false} filename="install" />
      </div>

      <div className={styles.step}>
        <div className={styles.stepInfo}>
          <span className={styles.stepNumber}>STEP 02</span>
          <h4>Basic Lookup</h4>
          <p>祝日名と詳細（曜日付き）を取得します。</p>
        </div>
        <CodeEditor code={minimalCode} filename="basic.ts" />
      </div>

      <div className={styles.step}>
        <div className={styles.stepInfo}>
          <span className={styles.stepNumber}>STEP 03</span>
          <h4>List APIs</h4>
          <p>月・範囲で一覧取得できます。</p>
        </div>
        <CodeEditor code={listCode} filename="list.ts" />
      </div>

      <div className={styles.step}>
        <div className={styles.stepInfo}>
          <span className={styles.stepNumber}>STEP 04</span>
          <h4>Strict Input</h4>
          <p>文字列入力は厳密に検証されます。</p>
        </div>
        <CodeEditor code={strictCode} filename="strict.ts" />
      </div>
    </Section>
  )
}
