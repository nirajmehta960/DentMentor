import { Plus } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Band, BandHeader, Frame, HAIRLINE, WIDE_RAIL } from "./chrome";
import { FAQ, type FaqItem } from "./content";
import { Reveal } from "./reveal";

function FaqRow({
  item,
  open,
  onToggle,
  delay,
}: {
  item: FaqItem;
  open: boolean;
  onToggle: () => void;
  delay: number;
}) {
  const questionId = `faq-${item.slug}-q`;
  const answerId = `faq-${item.slug}-a`;

  return (
    <li className="border-t" style={{ borderColor: HAIRLINE }}>
      <Reveal delay={delay}>
        {/* The heading is the outline entry; the button inside it is what you press. */}
        <h3>
          <button
            type="button"
            id={questionId}
            aria-expanded={open}
            aria-controls={answerId}
            onClick={onToggle}
            className="group flex w-full items-start justify-between gap-6 rounded-[0.25rem] py-6 text-left sm:gap-10"
          >
            <span className="text-[1.0625rem] font-medium leading-[1.45] tracking-[-0.011em] text-band-fg sm:text-[1.1875rem]">
              {item.question}
            </span>
            {/* One glyph turning 45° reads as one control changing state. `mt-1`
                centres it on the first line when a question wraps. */}
            <Plus
              aria-hidden="true"
              strokeWidth={1.5}
              className={cn(
                "mt-1 size-5 shrink-0 transition-[transform,color] duration-300 ease-dm",
                open ? "rotate-45 text-band-signal" : "text-band-faint group-hover:text-band-fg",
              )}
            />
          </button>
        </h3>

        {/* Height and visibility are handled by `.dm-faq-panel` in site.css. */}
        <div
          id={answerId}
          role="region"
          aria-labelledby={questionId}
          data-open={open ? "" : undefined}
          className="dm-faq-panel"
        >
          <div className="overflow-hidden">
            <p className="max-w-[44rem] pb-7 pr-6 text-[0.9375rem] leading-[1.7] text-band-muted sm:pr-14">
              {item.answer}
            </p>
          </div>
        </div>
      </Reveal>
    </li>
  );
}

/**
 * The last objections, after the argument rather than inside it. Heading on a
 * left rail, questions on the wide half. One open at a time, keyed by slug, with
 * the first open on arrival so the band shows what's inside it.
 */
export function Faq() {
  const [openSlug, setOpenSlug] = useState<string | null>(FAQ.items[0]?.slug ?? null);

  return (
    <Band id="faq" tone="mist">
      <Frame width="wide" className={WIDE_RAIL}>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] lg:gap-x-20">
          <Reveal>
            <BandHeader
              eyebrow={FAQ.eyebrow}
              heading={FAQ.heading}
              plainHeading
              lead={FAQ.lead}
              headingClassName="text-display-3 font-medium"
            />
          </Reveal>

          <ul className="border-b" style={{ borderColor: HAIRLINE }}>
            {FAQ.items.map((item, i) => (
              <FaqRow
                key={item.slug}
                item={item}
                open={openSlug === item.slug}
                onToggle={() => setOpenSlug(openSlug === item.slug ? null : item.slug)}
                delay={Math.min(i, 2) * 0.05}
              />
            ))}
          </ul>
        </div>
      </Frame>
    </Band>
  );
}
