import { Section } from '../components'
import styles from './Introduction.module.css'

export const Introduction = () => {
  return (
    <Section
      id="introduction"
      number="01"
      title="Introduction"
      subTitle="公式データを正とし、利用者が誤判定リスクを背負わないことを最優先にした設計。"
    >
      <div className={styles.leadBlock}>
        <h3>What is @liha-labs/holiday?</h3>
        <p>
          <code>@liha-labs/holiday</code> は、日本の祝日データを扱うための TypeScript ライブラリです。
          春分・秋分などの計算ロジックは持たず、公式データの結果だけを返します。
        </p>
      </div>

      <div className={styles.philosophyGrid}>
        <div className={styles.philosophyColumn}>
          <h4 className={styles.label}>Design goals</h4>
          <ul className={styles.list}>
            <li>
              <span className={styles.itemTitle}>official-first</span>
              <span className={styles.itemDesc}>祝日判定は公式データ準拠</span>
            </li>
            <li>
              <span className={styles.itemTitle}>strict input</span>
              <span className={styles.itemDesc}>日付文字列は YYYY-MM-DD / YYYY-MM を厳密検証</span>
            </li>
            <li>
              <span className={styles.itemTitle}>runtime-light</span>
              <span className={styles.itemDesc}>ランタイム依存ゼロ</span>
            </li>
            <li>
              <span className={styles.itemTitle}>portable</span>
              <span className={styles.itemDesc}>fetch差し替えで Node / Browser 対応</span>
            </li>
          </ul>
        </div>

        <div className={styles.philosophyColumn}>
          <h4 className={`${styles.label} ${styles.danger}`}>Non-goals</h4>
          <ul className={styles.list}>
            <li>
              <span className={styles.itemTitle}>祝日計算</span>
              <span className={styles.itemDesc}>独自アルゴリズムで祝日を算出しない</span>
            </li>
            <li>
              <span className={styles.itemTitle}>曖昧な日付変換</span>
              <span className={styles.itemDesc}>YYYY-MM-DD 以外の文字列は受け付けない</span>
            </li>
            <li>
              <span className={styles.itemTitle}>データの自動補完</span>
              <span className={styles.itemDesc}>存在しない年を推測して生成しない</span>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.featureSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.subTitle}>Features</h3>
          <p className={styles.subLead}>運用をシンプルに保ちながら、実利用に必要な機能を提供します。</p>
        </div>
        <div className={styles.featureTable}>
          {[
            { name: 'holidayName', desc: '祝日名（string | null）を返却。' },
            { name: 'getHoliday', desc: 'date/name/weekday を返却。' },
            { name: 'listYear/listMonth/listRange', desc: '用途別の一覧取得。' },
            { name: 'createClient', desc: 'remoteBaseUrl / fetch / cache を差し替え。' },
            { name: 'default/full entry', desc: '通常版とフル同梱版を選択可能。' },
            { name: 'info()', desc: '生成時刻・対応範囲・データソースを確認。' },
          ].map((f) => (
            <div key={f.name} className={styles.featureItem}>
              <span className={styles.featureName}>{f.name}</span>
              <span className={styles.featureDesc}>{f.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.compSection}>
        <h3 className={styles.subTitle}>Compatibility</h3>
        <div className={styles.compRows}>
          <div className={styles.compRow}>
            <div className={styles.compLabel}>Runtime</div>
            <div className={styles.compValues}>
              <span className={styles.compTag}>Browser (Modern)</span>
              <span className={styles.compTag}>Node.js</span>
              <span className={styles.compTag}>ESM</span>
            </div>
          </div>
          <div className={styles.compRow}>
            <div className={styles.compLabel}>Input</div>
            <div className={styles.compValues}>
              <span className={styles.compTag}>Date</span>
              <span className={styles.compTag}>YYYY-MM-DD</span>
              <span className={styles.compTag}>YYYY-MM (listMonth)</span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
