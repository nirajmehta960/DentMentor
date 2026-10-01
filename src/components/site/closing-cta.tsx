import { FINAL, MENTORS, SIGNED_IN_CTA } from "./content";
import { CtaPanel } from "./cta-panel";
import { useSiteRoutes } from "./routes";
import { useLandingStats } from "./use-landing-data";

/** The landing's close: the shared `CtaPanel`, with the live mentor count as its badge. */
export function ClosingCta() {
  const r = useSiteRoutes();
  const stats = useLandingStats();

  return (
    <CtaPanel
      id="start"
      badge={
        stats.verifiedMentors !== null ? (
          <span data-numeric="">
            {stats.verifiedMentors} {MENTORS.countLabel}
          </span>
        ) : (
          FINAL.fallbackBadge
        )
      }
      heading={FINAL.heading}
      supporting={FINAL.supporting}
      primary={{ to: r.account, label: r.isLoggedIn ? SIGNED_IN_CTA : FINAL.primaryCta }}
      secondary={{ to: r.mentors, label: FINAL.secondaryCta }}
    />
  );
}
