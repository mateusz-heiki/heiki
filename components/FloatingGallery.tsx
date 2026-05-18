"use client";

import { useEffect, useReducer, useRef } from "react";
import styles from "./FloatingGallery.module.css";

type Tile = {
  id: string;
  kind: "photo" | "type";
  /** position in container, 0..1 */
  x: number;
  y: number;
  /** size in px */
  w: number;
  h: number;
  /** parallax depth, 0..1; larger = moves more with mouse */
  depth: number;
  /** rotation in degrees */
  rotation: number;
  /** independent float phase, 0..2π */
  phase: number;
  /** float amplitude in px */
  amp: number;
  /** float period in ms */
  period: number;
  /** image src (photo) or text + bg (type) */
  src?: string;
  alt?: string;
  text?: string;
  caption?: string;
  bg?: string;
  fg?: string;
};

const TILES: Tile[] = [
  // Distributed in a clustered freeform layout. Coordinates are fractional (0..1)
  // and refer to the container; tile sizes are absolute.
  { id: "p1",  kind: "photo", x: 0.08, y: 0.22, w: 240, h: 320, depth: 0.55, rotation: -2.0,
    phase: 0.0, amp: 12, period: 9000,
    src: "https://picsum.photos/seed/heiki-botanical-01/480/640",
    alt: "Botanical study" },
  { id: "p2",  kind: "photo", x: 0.22, y: 0.62, w: 280, h: 280, depth: 0.85, rotation: 1.5,
    phase: 1.7, amp: 14, period: 11000,
    src: "https://picsum.photos/seed/heiki-texture-02/560/560",
    alt: "Material texture" },
  { id: "t1",  kind: "type",  x: 0.35, y: 0.12, w: 220, h: 220, depth: 0.40, rotation: -1.0,
    phase: 0.9, amp: 8, period: 12000,
    text: "Nº 01", caption: "Shampoo, hair restoration",
    bg: "var(--color-paper-pure)", fg: "var(--color-ink)" },
  { id: "p3",  kind: "photo", x: 0.42, y: 0.48, w: 320, h: 400, depth: 1.0, rotation: 2.5,
    phase: 2.1, amp: 14, period: 10500,
    src: "https://picsum.photos/seed/heiki-vessel-03/640/800",
    alt: "Vessel composition" },
  { id: "p4",  kind: "photo", x: 0.58, y: 0.18, w: 260, h: 340, depth: 0.65, rotation: -1.8,
    phase: 3.4, amp: 11, period: 13000,
    src: "https://picsum.photos/seed/heiki-water-04/520/680",
    alt: "Water study" },
  { id: "t2",  kind: "type",  x: 0.75, y: 0.42, w: 220, h: 280, depth: 0.45, rotation: 1.0,
    phase: 4.2, amp: 9, period: 11500,
    text: "Nº 02", caption: "Body serum, daily",
    bg: "var(--color-tile-dark)", fg: "var(--color-paper-pure)" },
  { id: "p5",  kind: "photo", x: 0.82, y: 0.70, w: 280, h: 380, depth: 0.95, rotation: -2.5,
    phase: 5.1, amp: 13, period: 9500,
    src: "https://picsum.photos/seed/heiki-skin-05/560/760",
    alt: "Skin tone study" },
  { id: "p6",  kind: "photo", x: 0.05, y: 0.78, w: 220, h: 290, depth: 0.50, rotation: 1.2,
    phase: 0.6, amp: 10, period: 10000,
    src: "https://picsum.photos/seed/heiki-stone-06/440/580",
    alt: "Stone material" },
  { id: "p7",  kind: "photo", x: 0.16, y: 0.05, w: 200, h: 200, depth: 0.30, rotation: 2.0,
    phase: 1.2, amp: 7, period: 13500,
    src: "https://picsum.photos/seed/heiki-leaf-07/400/400",
    alt: "Leaf study" },
  { id: "t3",  kind: "type",  x: 0.62, y: 0.78, w: 260, h: 200, depth: 0.55, rotation: -0.8,
    phase: 2.8, amp: 9, period: 12500,
    text: "Care, reduced.", caption: "What works. Nothing else.",
    bg: "var(--color-paper)", fg: "var(--color-ink)" },
  { id: "p8",  kind: "photo", x: 0.30, y: 0.35, w: 180, h: 240, depth: 0.35, rotation: 1.6,
    phase: 3.9, amp: 7, period: 14000,
    src: "https://picsum.photos/seed/heiki-resin-08/360/480",
    alt: "Resin study" },
  { id: "p9",  kind: "photo", x: 0.93, y: 0.05, w: 200, h: 260, depth: 0.40, rotation: -1.5,
    phase: 4.7, amp: 8, period: 11800,
    src: "https://picsum.photos/seed/heiki-clay-09/400/520",
    alt: "Clay form" },
  { id: "p10", kind: "photo", x: 0.50, y: 0.85, w: 240, h: 200, depth: 0.70, rotation: 1.0,
    phase: 5.6, amp: 11, period: 10200,
    src: "https://picsum.photos/seed/heiki-oil-10/480/400",
    alt: "Oil pour" },
  { id: "p11", kind: "photo", x: 0.95, y: 0.92, w: 220, h: 270, depth: 0.60, rotation: -1.0,
    phase: 0.3, amp: 10, period: 12200,
    src: "https://picsum.photos/seed/heiki-shadow-11/440/540",
    alt: "Shadow study" },
  { id: "p12", kind: "photo", x: 0.40, y: 0.02, w: 220, h: 180, depth: 0.25, rotation: 0.6,
    phase: 1.5, amp: 6, period: 14500,
    src: "https://picsum.photos/seed/heiki-fiber-12/440/360",
    alt: "Fiber study" },
  { id: "p13", kind: "photo", x: 0.70, y: 0.05, w: 200, h: 250, depth: 0.30, rotation: -0.6,
    phase: 2.4, amp: 7, period: 13200,
    src: "https://picsum.photos/seed/heiki-marble-13/400/500",
    alt: "Marble texture" },
  { id: "p14", kind: "photo", x: 0.08, y: 0.42, w: 200, h: 250, depth: 0.45, rotation: 1.9,
    phase: 3.3, amp: 9, period: 11000,
    src: "https://picsum.photos/seed/heiki-glass-14/400/500",
    alt: "Glass composition" },
];

