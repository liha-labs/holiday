import { ENV } from '../config'
import styles from './Footer.module.css'

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.backgroundText}>{ENV.PACKAGE.NAME}</div>

      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.brand}>
            <h2 className={styles.logo}>{ENV.PACKAGE.NAME}</h2>
            <p className={styles.tagline}>日本の祝日を公式データ準拠で扱うための TypeScript ライブラリ。</p>
            <p className={styles.catchphrase}>No guesswork. Just official holiday data.</p>
          </div>

          <div className={styles.linksContainer}>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkHeading}>Resource</h4>
              <nav className={styles.nav}>
                <a href="#introduction">Docs</a>
                <a href={ENV.RESOURCE.GITHUB} target="_blank" rel="noreferrer">
                  GitHub
                </a>
                <a href={ENV.RESOURCE.NPM} target="_blank" rel="noreferrer">
                  npm
                </a>
              </nav>
            </div>

            <div className={styles.linkGroup}>
              <h4 className={styles.linkHeading}>Community</h4>
              <nav className={styles.nav}>
                <a href={ENV.COMMUNITY.DISCORD} target="_blank" rel="noreferrer">
                  Discord
                </a>
                <a href={ENV.COMMUNITY.X} target="_blank" rel="noreferrer">
                  X
                </a>
              </nav>
              <p className={styles.communityCta}>Feedback and issues are welcome.</p>
            </div>
          </div>
        </div>

        <div className={styles.bottomSection}>
          <div className={styles.meta}>
            <div className={styles.producedBy}>
              <span>Produced by</span>
              <img src="/liha-lab-logo.svg" alt="Liha Labs" className={styles.lihaLogo} width={20} height={20} />
              <strong>Liha Labs</strong>
            </div>
            <span>© 2026 Liha Labs. Released under the MIT License.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
