import { ArrowRight } from "lucide-react";

import { Band, BandHeader, Frame, Reveal, SiteCta, WIDE_RAIL, useSiteRoutes } from "@/components/site";
import { StepRail } from "@/components/how-it-works/parts";
import { MENTOR_JOURNEY, MENTOR_SIGN_UP, SIGNED_IN_LABEL } from "./content";

/**
 * How it works from the mentor's side, on the landing's rail. The id is the
 * hero's secondary anchor (`APPLY_HERO.secondary.to`).
 *
 * Signing up is a commitment, so it takes the orange action; once signed in it
 * becomes a plain route to the dashboard and drops to `ink`.
 */
export function MentorJourney() {
  const r = useSiteRoutes();

  return (
    <Band id="how-it-works" tone="paper">
      <Frame width="wide" className={WIDE_RAIL}>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] lg:gap-x-20">
          <div className="flex min-w-0 flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <BandHeader
                eyebrow={MENTOR_JOURNEY.eyebrow}
                heading={MENTOR_JOURNEY.heading}
                lead={MENTOR_JOURNEY.lead}
                headingClassName="text-display-3 font-medium"
              />
            </Reveal>
            <Reveal delay={0.06}>
              <SiteCta
                to={r.isLoggedIn ? r.dashboard : MENTOR_SIGN_UP}
                variant={r.isLoggedIn ? "ink" : "primary"}
                size="md"
                className="group/join"
                data-cta="apply-journey-primary"
              >
                {r.isLoggedIn ? SIGNED_IN_LABEL : MENTOR_JOURNEY.cta}
                <ArrowRight
                  className="size-4 transition-transform duration-200 group-hover/join:translate-x-1"
                  strokeWidth={2.25}
                  aria-hidden="true"
                />
              </SiteCta>
            </Reveal>
          </div>

          <StepRail steps={MENTOR_JOURNEY.steps} className="min-w-0 max-w-[40rem]" />
        </div>
      </Frame>
    </Band>
  );
}