type State = {
  /** mouse position in container, -1..1 each */
  mx: number;
  my: number;
  /** time in ms since mount */
  t: number;
  /** id of tile being hovered, or null */
  hovered: string | null;
};

type Action =
  | { type: "mouse"; mx: number; my: number }
  | { type: "tick"; t: number }
  | { type: "hover"; id: string | null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "mouse":
      return { ...state, mx: action.mx, my: action.my };
    case "tick":
      return { ...state, t: action.t };
    case "hover":
      return { ...state, hovered: action.id };
  }
}

export function FloatingGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(reducer, { mx: 0, my: 0, t: 0, hovered: null });
  const reducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      reducedMotion.current = e.matches;
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion.current) return;
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const my = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      dispatch({ type: "mouse", mx, my });
    };
    const onLeave = () => dispatch({ type: "mouse", mx: 0, my: 0 });
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion.current) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      dispatch({ type: "tick", t: now - start });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={styles.stage}>
      <div
        ref={containerRef}
        className={styles.container}
        data-has-hover={state.hovered != null || undefined}
      >
        {TILES.map((tile) => {
          const floatX = reducedMotion.current
            ? 0
            : Math.sin((state.t / tile.period) * 2 * Math.PI + tile.phase) * tile.amp;
          const floatY = reducedMotion.current
            ? 0
            : Math.cos((state.t / (tile.period * 1.13)) * 2 * Math.PI + tile.phase * 0.8) *
              (tile.amp * 0.8);
          const parallaxX = reducedMotion.current ? 0 : -state.mx * 22 * tile.depth;
          const parallaxY = reducedMotion.current ? 0 : -state.my * 18 * tile.depth;
          const isHovered = state.hovered === tile.id;
          const otherHovered = state.hovered != null && !isHovered;
          const lift = isHovered ? -4 : 0;

          const transform = `translate3d(${parallaxX + floatX}px, ${parallaxY + floatY + lift}px, 0) rotate(${tile.rotation}deg)`;

          return (
            <div
              key={tile.id}
              className={styles.tile}
              data-hovered={isHovered || undefined}
              data-dimmed={otherHovered || undefined}
              style={{
                left: `${tile.x * 100}%`,
                top: `${tile.y * 100}%`,
                width: `${tile.w}px`,
                height: `${tile.h}px`,
                transform,
                zIndex: isHovered ? 10 : Math.round(tile.depth * 8),
              }}
              onPointerEnter={() => dispatch({ type: "hover", id: tile.id })}
              onPointerLeave={() => dispatch({ type: "hover", id: null })}
              onFocus={() => dispatch({ type: "hover", id: tile.id })}
              onBlur={() => dispatch({ type: "hover", id: null })}
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
                />
              ) : (
                <div
                  className={styles.type}
                  style={{ background: tile.bg, color: tile.fg }}
                >
                  <span className={styles.typeMark}>{tile.text}</span>
                  {tile.caption ? (
                    <span className={styles.typeCaption}>{tile.caption}</span>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
