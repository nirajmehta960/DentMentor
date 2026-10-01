import { CtaPanel, PageHero, SiteCta, SiteShell, useSiteRoutes } from "@/components/site";
import { ABOUT_CLOSE, ABOUT_HERO, SIGNED_IN_LABEL } from "@/components/about/content";
import { Mission } from "@/components/about/Mission";
import { ProductOverview } from "@/components/about/ProductOverview";
import { Values } from "@/components/about/Values";
import { WhyDentMentor } from "@/components/about/WhyDentMentor";
import { HERO_GLASS } from "@/components/how-it-works/parts";

/**
 * /about: the mission, why the product exists, what it is on each side, the
 * principles behind it, and the close. No team, milestones, metrics, gallery
 * or contact details — see `about/content.ts` for why.
 */
const About = () => {
  const r = useSiteRoutes();

  return (
    <SiteShell nav="overlay">
      <PageHero
        eyebrow={ABOUT_HERO.eyebrow}
        title={ABOUT_HERO.title}
        lead={ABOUT_HERO.lead}
        actions={
          <>
            <SiteCta to={r.mentors} variant="ink" data-cta="about-hero-primary">
              {ABOUT_HERO.primary}
            </SiteCta>
            <SiteCta to={r.howItWorks} variant="secondary" className={HERO_GLASS} data-cta="about-hero-secondary">
              {ABOUT_HERO.secondary}
            </SiteCta>
          </>
        }
      />
      <Mission />
      <WhyDentMentor />
      <ProductOverview />
      <Values />
      <CtaPanel
        id="start"
        heading={ABOUT_CLOSE.heading}
        supporting={ABOUT_CLOSE.supporting}
        primary={{ to: r.account, label: r.isLoggedIn ? SIGNED_IN_LABEL : ABOUT_CLOSE.primary }}
        secondary={{ to: r.mentors, label: ABOUT_CLOSE.secondary }}
      />
    </SiteShell>
  );
};

export default About;
