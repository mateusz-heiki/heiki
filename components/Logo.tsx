import Link from "next/link";
import styles from "./Logo.module.css";

export function Logo() {
  return (
    <Link href="/" className={styles.root} aria-label="HEIKI HEIKI — home">
      <span className={styles.wordmark}>
        <span className={styles.word}>heiki</span>
        <span className={styles.word}>heiki</span>
      </span>
      <span className={styles.suffix}>Pro</span>
    </Link>
  );
}
