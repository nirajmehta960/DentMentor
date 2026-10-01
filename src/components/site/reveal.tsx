import { useEffect, useState, type CSSProperties, type ElementType, type ReactNode, type RefObject } from "react";

import { cn } from "@/lib/utils";

/**
 * Scroll-in reveals. site.css only hides `[data-reveal]` under `.dm-js`, and
 * `useSiteMotion` only adds that class when an observer exists and motion is
 * wanted — so every failure path leaves the page fully visible.
 *
 * A MutationObserver hands newly mounted `[data-reveal]` / `[data-animate-idle]`
 * elements to the intersection observers, so content that arrives after load
 * (live data, route-driven tabs, filtered lists) reveals like everything else.
 */
function useRevealObserver(root: RefObject<HTMLElement>, enabled: boolean) {
  useEffect(() => {
    const node = root.current;
    if (!node || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "");
          // One-shot: re-animating on the way back up reads as flicker.
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );

    // Two-way, for animation that should only run near the viewport (the closing
    // panel's blob field) rather than for the whole scroll above it.
    const idleObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.setAttribute("data-animate-live", "");
          else entry.target.removeAttribute("data-animate-live");
        }
      },
      { rootMargin: "100% 0px 100% 0px" },
    );

    const watch = (scope: ParentNode) => {
      for (const target of scope.querySelectorAll("[data-reveal]:not([data-revealed])")) observer.observe(target);
      for (const target of scope.querySelectorAll("[data-animate-idle]")) idleObserver.observe(target);
    };
    watch(node);

    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const added of record.addedNodes) {
          if (!(added instanceof Element)) continue;
          if (added.matches("[data-reveal]:not([data-revealed])")) observer.observe(added);
          if (added.matches("[data-animate-idle]")) idleObserver.observe(added);
          watch(added);
        }
      }
    });
    mutations.observe(node, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer.disconnect();
      idleObserver.disconnect();
    };
  }, [root, enabled]);
}

/** A slow connection gets a late entrance, never a blank hero. */
const ENTER_CAP_MS = 900;

/**
 * The page's motion state, as a class string for the root. This is the ONLY
 * owner of motion classes there: React writes `className` wholesale, so a
 * `classList.add` elsewhere would be erased on the next render.
 *
 *   ""                            reduced motion — nothing is ever hidden
 *   "dm-enter"                    hidden, waiting (set during render, so the
 *                                 first committed DOM already carries it)
 *   "dm-js dm-enter dm-entered"   released; reveals armed
 *
 * The release waits for fonts and, if given, the page's key image (the
 * landing's hero screenshot), raced against a cap. No requestAnimationFrame: it
 * never fires in a background tab, which would leave the hero at opacity 0.
 */
export function useSiteMotion(
  root: RefObject<HTMLElement>,
  { waitForImage = null }: { waitForImage?: string | null } = {},
): string {
  const [{ animate, observe }] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return { animate: false, observe: false };
    const wanted = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return { animate: wanted, observe: wanted && typeof IntersectionObserver !== "undefined" };
  });
  const [entered, setEntered] = useState(false);

  useRevealObserver(root, observe);

  useEffect(() => {
    if (!animate) return;
    let cancelled = false;

    const image = waitForImage ? new Image() : null;
    if (image) image.src = waitForImage as string;
    const settled = Promise.all([
      image?.decode ? image.decode().catch(() => undefined) : Promise.resolve(),
      document.fonts?.ready ?? Promise.resolve(),
    ]);
    const capped = new Promise<void>((resolve) => setTimeout(resolve, ENTER_CAP_MS));

    void Promise.race([settled, capped]).then(() => {
      if (!cancelled) setEntered(true);
    });
    return () => {
      cancelled = true;
    };
  }, [animate, waitForImage]);

  return cn(observe && "dm-js", animate && "dm-enter", entered && "dm-entered");
}

/** One element in the hero's load sequence. `rise` overrides travel for large elements. */
export function Enter({
  as: Component = "div",
  delay = 0,
  rise,
  className,
  children,
}: {
  as?: ElementType;
  delay?: number;
  rise?: number;
  className?: string;
  children: ReactNode;
}) {
  const style: Record<string, string> = {};
  if (delay) style["--enter-delay"] = `${delay}s`;
  if (rise !== undefined) style["--enter-rise"] = `${rise}px`;

  return (
    <Component
      data-enter=""
      style={Object.keys(style).length ? (style as CSSProperties) : undefined}
      className={className}
    >
      {children}
    </Component>
  );
}

/** One revealed element. Don't nest one inside another — see `useRevealObserver`. */
export function Reveal({
  as: Component = "div",
  delay = 0,
  className,
  children,
}: {
  as?: ElementType;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Component
      data-reveal=""
      style={delay ? ({ "--reveal-delay": `${delay}s` } as CSSProperties) : undefined}
      className={className}
    >
      {children}
    </Component>
  );
}
