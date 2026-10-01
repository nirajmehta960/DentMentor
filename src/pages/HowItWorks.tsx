import { CtaPanel, PageHero, SiteCta, SiteShell, useSiteRoutes } from "@/components/site";
import { BookingFlow } from "@/components/how-it-works/BookingFlow";
import { HOW_CLOSE, HOW_HERO, SIGNED_IN_LABEL } from "@/components/how-it-works/content";
import { HowItWorksFaq } from "@/components/how-it-works/HowItWorksFaq";
import { MenteeSide } from "@/components/how-it-works/MenteeSide";
import { MentorSide } from "@/components/how-it-works/MentorSide";
import { HERO_GLASS } from "@/components/how-it-works/parts";
import { SessionIncludes } from "@/components/how-it-works/SessionIncludes";

/**
 * /how-it-works: both sides of the market, then the mechanics of a booking and
 * of a session, the last questions, and the close. Bands alternate paper and
 * tint the way the landing does, ending on mist into the footer.
 */
const HowItWorks = () => {
  const r = useSiteRoutes();

  return (
    <SiteShell nav="overlay">
      <PageHero
        eyebrow={HOW_HERO.eyebrow}
        title={HOW_HERO.title}
        lead={HOW_HERO.lead}
        actions={
          <>
            <SiteCta to={HOW_HERO.menteeAnchor.to} variant="ink" data-cta="how-hero-mentees">
              {HOW_HERO.menteeAnchor.label}
            </SiteCta>
            <SiteCta to={HOW_HERO.mentorAnchor.to} variant="secondary" className={HERO_GLASS} data-cta="how-hero-mentors">
              {HOW_HERO.mentorAnchor.label}
            </SiteCta>
          </>
        }
      />
      <MenteeSide />
      <MentorSide />
      <BookingFlow />
      <SessionIncludes />
      <HowItWorksFaq />
      <CtaPanel
        id="start"
        heading={HOW_CLOSE.heading}
        supporting={HOW_CLOSE.supporting}
        primary={{ to: r.account, label: r.isLoggedIn ? SIGNED_IN_LABEL : HOW_CLOSE.primary }}
        secondary={{ to: r.mentors, label: HOW_CLOSE.secondary }}
      />
    </SiteShell>
  );
};

export default HowItWorks;
