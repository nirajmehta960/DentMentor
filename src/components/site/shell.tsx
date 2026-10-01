import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { SiteFooter } from "./footer";
import { SiteNav, type NavTone } from "./nav";
import { useSiteMotion } from "./reveal";
import { useSiteScroll } from "./smooth-scroll";

import "./site.css";

/**
 * The chrome around every public page: scope, motion, Lenis scroll, nav, footer.
 *
 * `nav="overlay"` for a page that opens on a dark band (the landing hero or a
 * `PageHero`); `nav="solid"` for one that opens on a light ground (sign-in,
 * booking results). `waitForImage` holds the load entrance until the page's key
 * image has decoded — the landing passes its hero screenshot.
 */
export function SiteShell({
  children,
  nav = "overlay",
  footer = true,
  waitForImage = null,
}: {
  children: ReactNode;
  nav?: NavTone;
  footer?: boolean;
  waitForImage?: string | null;
}) {
  const root = useRef<HTMLDivElement>(null);

  // Applied during render, not in an effect: the hidden state must be in the
  // first committed DOM or the page paints, hides, then animates back.
  const motionClass = useSiteMotion(root, { waitForImage });
  useSiteScroll();

  return (
    /* Two elements, and it has to be two. site.css declares bands as the
       DESCENDANT selector `[data-dm-site] [data-band]`; both attributes on one
       element matches nothing and every band colour resolves to transparent.

       `bg-white` on the inner element so a band boundary on a fractional pixel
       blends against white, not a dark root, and shows no hairline. */
    <div ref={root} data-dm-site="" className={motionClass || undefined}>
      <div data-band="paper" className="flex min-h-screen flex-col bg-white antialiased">
        <SkipLink />
        <SiteNav tone={nav} />
        <main id="main" className="flex-1">
          {children}
        </main>
        {footer ? <SiteFooter /> : null}
      </div>
    </div>
  );
}

/**
 * The frame for logged-in work screens (messages, chat, dashboards).
 *
 * Same scope and tokens as `SiteShell`, so every kit component works inside it,
 * but deliberately calmer: no Lenis (work screens have their own scroll
 * containers, and a hijacked wheel inside a chat thread or a table is a bug),
 * no footer, and a `mist` ground that separates white panels from the page.
 * Reveals still work for anything that opts in with `Reveal`.
 *
 * `nav={false}` for screens that bring their own chrome (the dashboards'
 * sidebar layouts); the default renders the solid site nav.
 */
export function AppShell({
  children,
  nav = true,
  className,
  mainClassName,
}: {
  children: ReactNode;
  nav?: boolean;
  className?: string;
  mainClassName?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const motionClass = useSiteMotion(root);

  return (
    <div ref={root} data-dm-site="" className={motionClass || undefined}>
      <div data-band="mist" className={cn("flex min-h-screen flex-col bg-band-ground text-band-fg antialiased", className)}>
        <SkipLink />
        {nav ? <SiteNav tone="solid" /> : null}
        <main id="main" className={cn("flex-1", nav && "pt-14 lg:pt-16", mainClassName)}>
          {children}
        </main>
      </div>
    </div>
  );
}

function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-pill focus:bg-band-fg focus:px-5 focus:py-3 focus:text-white"
    >
      Skip to content
    </a>
  );
}
