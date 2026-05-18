"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAVIGATION, type NavBranch } from "@/lib/navigation";
import { Logo } from "./Logo";
import styles from "./Sidebar.module.css";

function isActive(pathname: string, href: string): boolean {
  return pathname === href;
}

function isWithin(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

function Branch({ item, pathname }: { item: NavBranch; pathname: string }) {
  const within = isWithin(pathname, item.href);
  const [open, setOpen] = useState<boolean>(within);

  useEffect(() => {
    if (within) setOpen(true);
  }, [within]);

  const hasChildren = Boolean(item.children?.length);
  const active = isActive(pathname, item.href);

  return (
    <li className={styles.branch}>
      <div className={styles.branchRow} data-active={active || undefined}>
        <Link
          href={item.href}
          className={styles.rowLink}
          aria-current={active ? "page" : undefined}
        >
          {item.label}
        </Link>
        {hasChildren ? (
          <button
            type="button"
            className={styles.toggle}
            aria-label={open ? `Collapse ${item.label}` : `Expand ${item.label}`}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              viewBox="0 0 10 10"
              width="9"
              height="9"
              aria-hidden="true"
              style={{
                transform: `rotate(${open ? 90 : 0}deg)`,
                transition: "transform var(--duration-base) var(--ease-out-quint)",
              }}
            >
              <path
                d="M3 1.5 L7 5 L3 8.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : null}
      </div>
      {hasChildren ? (
        <ul className={styles.leaves} data-open={open || undefined}>
          {item.children!.map((leaf) => {
            const leafActive = isActive(pathname, leaf.href);
            return (
              <li key={leaf.href} className={styles.leaf} data-active={leafActive || undefined}>
                <Link
                  href={leaf.href}
                  className={styles.rowLink}
                  aria-current={leafActive ? "page" : undefined}
                >
                  {leaf.label}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </li>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        className={styles.mobileTrigger}
        aria-label="Open navigation"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(true)}
      >
        <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
          <path
            d="M2 4 H14 M2 8 H14 M2 12 H14"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <aside
        className={styles.sidebar}
        data-mobile-open={mobileOpen || undefined}
        aria-label="Primary"
      >
        <div className={styles.head}>
          <Logo />
          <button
            type="button"
            className={styles.mobileClose}
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path
                d="M3 3 L13 13 M13 3 L3 13"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <nav className={styles.nav}>
          {NAVIGATION.map((section) => (
            <section key={section.label} className={styles.section}>
              <h2 className={styles.sectionLabel}>{section.label}</h2>
              <ul className={styles.branches}>
                {section.items.map((item) => (
                  <Branch key={item.href} item={item} pathname={pathname} />
                ))}
              </ul>
            </section>
          ))}
        </nav>

        <footer className={styles.foot}>
          <p className={styles.footMeta}>Partner Portal · v0.1</p>
        </footer>
      </aside>

      <div
        className={styles.scrim}
        data-visible={mobileOpen || undefined}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
    </>
  );
}
