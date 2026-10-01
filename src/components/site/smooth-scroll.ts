import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * The landing's scroll: Lenis on the wheel, native touch.
 *
 * Everything scroll-derived subscribes through `onScrollFrame`, which is fed from
 * Lenis's own `scroll` event — the same tick Lenis writes the position. A separate
 * `scroll` listener fires a frame later, which makes parallax drag behind the
 * page. Subscribers get the position handed in and must not read layout.
 *
 * Keep per-frame paint cheap (no live `filter`, no layout reads in the scroll
 * path) or this will feel rough and the scroll model will get the blame.
 */

/** THE dial for how heavy the scroll feels. 0.1 is Lenis's default. */
const LERP = 0.1;

/** Extra room above an anchored section, on top of the header's height. */
const ANCHOR_GAP_PX = 18;

/** How long an arriving hash keeps re-aiming as late content changes the page height. */
const SETTLE_MS = 2500;
const USER_SCROLL_EVENTS = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

type Subscriber = (scrollY: number) => void;

const subscribers = new Set<Subscriber>();
let lenis: Lenis | null = null;
let nativeRaf = 0;

function flush(y: number) {
  for (const fn of subscribers) fn(y);
}

// Fallback when Lenis isn't running (reduced motion). Guarded on `lenis`
// because Lenis's own writes also fire native scroll events.
function onNativeScroll() {
  if (lenis || nativeRaf) return;
  nativeRaf = requestAnimationFrame(() => {
    nativeRaf = 0;
    flush(window.scrollY);
  });
}

export function onScrollFrame(fn: Subscriber): () => void {
  if (subscribers.size === 0 && typeof window !== "undefined") {
    window.addEventListener("scroll", onNativeScroll, { passive: true });
  }
  subscribers.add(fn);

  return () => {
    subscribers.delete(fn);
    if (subscribers.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("scroll", onNativeScroll);
      if (nativeRaf) {
        cancelAnimationFrame(nativeRaf);
        nativeRaf = 0;
      }
    }
  };
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Send the page to `y`, through Lenis so the wheel and anchors share one owner. */
export function smoothScrollTo(y: number) {
  if (typeof window === "undefined") return;

  const limit = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const clamped = Math.min(limit, Math.max(0, y));
  if (Math.abs(clamped - window.scrollY) < 1) return;

  if (!lenis || prefersReducedMotion()) {
    window.scrollTo(0, clamped);
    return;
  }
  // No options: the instance's own lerp, i.e. the same motion as the wheel.
  lenis.scrollTo(clamped);
}

/** Scroll to the element a `#id` names, clearing the fixed header. */
function scrollToHash(hash: string): boolean {
  const section = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!section) return false;

  const header = document.querySelector("header");
  const offset = (header instanceof HTMLElement ? header.offsetHeight : 0) + ANCHOR_GAP_PX;
  smoothScrollTo(section.getBoundingClientRect().top + window.scrollY - offset);
  return true;
}

/**
 * Creates the Lenis instance (none at all under reduced motion) and routes
 * in-page anchor clicks through it. Lenis's own `anchors` option is left off:
 * it doesn't `preventDefault`, so the browser's instant jump wins, and it knows
 * nothing about the fixed header.
 */
export function useSiteScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let instance: Lenis | null = null;
    if (!prefersReducedMotion()) {
      instance = new Lenis({ lerp: LERP, autoRaf: true });
      lenis = instance;
      instance.on("scroll", ({ scroll }: { scroll: number }) => flush(scroll));
    }

    // Delegated on `document`, not the landing root: the mobile menu is
    // portalled to <body> and its links would otherwise be missed.
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const node = event.target;
      if (!(node instanceof Element)) return;
      const anchor = node.closest("a");
      if (!anchor) return;

      // `getAttribute`, not `.href`, which resolves to an absolute URL.
      const href = anchor.getAttribute("href");
      if (!href || href.charAt(0) !== "#" || href.length < 2) return;
      if (!scrollToHash(href)) return;

      event.preventDefault();
      // pushState, not `location.hash`, which triggers the browser's own jump.
      if (window.location.hash !== href) window.history.pushState(null, "", href);
    };
    document.addEventListener("click", onClick);

    // A hash the page arrived with (`/#faq`). Two frames so the bands and the
    // fixed header are laid out before measuring. The mentors band fills in
    // after load and can move everything below it, so for a short settle window
    // a height change re-aims — until the visitor touches the page, after which
    // the scroll is theirs.
    const arrived = window.location.hash;
    let outer = 0;
    let inner = 0;
    let settle: ResizeObserver | null = null;
    let settleTimer = 0;
    const endSettle = () => {
      settle?.disconnect();
      settle = null;
      window.clearTimeout(settleTimer);
      for (const type of USER_SCROLL_EVENTS) window.removeEventListener(type, endSettle);
    };
    if (arrived.length > 1) {
      outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => {
          if (!scrollToHash(arrived)) return;
          settle = new ResizeObserver(() => scrollToHash(arrived));
          settle.observe(document.documentElement);
          settleTimer = window.setTimeout(endSettle, SETTLE_MS);
          for (const type of USER_SCROLL_EVENTS) window.addEventListener(type, endSettle, { passive: true, once: true });
        });
      });
    }

    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
      endSettle();
      document.removeEventListener("click", onClick);
      if (instance) {
        instance.destroy();
        if (lenis === instance) lenis = null;
      }
    };
  }, []);
}
