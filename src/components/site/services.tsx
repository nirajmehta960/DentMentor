import { ArrowRight } from "lucide-react";

import { SiteCta } from "./button";
import { Band, BandHeader, Frame, WIDE_RAIL } from "./chrome";
import { SERVICES } from "./content";
import { Reveal } from "./reveal";
import { useSiteRoutes } from "./routes";

/**
 * What you can book, and the other side of the market. A divided list rather than
 * another card grid, so it doesn't read as a continuation of the band above.
 *
 * DOM order is header-then-list so the <h2> comes first for screen readers;
 * `lg:order-*` puts the list on the left visually. `min-w-0` on both grid items
 * lets long titles truncate instead of pushing the page past the viewport.
 */
export function Services() {
  const r = useSiteRoutes();

  return (
    <Band id="services" tone="tint">
      <Frame width="wide" className={WIDE_RAIL}>
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-24">
          <div className="flex min-w-0 flex-col gap-8 lg:order-2">
            <Reveal>
              <BandHeader eyebrow={SERVICES.eyebrow} heading={SERVICES.heading} plainHeading lead={SERVICES.lead} />
            </Reveal>

            <Reveal delay={0.06}>
              <div className="flex flex-col items-start gap-4 rounded-[1.25rem] border border-band-rule-faint bg-band-raised p-6 sm:p-7">
                <h3 className="font-display text-[1.25rem] font-semibold tracking-[-0.01em] text-band-fg">
                  {SERVICES.mentorPanel.title}
                </h3>
                <p className="text-[0.9375rem] leading-relaxed text-band-muted">{SERVICES.mentorPanel.body}</p>
                <SiteCta to={r.applyMentor} variant="ink" size="md" className="group/apply mt-1">
                  {SERVICES.mentorPanel.cta}
                  <ArrowRight
                    className="size-4 transition-transform duration-200 group-hover/apply:translate-x-1"
                    strokeWidth={2.25}
                    aria-hidden="true"
                  />
                </SiteCta>
              </div>
            </Reveal>
          </div>

          {/* One Reveal for the whole list: rows staggering in one by one draw the
              eye down a queue, where the list is a single object. */}
          <Reveal className="min-w-0 lg:order-1">
            <ul className="overflow-hidden rounded-[1.25rem] border border-band-rule-faint bg-band-raised">
              {SERVICES.items.map((item, i) => (
                <li key={item.title} className="border-t border-band-rule-faint first:border-t-0">
                  <div className="flex items-start gap-4 px-5 py-5 sm:px-6">
                    <span className="stat mt-1 w-6 shrink-0 text-band-faint">{String(i + 1).padStart(2, "0")}</span>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="truncate text-[1rem] font-semibold text-band-fg">{item.title}</h3>
                        <span className="stat shrink-0 text-band-signal">{item.duration}</span>
                      </div>
                      <p className="text-[0.875rem] leading-relaxed text-band-muted">{item.body}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Frame>
    </Band>
  );
}
