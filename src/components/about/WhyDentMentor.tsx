import { ArrowRight } from "lucide-react";

import { Band, BandHeader, Frame, Label, Reveal, WIDE_RAIL } from "@/components/site";
import { WHY } from "./content";

/**
 * Why the product exists: the problem in two paragraphs on the left, and on the
 * right a short ledger pairing each part of an application with the session
 * that covers it.
 */
export function WhyDentMentor() {
  return (
    <Band id="why" tone="tint">
      <Frame width="wide" className={WIDE_RAIL}>
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-24">
          <Reveal className="min-w-0">
            <BandHeader eyebrow={WHY.eyebrow} heading={WHY.heading}>
              <div className="flex max-w-[38rem] flex-col gap-4">
                {WHY.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-body-sm leading-relaxed text-band-muted">
                    {paragraph}
                  </p>
                ))}
              </div>
            </BandHeader>
          </Reveal>

          <Reveal delay={0.06} className="min-w-0">
            <div className="flex flex-col gap-5 rounded-[1.25rem] border border-band-rule-faint bg-band-raised p-6 shadow-[var(--card-shadow)] sm:p-7">
              <Label>{WHY.needsLabel}</Label>
              <ul className="flex flex-col">
                {WHY.needs.map((row) => (
                  <li
                    key={row.need}
                    className="flex flex-col gap-1 border-t border-band-rule-faint py-4 first:border-t-0 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                  >
                    <span className="text-[1rem] font-semibold text-band-fg">{row.need}</span>
                    <span className="flex items-center gap-2 text-[0.875rem] text-band-signal">
                      <ArrowRight className="size-3.5 shrink-0" strokeWidth={2.25} aria-hidden="true" />
                      {row.session}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Frame>
    </Band>
  );
}
