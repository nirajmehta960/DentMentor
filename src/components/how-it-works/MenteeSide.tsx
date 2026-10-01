import { ArrowRight } from "lucide-react";

import { Band, BandHeader, Frame, Reveal, SiteCta, WIDE_RAIL, useSiteRoutes } from "@/components/site";
import { MENTEE_SIDE, SIGNED_IN_LABEL } from "./content";
import { StepRail } from "./parts";

/**
 * The mentee's journey: the landing's rail, given more room and more detail.
 * The heading holds on a sticky left rail while the steps scroll past it.
 */
export function MenteeSide() {
  const r = useSiteRoutes();

  return (
    <Band id="for-mentees" tone="paper">
      <Frame width="wide" className={WIDE_RAIL}>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] lg:gap-x-20">
          <div className="flex min-w-0 flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <BandHeader
                eyebrow={MENTEE_SIDE.eyebrow}
                heading={MENTEE_SIDE.heading}
                lead={MENTEE_SIDE.lead}
                headingClassName="text-display-3 font-medium"
              />
            </Reveal>
            <Reveal delay={0.06}>
              <SiteCta to={r.account} variant="ink" size="md" className="group/start">
                {r.isLoggedIn ? SIGNED_IN_LABEL : MENTEE_SIDE.cta}
                <ArrowRight
                  className="size-4 transition-transform duration-200 group-hover/start:translate-x-1"
                  strokeWidth={2.25}
                  aria-hidden="true"
                />
              </SiteCta>
            </Reveal>
          </div>

          <StepRail steps={MENTEE_SIDE.steps} className="min-w-0 max-w-[40rem]" />
        </div>
      </Frame>
    </Band>
  );
}
