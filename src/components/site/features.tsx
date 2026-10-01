import { BadgeCheck, CalendarClock, ClipboardList, CreditCard, MessagesSquare, RefreshCcw, type LucideIcon } from "lucide-react";

import { Band, BandHeader, CardGlow, Frame, HAIRLINE, WIDE_RAIL } from "./chrome";
import { FEATURES } from "./content";
import { Reveal } from "./reveal";

/* Icons are component references, so they live here rather than in the copy
   file. Indexed by position; the dev check below makes a mismatch loud. */
const ICONS: readonly LucideIcon[] = [BadgeCheck, ClipboardList, CalendarClock, CreditCard, MessagesSquare, RefreshCcw];

if (import.meta.env.DEV && ICONS.length !== FEATURES.cards.length) {
  console.warn(`[features] ${FEATURES.cards.length} cards but ${ICONS.length} icons.`);
}

/**
 * What it does: six cards, three across — six fills two rows with no orphan.
 * `paper` because this band receives the hero's fade to white; anything warmer
 * would reintroduce the seam the fade exists to remove.
 */
export function Features() {
  return (
    <Band id="product" tone="paper" className="pb-40 sm:pb-48 lg:pb-56">
      <CardGlow />

      {/* Hands off into the tint ground below: transparent at the cards' foot,
          exactly the next band's ground at the boundary, so the seam is tint on
          tint. Height tracks this band's bottom padding — change both together. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_bottom,rgb(243_247_246/0)_0%,rgb(243_247_246/0.1)_22%,rgb(243_247_246/0.34)_46%,rgb(243_247_246/0.66)_70%,rgb(243_247_246/0.9)_87%,rgb(243_247_246)_100%)] sm:h-48 lg:h-56"
      />

      <Frame width="wide" className={`flex flex-col gap-[72px] ${WIDE_RAIL}`}>
        <Reveal>
          <BandHeader
            eyebrow={FEATURES.eyebrow}
            heading={FEATURES.heading}
            plainHeading
            lead={FEATURES.lead}
            align="center"
            className="mx-auto"
          />
        </Reveal>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.cards.map((card, i) => {
            const Icon = ICONS[i];
            return (
              // Stagger capped at the third card so the grid arrives as one object.
              <Reveal as="li" key={card.title} delay={Math.min(i, 2) * 0.05}>
                <div
                  className="flex h-full flex-col gap-9 rounded-xl border bg-white/70 p-6"
                  style={{ borderColor: HAIRLINE }}
                >
                  {Icon ? (
                    <span
                      className="grid size-[52px] shrink-0 place-items-center rounded-tile border-[1.5px] bg-white"
                      style={{ borderColor: HAIRLINE }}
                    >
                      <Icon className="size-6 text-band-signal" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                  ) : null}
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-[20px] font-medium leading-[1.2] text-band-fg">{card.title}</h3>
                    <p className="text-[15px] leading-[1.6] text-band-muted">{card.body}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </Frame>
    </Band>
  );
}
