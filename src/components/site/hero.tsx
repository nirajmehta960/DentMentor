import { cn } from "@/lib/utils";
import { SiteCta } from "./button";
import { Band, Frame } from "./chrome";
import { HERO } from "./content";
import { HeroShot } from "./hero-shot";
import { Enter } from "./reveal";
import { useSiteRoutes } from "./routes";

/**
 * Section 1: one label, one headline, one sentence, two actions — then the
 * product. Dark because the composition is light resolving out of a dark ground,
 * which only exists as contrast; the page steps into daylight below it.
 */
export function LandingHero() {
  const routes = useSiteRoutes();

  return (
    <Band
      id="top"
      tone="ink"
      /* `bg-white` overrides the ink ground on purpose: the dark comes from
         `.dm-hero-ground`, which fades itself to white at its foot, so whatever it
         stops covering must be white too. `overflow-clip`, not `hidden`, because the
         overhanging cards need clipping without making this a scroll container. */
      className="z-10 flex min-h-svh flex-col overflow-clip bg-white pb-0 pt-28 sm:pt-32 lg:pt-36"
    >
      <div aria-hidden="true" className="dm-hero-ground pointer-events-none absolute inset-0 -z-10" />
      <div aria-hidden="true" className="dm-grain dm-grain-faint pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,#000_45%,transparent_80%)]" />

      {/* `flex-1`: the copy centres itself in whatever space the nav and the
          screenshot leave, which holds on both a laptop and a tall desktop. */}
      <Frame width="wide" className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <Enter>
          <p className="label inline-flex items-center gap-2 rounded-pill border border-band-rule-strong px-3 py-1.5 text-band-fg">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-band-signal" />
            {HERO.eyebrow}
          </p>
        </Enter>

        <Enter delay={0.07}>
          <h1 className="text-balance font-display text-display-1 font-medium tracking-[-0.035em] text-band-fg">
            {HERO.heading.map((line, i) => (
              <span
                key={line}
                className={cn(
                  "block",
                  // White running into the brand sky. The span has no colour of its own
                  // under bg-clip-text, so only one line carries the gradient.
                  i === 1 &&
                    "bg-[linear-gradient(90deg,#ffffff_12%,rgb(105_211_190)_62%,rgb(62_186_244)_98%)] bg-clip-text pb-[0.14em] text-transparent",
                )}
              >
                {line}
              </span>
            ))}
          </h1>
        </Enter>

        <Enter delay={0.14}>
          <p className="max-w-[36rem] text-pretty text-body-sm leading-relaxed text-band-muted">
            {HERO.supporting}
          </p>
        </Enter>

        <Enter delay={0.21} className="mt-1 flex flex-wrap items-center justify-center gap-3">
          <SiteCta to={routes.mentors} size="md" data-cta="hero-primary">
            {HERO.primaryCta}
            <span aria-hidden="true">→</span>
          </SiteCta>
          <SiteCta
            to={HERO.secondaryCta.href}
            size="md"
            variant="secondary"
            data-cta="hero-secondary"
            className="border-white/20 bg-white/5 text-white backdrop-blur-md hover:border-white/40 hover:bg-white/10"
          >
            {HERO.secondaryCta.label}
          </SiteCta>
        </Enter>
      </Frame>

      {/* A fade and a rise, nothing else — no rotation, no perspective. It arrives
          with the copy rather than already sitting there. */}
      <Enter delay={0.3} rise={40}>
        <HeroShot className="mt-12 sm:mt-14 lg:mt-16" />
      </Enter>
    </Band>
  );
}
