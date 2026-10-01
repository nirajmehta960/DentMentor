import { ArrowRight } from "lucide-react";

import { Band, BandHeader, Frame, HAIRLINE, Reveal, SiteCta, WIDE_RAIL, useSiteRoutes } from "@/components/site";
import { MENTOR_SIDE } from "./content";

/**
 * The mentor's side, as a numbered card grid rather than a second rail, so the
 * two journeys don't read as one long list. Six cards fill two rows of three.
 *
 * Signed-in mentees don't get the "become a mentor" action — the nav makes the
 * same call — but the explanation stays, since it's how their mentor works.
 */
export function MentorSide() {
  const r = useSiteRoutes();
  const showCta = r.userType !== "mentee";

  return (
    <Band id="for-mentors" tone="tint">
      <Frame width="wide" className={`flex flex-col gap-14 ${WIDE_RAIL}`}>
        <Reveal>
          <BandHeader
            eyebrow={MENTOR_SIDE.eyebrow}
            heading={MENTOR_SIDE.heading}
            lead={MENTOR_SIDE.lead}
            align="center"
            className="mx-auto"
          />
        </Reveal>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MENTOR_SIDE.steps.map((step, i) => (
            <Reveal as="li" key={step.title} delay={Math.min(i, 2) * 0.05} className="min-w-0">
              <div
                className="flex h-full flex-col gap-6 rounded-xl border bg-white p-6 shadow-[var(--card-shadow)]"
                style={{ borderColor: HAIRLINE }}
              >
                <span
                  aria-hidden="true"
                  className="grid size-10 place-items-center rounded-full border-2 border-[rgb(15_112_93/0.25)] text-band-signal"
                >
                  <span className="stat">{String(i + 1).padStart(2, "0")}</span>
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-[1.125rem] font-medium leading-[1.25] tracking-[-0.01em] text-band-fg sm:text-[1.25rem]">
                    <span className="sr-only">Step {i + 1}: </span>
                    {step.title}
                  </h3>
                  <p className="text-[0.9375rem] leading-[1.6] text-band-muted">{step.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>

        {showCta ? (
          <Reveal delay={0.1} className="flex justify-center">
            <SiteCta to={r.applyMentor} variant="ink" size="md" className="group/apply">
              {MENTOR_SIDE.cta}
              <ArrowRight
                className="size-4 transition-transform duration-200 group-hover/apply:translate-x-1"
                strokeWidth={2.25}
                aria-hidden="true"
              />
            </SiteCta>
          </Reveal>
        ) : null}
      </Frame>
    </Band>
  );
}
