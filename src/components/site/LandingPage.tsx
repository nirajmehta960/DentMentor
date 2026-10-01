import { ClosingCta } from "./closing-cta";
import { HERO } from "./content";
import { Faq } from "./faq";
import { Features } from "./features";
import { LandingHero } from "./hero";
import { HowItWorks } from "./how-it-works";
import { Mentors } from "./mentors";
import { Services } from "./services";
import { SiteShell } from "./shell";

/**
 * The landing page: one `data-band` per section, in argument order — what it is,
 * who's here, what you can book, how it works, the last objections, the close.
 *
 * Mentors, services and how-it-works share one `tint` ground and are told apart
 * by their own shapes (card grid, ledger, rail), not by rules between them.
 * There is deliberately no "trusted by" logo strip: naming schools as
 * endorsements none of them gave is a claim the page can't support.
 */
export default function LandingPage() {
  return (
    <SiteShell waitForImage={HERO.shot.src}>
      <LandingHero />
      <Features />
      <Mentors />
      <Services />
      <HowItWorks />
      <Faq />
      <ClosingCta />
    </SiteShell>
  );
}
