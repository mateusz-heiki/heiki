import Link from "next/link";
import { findNavBreadcrumb } from "@/lib/navigation";
import styles from "./PlaceholderPage.module.css";

type Props = {
  pathname: string;
  title: string;
  description?: string;
};

export function PlaceholderPage({ pathname, title, description }: Props) {
  const crumb = findNavBreadcrumb(pathname);
  return (
    <div className={styles.page}>
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/" className={styles.crumbHome}>
          Home
        </Link>
        {crumb.map((part, i) => (
          <span key={`${part}-${i}`} className={styles.crumbItem}>
            <span className={styles.crumbSep} aria-hidden="true">
              /
            </span>
            {part}
          </span>
        ))}
      </nav>

      <header className={styles.head}>
        <span className={styles.kicker}>Section</span>
        <h1 className={styles.title}>{title}</h1>
        {description ? <p className={styles.desc}>{description}</p> : null}
      </header>

      <section className={styles.statusCard}>
        <span className={styles.statusKicker}>Scaffolded route</span>
        <p className={styles.statusBody}>
          This page is a placeholder so the navigation tree resolves end-to-end.
          Content lands in the next pass.
        </p>
      </section>
    </div>
  );
}
