import { Section } from '../components'
import styles from './ApiReference.module.css'

export const ApiReference = () => {
  return (
    <Section
      id="reference"
      number="04"
      title="API Reference"
      subTitle="実装済みAPIと返り値仕様。"
    >
      <div className={styles.refBlock} id="reference-create-client">
        <h3 className={styles.refTitle}>createClient(options?)</h3>
        <p className={styles.refDesc}>HolidayClient インスタンスを生成します。</p>
        <div className={styles.signature}>
          <code>createClient(options?: ClientOptions): HolidayClient</code>
        </div>
      </div>

      <div className={styles.refBlock} id="reference-top-level">
        <h3 className={styles.refTitle}>Top-level Functions</h3>
        <div className={styles.methodList}>
          <code>holidayName(input): Promise&lt;string | null&gt;</code>
          <code>isHoliday(input): Promise&lt;boolean&gt;</code>
          <code>getHoliday(input): Promise&lt;HolidayDetail | null&gt;</code>
          <code>listYear(year): Promise&lt;HolidayDetail[]&gt;</code>
          <code>listMonth(ym): Promise&lt;HolidayDetail[]&gt;</code>
          <code>listRange(start, end): Promise&lt;HolidayDetail[]&gt;</code>
          <code>listAll(): Promise&lt;HolidayDetail[]&gt;</code>
          <code>info(): Info</code>
        </div>
      </div>

      <div className={styles.refBlock} id="reference-types">
        <h3 className={styles.refTitle}>Core Types</h3>
        <div className={styles.propGrid}>
          <div className={styles.propRow}>
            <div className={styles.propName}>Holiday</div>
            <div className={styles.propDetail}>
              <code>{`{ date: "YYYY-MM-DD"; name: string }`}</code>
            </div>
          </div>
          <div className={styles.propRow}>
            <div className={styles.propName}>HolidayDetail</div>
            <div className={styles.propDetail}>
              <code>{`Holiday & { weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6 }`}</code>
            </div>
          </div>
          <div className={styles.propRow}>
            <div className={styles.propName}>Info</div>
            <div className={styles.propDetail}>
              <p>
                <code>generatedAt</code>, <code>bundledYears</code>, <code>fullRange</code>,{' '}
                <code>source</code>, <code>remote</code> を返します。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.refBlock} id="reference-client-options">
        <h3 className={styles.refTitle}>ClientOptions</h3>
        <div className={styles.propGrid}>
          <div className={styles.propRow}>
            <div className={styles.propName}>remoteBaseUrl</div>
            <div className={styles.propDetail}>
              <code>string</code>
              <p>年別JSON取得先のベースURL。</p>
            </div>
          </div>
          <div className={styles.propRow}>
            <div className={styles.propName}>fetch</div>
            <div className={styles.propDetail}>
              <code>typeof globalThis.fetch</code>
              <p>取得時に使う fetch 実装。</p>
            </div>
          </div>
          <div className={styles.propRow}>
            <div className={styles.propName}>cache</div>
            <div className={styles.propDetail}>
              <code>"memory" | "none"</code>
              <p>
                <code>memory</code> は年ごとに Promise をメモ化し、同時多重fetchを抑止します。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.refBlock} id="reference-behavior">
        <h3 className={styles.refTitle}>Behavior Notes</h3>
        <div className={styles.note}>
          <strong>文字列入力:</strong> <code>YYYY-MM-DD</code>（または <code>listMonth</code> の{' '}
          <code>YYYY-MM</code>）以外は例外。
        </div>
        <div className={styles.note}>
          <strong>Date 入力:</strong> ローカル日付の <code>getFullYear/getMonth/getDate</code> で正規化。
        </div>
        <div className={styles.note}>
          <strong>weekday:</strong> <code>new Date(y, m - 1, d).getDay()</code> でランタイム算出。
        </div>
        <div className={styles.note}>
          <strong>listRange:</strong> 終端日を含む範囲取得です。
        </div>
      </div>
    </Section>
  )
}
