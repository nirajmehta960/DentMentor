/**
 * The DentMentor site kit — import every page's building blocks from here.
 *
 *   Shells      SiteShell (public pages: nav, footer, Lenis, motion)
 *               AppShell  (logged-in work screens: calmer, no Lenis, no footer)
 *   Openings    PageHero (interior page ink band), AppPageHeader (work screen title row)
 *   Structure   Band (a toned section), Frame / WIDE_RAIL (content column),
 *               BandHeader, Label, Panel, CardGlow, HAIRLINE, HEADING_GRADIENT
 *   Actions     SiteCta / control() (the one button shape), CtaPanel (closing panel)
 *   Motion      Reveal (scroll-in), Enter (load sequence)
 *   Identity    DentMark, Wordmark, NavLink
 *   Routing     useSiteRoutes
 *
 * Every kit component must render inside a SiteShell or AppShell: colours
 * resolve from the `[data-dm-site] [data-band]` custom properties in site.css.
 */
export { SiteShell, AppShell } from "./shell";
export { PageHero, AppPageHeader } from "./page-hero";
export { Band, BandHeader, CardGlow, Frame, HAIRLINE, HEADING_GRADIENT, Label, Panel, WIDE_RAIL, type BandTone } from "./chrome";
export { SiteCta, control } from "./button";
export { CtaPanel } from "./cta-panel";
export { Enter, Reveal } from "./reveal";
export { DentMark, NavLink, Wordmark } from "./nav";
export { useSiteRoutes, type SiteRoutes } from "./routes";
