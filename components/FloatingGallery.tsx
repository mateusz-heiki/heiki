"use client";

import { useState } from "react";
import styles from "./FloatingGallery.module.css";

type Tile = {
  id: string;
  kind: "photo" | "type";
  /** image aspect ratio as W/H, used to construct the picsum URL and to reserve layout space */
  ratio: number;
  src?: string;
  alt?: string;
  text?: string;
  caption?: string;
  bg?: string;
  fg?: string;
};

// Aspect ratios drive the height variation. CSS `columns` lays them out
// in masonry-style flow. Width is fixed by the column; intrinsic ratio sets height.
const TILES: Tile[] = [
  { id: "p1",  kind: "photo", ratio: 3 / 4,
    src: "https://picsum.photos/seed/heiki-botanical-01/600/800",
    alt: "Botanical study" },
  { id: "p2",  kind: "photo", ratio: 1,
    src: "https://picsum.photos/seed/heiki-texture-02/600/600",
    alt: "Material texture" },
  { id: "p3",  kind: "photo", ratio: 2 / 3,
    src: "https://picsum.photos/seed/heiki-vessel-03/600/900",
    alt: "Vessel composition" },
  { id: "t1",  kind: "type",  ratio: 1,
    text: "Nº 01", caption: "Shampoo, hair restoration.",
    bg: "var(--color-paper-pure)", fg: "var(--color-ink)" },
  { id: "p4",  kind: "photo", ratio: 3 / 4,
    src: "https://picsum.photos/seed/heiki-water-04/600/800",
    alt: "Water study" },
  { id: "p5",  kind: "photo", ratio: 4 / 5,
    src: "https://picsum.photos/seed/heiki-skin-05/600/750",
    alt: "Skin tone study" },
  { id: "p6",  kind: "photo", ratio: 1,
    src: "https://picsum.photos/seed/heiki-stone-06/600/600",
    alt: "Stone material" },
  { id: "p7",  kind: "photo", ratio: 2 / 3,
    src: "https://picsum.photos/seed/heiki-leaf-07/600/900",
    alt: "Leaf study" },
  { id: "p8",  kind: "photo", ratio: 3 / 4,
    src: "https://picsum.photos/seed/heiki-resin-08/600/800",
    alt: "Resin study" },
  { id: "t2",  kind: "type",  ratio: 4 / 5,
    text: "Care, reduced.", caption: "What works. Nothing else.",
    bg: "var(--color-tile-dark)", fg: "var(--color-paper-pure)" },
  { id: "p9",  kind: "photo", ratio: 1,
    src: "https://picsum.photos/seed/heiki-clay-09/600/600",
    alt: "Clay form" },
  { id: "p10", kind: "photo", ratio: 4 / 5,
    src: "https://picsum.photos/seed/heiki-oil-10/600/750",
    alt: "Oil pour" },
  { id: "p11", kind: "photo", ratio: 2 / 3,
    src: "https://picsum.photos/seed/heiki-shadow-11/600/900",
    alt: "Shadow study" },
  { id: "p12", kind: "photo", ratio: 1,
    src: "https://picsum.photos/seed/heiki-fiber-12/600/600",
    alt: "Fiber study" },
  { id: "p13", kind: "photo", ratio: 3 / 4,
    src: "https://picsum.photos/seed/heiki-marble-13/600/800",
    alt: "Marble texture" },
  { id: "p14", kind: "photo", ratio: 4 / 5,
    src: "https://picsum.photos/seed/heiki-glass-14/600/750",
    alt: "Glass composition" },
  { id: "p15", kind: "photo", ratio: 2 / 3,
    src: "https://picsum.photos/seed/heiki-paper-15/600/900",
    alt: "Paper texture" },
  { id: "p16", kind: "photo", ratio: 1,
    src: "https://picsum.photos/seed/heiki-pigment-16/600/600",
    alt: "Pigment study" },
  { id: "p17", kind: "photo", ratio: 3 / 4,
    src: "https://picsum.photos/seed/heiki-thread-17/600/800",
    alt: "Thread composition" },
  { id: "p18", kind: "photo", ratio: 4 / 5,
    src: "https://picsum.photos/seed/heiki-mineral-18/600/750",
    alt: "Mineral study" },
];

export function FloatingGallery() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className={styles.grid} data-has-hover={hovered != null || undefined}>
      {TILES.map((tile) => (
        <article
          key={tile.id}
          className={styles.tile}
          data-hovered={hovered === tile.id || undefined}
          onPointerEnter={() => setHovered(tile.id)}
          onPointerLeave={() => setHovered(null)}
          onFocus={() => setHovered(tile.id)}
          onBlur={() => setHovered(null)}
          tabIndex={0}
        >
          {tile.kind === "photo" ? (
            <img
              src={tile.src}
              alt={tile.alt ?? ""}
              className={styles.image}
              loading="lazy"
              decoding="async"
              draggable={false}
              style={{ aspectRatio: tile.ratio }}
            />
          ) : (
            <div
              className={styles.type}
              style={{
                background: tile.bg,
                color: tile.fg,
                aspectRatio: tile.ratio,
              }}
            >
              <span className={styles.typeMark}>{tile.text}</span>
              {tile.caption ? (
                <span className={styles.typeCaption}>{tile.caption}</span>
              ) : null}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
