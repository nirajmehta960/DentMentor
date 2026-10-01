import { CalendarClock, CreditCard, Link2, MessagesSquare, RefreshCcw, Video, type LucideIcon } from "lucide-react";

import { Band, BandHeader, Frame, HAIRLINE, Label, Reveal, WIDE_RAIL } from "@/components/site";
import { SESSION_INCLUDES } from "./content";
import { IconTile } from "./parts";

/* Icons are component references, so they live here rather than in the copy
   file. Indexed by position; the dev check makes a mismatch loud. */
const EVERY_ICONS: readonly LucideIcon[] = [Video, Link2, MessagesSquare, CalendarClock, CreditCard, RefreshCcw];

if (import.meta.env.DEV && EVERY_ICONS.length !== SESSION_INCLUDES.every.length) {
  console.warn(`[session-includes] ${SESSION_INCLUDES.every.length} items but ${EVERY_ICONS.length} icons.`);
}

/**
 * What you can book (four service cards, durations as tabular figures) beside
 * what every booking carries (one panel of icon rows).
 */
export function SessionIncludes() {
  return (
    <Band id="sessions" tone="tint">
      <Frame width="wide" className={`flex flex-col gap-14 ${WIDE_RAIL}`}>
        <Reveal>
          <BandHeader eyebrow={SESSION_INCLUDES.eyebrow} heading={SESSION_INCLUDES.heading} lead={SESSION_INCLUDES.lead} />
        </Reveal>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-8">
          <ul className="grid min-w-0 gap-4 sm:grid-cols-2">
            {SESSION_INCLUDES.services.map((service, i) => (
              <Reveal as="li" key={service.title} delay={Math.min(i, 2) * 0.05} className="min-w-0">
                <div
                  className="flex h-full flex-col gap-3 rounded-xl border bg-white p-6 shadow-[var(--card-shadow)]"
                  style={{ borderColor: HAIRLINE }}
                >
                  <span className="stat self-start rounded-pill bg-[rgb(15_112_93/0.07)] px-2.5 py-1 text-band-signal">
                    {service.duration}
                  </span>
                  <h3 className="text-[1.125rem] font-medium leading-[1.25] tracking-[-0.01em] text-band-fg">{service.title}</h3>
                  <p className="text-[0.9375rem] leading-[1.6] text-band-muted">{service.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.08} className="min-w-0">
            <div
              className="flex flex-col gap-6 rounded-[1.25rem] border bg-white p-6 shadow-[var(--card-shadow)] sm:p-7"
              style={{ borderColor: HAIRLINE }}
            >
              <Label as="p">{SESSION_INCLUDES.everyLabel}</Label>
              <ul className="flex flex-col gap-5">
                {SESSION_INCLUDES.every.map((item, i) => {
                  const Icon = EVERY_ICONS[i];
                  return (
                    <li key={item.title} className="flex items-start gap-4">
                      {Icon ? <IconTile icon={Icon} size="sm" /> : null}
                      <div className="flex min-w-0 flex-col gap-0.5 pt-0.5">
                        <h3 className="text-[0.9375rem] font-semibold text-band-fg">{item.title}</h3>
                        <p className="text-[0.875rem] leading-relaxed text-band-muted">{item.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>
        </div>
      </Frame>
    </Band>
  );
}
