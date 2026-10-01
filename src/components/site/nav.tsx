import * as Dialog from "@radix-ui/react-dialog";
import { GraduationCap, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type MouseEventHandler, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

import { ProfileDropdown } from "@/components/ProfileDropdown";
import { cn } from "@/lib/utils";
import { SiteCta } from "./button";
import { Frame } from "./chrome";
import { SIGNED_IN_CTA } from "./content";
import { useSiteRoutes } from "./routes";
import { onScrollFrame } from "./smooth-scroll";

/**
 * The DentMentor mark: the white graduation cap on a brand-teal tile, as in
 * favicon.svg. The tile is a fixed colour rather than a band token, so it
 * doesn't change as the nav crossfades between bands.
 */
export function DentMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-8 place-items-center rounded-[0.625rem] bg-[rgb(15_112_93)] ring-1 ring-inset ring-white/10",
        className,
      )}
    >
      <GraduationCap className="size-[1.125rem] text-white" strokeWidth={2} />
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display text-[1.0625rem] font-bold leading-none tracking-[-0.02em] text-band-fg", className)}>
      DentMentor
    </span>
  );
}

/** A fragment stays a plain `<a>`; a route goes through the router. */
export function NavLink({
  to,
  className,
  onClick,
  children,
  "aria-label": ariaLabel,
  "aria-current": ariaCurrent,
}: {
  to: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  children: ReactNode;
  "aria-label"?: string;
  "aria-current"?: "page";
}) {
  if (to.startsWith("#")) {
    return (
      <a href={to} className={className} onClick={onClick} aria-label={ariaLabel} aria-current={ariaCurrent}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={className} onClick={onClick} aria-label={ariaLabel} aria-current={ariaCurrent}>
      {children}
    </Link>
  );
}

/** Hysteresis, so the bar doesn't strobe when a scroll lands on the line. */
const SWITCH_MARGIN = 56;

/** Document-space top via the offsetParent chain — rects include transforms. */
function documentTop(el: HTMLElement) {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

export type NavTone = "overlay" | "solid";

/**
 * The one navigation bar for every page.
 *
 * `overlay` pages open on a dark band (the landing hero, a `PageHero`): the bar
 * is transparent over it and turns frosted `paper` when the element marked
 * `[data-nav-flip]` reaches it. The attribute's value is a lead in px, so the
 * bar has finished changing by the time light content slides under it. The flip
 * point is measured once (and on resize), never inside the scroll path.
 * `solid` pages have no dark opening and get the paper bar from the first paint.
 */
export function SiteNav({ tone = "overlay" }: { tone?: NavTone }) {
  const [scrolled, setScrolled] = useState(tone === "solid");
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const r = useSiteRoutes();
  const { pathname } = useLocation();

  useEffect(() => {
    if (tone === "solid") return;
    let flipAt = Number.POSITIVE_INFINITY;

    const measure = () => {
      const marker = document.querySelector<HTMLElement>("[data-nav-flip]");
      if (!marker) {
        flipAt = 12;
        return;
      }
      const lead = Number(marker.dataset.navFlip) || 0;
      flipAt = documentTop(marker) - (headerRef.current?.offsetHeight ?? 64) - lead;
    };

    let state = false;
    const apply = (y: number) => {
      const next = y >= flipAt ? true : y < flipAt - SWITCH_MARGIN ? false : state;
      if (next === state) return;
      state = next;
      setScrolled(next);
    };
    const remeasure = () => {
      measure();
      apply(window.scrollY);
    };

    remeasure();
    const unsubscribe = onScrollFrame(apply);
    // Images and live data move the flip point after mount, without a scroll.
    const observer = new ResizeObserver(remeasure);
    observer.observe(document.documentElement);
    window.addEventListener("resize", remeasure);
    return () => {
      unsubscribe();
      observer.disconnect();
      window.removeEventListener("resize", remeasure);
    };
  }, [tone]);

  // Real pages, in the order a visitor reads the product. Mentees are already on
  // the other side of the market, so they aren't asked to become mentors.
  const links = [
    { href: r.mentors, label: "Find mentors" },
    { href: r.howItWorks, label: "How it works" },
    ...(r.userType === "mentee" ? [] : [{ href: r.applyMentor, label: "Become a mentor" }]),
    { href: r.about, label: "About" },
  ];

  const ctaTo = r.isLoggedIn ? r.dashboard : r.signIn;
  const ctaLabel = r.isLoggedIn ? SIGNED_IN_CTA : "Sign in";

  return (
    <header
      ref={headerRef}
      data-band={scrolled ? "paper" : "ink"}
      // `fixed`, not `sticky`: sticky would reserve a strip above the hero.
      className="fixed inset-x-0 top-0 z-50 text-band-fg"
    >
      {/* The glass is its own layer fading on opacity — cheaper and cleaner than
          transitioning backdrop-filter itself. */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 -z-10 border-b border-[rgb(9_67_56/0.06)]",
          "bg-white/[0.72] shadow-[0_1px_24px_rgb(9_67_56/0.06)] backdrop-blur-md",
          "transition-opacity duration-500 ease-dm",
          scrolled ? "opacity-100" : "opacity-0",
        )}
      />

      <Frame width="wide">
        {/* Equal 1fr rails put the links on the true centreline whatever the logo
            and action widths; below lg the centre column doesn't exist. */}
        <div className="grid h-14 grid-cols-[1fr_auto] items-center gap-4 lg:h-16 lg:grid-cols-[1fr_auto_1fr]">
          <NavLink to="/" className="flex items-center gap-2.5 justify-self-start rounded-[0.375rem]" aria-label="DentMentor home">
            <DentMark />
            <Wordmark />
          </NavLink>

          <nav aria-label="Primary" className="hidden justify-self-center lg:block">
            <ul className="flex items-center gap-1">
              {links.map((link) => {
                const current = pathname === link.href;
                return (
                  <li key={link.label}>
                    <NavLink
                      to={link.href}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "rounded-pill px-3 py-1.5 text-[0.8125rem] transition-colors hover:text-band-fg",
                        current ? "font-medium text-band-fg" : "text-band-muted",
                      )}
                    >
                      {link.label}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2 justify-self-end">
            <SiteCta to={ctaTo} size="sm" className="landing-cta-flat hidden sm:inline-flex">
              {ctaLabel}
            </SiteCta>
            {r.isLoggedIn ? <ProfileDropdown isScrolled={scrolled} /> : null}

            <Dialog.Root open={open} onOpenChange={setOpen}>
              <Dialog.Trigger asChild>
                <button
                  type="button"
                  aria-label="Open menu"
                  className="grid size-11 place-items-center rounded-pill text-band-fg lg:hidden"
                >
                  <Menu className="size-5" aria-hidden="true" strokeWidth={1.75} />
                </button>
              </Dialog.Trigger>

              {/* Portalled, because the scrolled header's backdrop-filter would
                  make it the containing block for a fixed overlay. The wrapper
                  carries the site scope back onto <body>, and must be a
                  different element from the ones carrying `data-band`. */}
              <Dialog.Portal>
                <div data-dm-site="">
                  <Dialog.Overlay data-band="paper" className="fixed inset-0 z-50 bg-band-fg/40 backdrop-blur lg:hidden" />
                  <Dialog.Content
                    data-band="paper"
                    aria-describedby={undefined}
                    className="fixed inset-x-0 top-0 z-50 border-b border-band-rule bg-band-raised p-5 text-band-fg shadow-[var(--sheet-shadow)] lg:hidden"
                  >
                    <Dialog.Title className="sr-only">Menu</Dialog.Title>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2.5">
                        <DentMark />
                        <Wordmark className="text-[1.15rem]" />
                      </span>
                      <Dialog.Close asChild>
                        <button type="button" aria-label="Close menu" className="grid size-11 place-items-center rounded-pill text-band-fg">
                          <X className="size-5" aria-hidden="true" strokeWidth={1.75} />
                        </button>
                      </Dialog.Close>
                    </div>

                    <nav aria-label="Primary" className="mt-6">
                      <ul className="flex flex-col">
                        {links.map((link) => (
                          <li key={link.label} className="border-b border-band-rule last:border-0">
                            <NavLink
                              to={link.href}
                              onClick={() => setOpen(false)}
                              aria-current={pathname === link.href ? "page" : undefined}
                              className="flex min-h-[3.25rem] items-center text-base text-band-fg"
                            >
                              {link.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </nav>

                    <SiteCta to={ctaTo} onClick={() => setOpen(false)} className="mt-6 w-full">
                      {ctaLabel}
                    </SiteCta>
                  </Dialog.Content>
                </div>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>
      </Frame>
    </header>
  );
}
