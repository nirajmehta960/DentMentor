import { Band, BandHeader, Frame, Reveal, WIDE_RAIL } from "@/components/site";
import { BOOKING_FLOW } from "./content";

/**
 * The booking flow as a ledger keyed by moment — step, checkout, a day before,
 * afterwards — rather than another card grid. One Reveal for the whole list: it
 * reads as one object, not a queue.
 *
 * DOM order is header-then-list so the <h2> comes first for screen readers.
 */
export function BookingFlow() {
  return (
    <Band id="booking" tone="paper">
      <Frame width="wide" className={WIDE_RAIL}>
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] lg:gap-x-20">
          <Reveal className="min-w-0">
            <BandHeader
              eyebrow={BOOKING_FLOW.eyebrow}
              heading={BOOKING_FLOW.heading}
              lead={BOOKING_FLOW.lead}
              headingClassName="text-display-3 font-medium"
            />
          </Reveal>

          <Reveal className="min-w-0">
            <ol className="overflow-hidden rounded-[1.25rem] border border-band-rule-faint bg-band-raised shadow-[var(--card-shadow)]">
              {BOOKING_FLOW.stages.map((stage) => (
                <li key={stage.title} className="border-t border-band-rule-faint first:border-t-0">
                  <div className="flex flex-col gap-2 px-5 py-5 sm:flex-row sm:items-start sm:gap-6 sm:px-6">
                    <span className="stat shrink-0 text-band-signal sm:mt-1 sm:w-24">{stage.when}</span>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <h3 className="text-[1rem] font-semibold text-band-fg">{stage.title}</h3>
                      <p className="text-[0.875rem] leading-relaxed text-band-muted">{stage.body}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </Frame>
    </Band>
  );
}
