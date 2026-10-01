import { BadgeCheck, CreditCard, Globe, GraduationCap, Heart, SlidersHorizontal, type LucideIcon } from "lucide-react";

import { Band, BandHeader, Frame, Reveal, WIDE_RAIL } from "@/components/site";
import { FeatureCard } from "@/components/how-it-works/parts";
import { VALUES } from "./content";

/* Indexed by position; the dev check makes a mismatch loud. */
const ICONS: readonly LucideIcon[] = [Heart, GraduationCap, BadgeCheck, CreditCard, SlidersHorizontal, Globe];

if (import.meta.env.DEV && ICONS.length !== VALUES.items.length) {
  console.warn(`[about/values] ${VALUES.items.length} values but ${ICONS.length} icons.`);
}

/** Six principles, three across — two full rows, no orphan. `mist` to run into the close. */
export function Values() {
  return (
    <Band id="values" tone="mist">
      <Frame width="wide" className={`flex flex-col gap-14 ${WIDE_RAIL}`}>
        <Reveal>
          <BandHeader eyebrow={VALUES.eyebrow} heading={VALUES.heading} lead={VALUES.lead} plainHeading />
        </Reveal>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.items.map((value, i) => (
            <Reveal as="li" key={value.title} delay={Math.min(i, 2) * 0.05} className="min-w-0">
              <FeatureCard icon={ICONS[i]} title={value.title} body={value.body} raised />
            </Reveal>
          ))}
        </ul>
      </Frame>
    </Band>
  );
}
