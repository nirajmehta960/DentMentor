import { CalendarClock, CreditCard, HeartHandshake, ListChecks, MessagesSquare, Tag, type LucideIcon } from "lucide-react";

import { Band, BandHeader, CardGlow, Frame, Reveal, WIDE_RAIL } from "@/components/site";
import { FeatureCard } from "@/components/how-it-works/parts";
import { WHY_MENTOR } from "./content";

/* Indexed by position; the dev check makes a mismatch loud. */
const ICONS: readonly LucideIcon[] = [HeartHandshake, ListChecks, Tag, CalendarClock, CreditCard, MessagesSquare];

if (import.meta.env.DEV && ICONS.length !== WHY_MENTOR.cards.length) {
  console.warn(`[apply/why-mentor] ${WHY_MENTOR.cards.length} cards but ${ICONS.length} icons.`);
}

/** Why mentor here: six product facts, three across, in the landing's feature cards. */
export function WhyMentor() {
  return (
    <Band id="why-mentor" tone="paper">
      <CardGlow />
      <Frame width="wide" className={`flex flex-col gap-14 sm:gap-[72px] ${WIDE_RAIL}`}>
        <Reveal>
          <BandHeader
            eyebrow={WHY_MENTOR.eyebrow}
            heading={WHY_MENTOR.heading}
            lead={WHY_MENTOR.lead}
            plainHeading
            align="center"
            className="mx-auto"
          />
        </Reveal>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_MENTOR.cards.map((card, i) => (
            <Reveal as="li" key={card.title} delay={Math.min(i, 2) * 0.05} className="min-w-0">
              <FeatureCard icon={ICONS[i]} title={card.title} body={card.body} />
            </Reveal>
          ))}
        </ul>
      </Frame>
    </Band>
  );
}
