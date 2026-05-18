import { FloatingGallery } from "@/components/FloatingGallery";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarMeta}>
          <span className={styles.kicker}>Partner Portal</span>
          <span className={styles.kickerDot} aria-hidden="true">·</span>
          <span className={styles.kicker}>Spring / Summer 2026</span>
        </div>
        <div className={styles.topbarActions}>
          <a className={styles.topbarLink} href="/in-media">
            Press kit
          </a>
          <a className={styles.topbarLink} href="mailto:partners@heikiheiki.com">
            Contact
          </a>
        </div>
      </header>

      <section className={styles.heroIntro}>
        <h1 className={styles.heroTitle}>
          A working archive for partners.
        </h1>
        <p className={styles.heroLede}>
          Products, ingredients, science, and the brand world. Built for
          distributors, retail buyers, and the people we work with closely.
        </p>
      </section>

      <FloatingGallery />

      <section className={styles.threadRow} aria-label="Highlighted threads">
        <Thread
          kicker="Catalogue"
          title="Spring index"
          body="The full product list, current packaging, retail-ready specs, and CMYK / Pantone references."
          href="/products/haircare"
          hrefLabel="Open catalogue"
        />
        <Thread
          kicker="Reference"
          title="Ingredient database"
          body="Every functional ingredient, sourced, profiled, with our compatibility notes and supplier chain."
          href="/ingredients"
          hrefLabel="Browse ingredients"
        />
        <Thread
          kicker="Brand"
          title="Visual world"
          body="Imagery, type specimens, packaging shots, and the assets approved for press and retail use."
          href="/visual-world"
          hrefLabel="See assets"
        />
      </section>

      <footer className={styles.footer}>
        <p className={styles.footerNote}>
          HEIKI HEIKI Pro · For accredited partners. Public store at{" "}
          <a className={styles.footerLink} href="https://heikiheiki.com">
            heikiheiki.com
          </a>
          .
        </p>
      </footer>
    </div>
  );
}

function Thread({
  kicker,
  title,
  body,
  href,
  hrefLabel,
}: {
  kicker: string;
  title: string;
  body: string;
  href: string;
  hrefLabel: string;
}) {
  return (
    <article className={styles.thread}>
      <span className={styles.threadKicker}>{kicker}</span>
      <h3 className={styles.threadTitle}>{title}</h3>
      <p className={styles.threadBody}>{body}</p>
      <a className={styles.threadLink} href={href}>
        {hrefLabel}
        <span className={styles.threadChevron} aria-hidden="true">
          ›
        </span>
      </a>
    </article>
  );
}
