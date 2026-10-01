import { ArrowRight } from "lucide-react";

import { CtaPanel, PageHero, SiteCta, SiteShell, useSiteRoutes } from "@/components/site";
import { APPLY_CLOSE, APPLY_HERO, SIGNED_IN_LABEL } from "@/components/apply/content";
import { EarningsCalculator } from "@/components/apply/EarningsCalculator";
import { MentorJourney } from "@/components/apply/MentorJourney";
import { WhoQualifies } from "@/components/apply/WhoQualifies";
import { WhyMentor } from "@/components/apply/WhyMentor";
import { HERO_GLASS } from "@/components/how-it-works/parts";

/**
 * /apply-mentor: why mentor, who can, how it works from the mentor's side, an
 * example of what prices add up to, and the close.
 *
 * The sign-up action goes to `/auth?tab=signup`, where the visitor picks
 * "Become a Mentor". Signed-in visitors get their dashboard instead (and
 * `PublicOnlyRoute` would bounce them off `/auth` anyway).
 */
const ApplyMentor = () => {
  const r = useSiteRoutes();
  const joinTo = r.isLoggedIn ? r.dashboard : r.signUp;
  const joinLabel = r.isLoggedIn ? SIGNED_IN_LABEL : APPLY_HERO.primary;

  return (
    <SiteShell nav="overlay">
      <PageHero
        eyebrow={APPLY_HERO.eyebrow}
        title={APPLY_HERO.title}
        lead={APPLY_HERO.lead}
        actions={
          <>
            <SiteCta to={joinTo} variant={r.isLoggedIn ? "ink" : "primary"} data-cta="apply-hero-primary" className="group/join">
              {joinLabel}
              <ArrowRight
                className="size-4 transition-transform duration-200 group-hover/join:translate-x-1"
                strokeWidth={2.25}
                aria-hidden="true"
              />
            </SiteCta>
            <SiteCta to={APPLY_HERO.secondary.to} variant="secondary" className={HERO_GLASS} data-cta="apply-hero-secondary">
              {APPLY_HERO.secondary.label}
            </SiteCta>
          </>
        }
      />
      <WhyMentor />
      <WhoQualifies />
      <MentorJourney />
      <EarningsCalculator />
      <CtaPanel
        id="start"
        heading={APPLY_CLOSE.heading}
        supporting={APPLY_CLOSE.supporting}
        primary={{ to: joinTo, label: r.isLoggedIn ? SIGNED_IN_LABEL : APPLY_CLOSE.primary }}
        secondary={{ to: r.howItWorks, label: APPLY_CLOSE.secondary }}
      />
    </SiteShell>
  );
};

export default ApplyMentor;
