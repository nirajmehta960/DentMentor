import { ArrowRight, GraduationCap, Search, type LucideIcon } from "lucide-react";

import { Band, BandHeader, Frame, HAIRLINE, Label, Reveal, SiteCta, WIDE_RAIL, useSiteRoutes } from "@/components/site";
import { CheckList, IconTile } from "@/components/how-it-works/parts";
import { PRODUCT } from "./content";

/* Indexed by position, matching `PRODUCT.sides`. */
const SIDE_ICONS: readonly LucideIcon[] = [Search, GraduationCap];

/** What the product is, as its two sides: one card each, then the way to the full explanation. */
export function ProductOverview() {
  const r = useSiteRoutes();

  return (
    <Band id="product" tone="paper">
      <Frame width="wide" className={`flex flex-col gap-14 ${WIDE_RAIL}`}>
        <Reveal>
          <BandHeader
            eyebrow={PRODUCT.eyebrow}
            heading={PRODUCT.heading}
            lead={PRODUCT.lead}
            align="center"
            className="mx-auto"
          />
        </Reveal>

        <ul className="mx-auto grid w-full max-w-5xl gap-4 md:grid-cols-2">
          {PRODUCT.sides.map((side, i) => {
            const Icon = SIDE_ICONS[i];
            return (
              <Reveal as="li" key={side.label} delay={i * 0.05} className="min-w-0">
                <div
                  className="flex h-full flex-col gap-7 rounded-xl border bg-white p-6 shadow-[var(--card-shadow)] sm:p-8"
                  style={{ borderColor: HAIRLINE }}
                >
                  <div className="flex items-center gap-4">
                    {Icon ? <IconTile icon={Icon} /> : null}
                    <div className="flex min-w-0 flex-col gap-1">
                      <Label>{side.label}</Label>
                      <h3 className="text-[1.25rem] font-medium leading-[1.25] tracking-[-0.01em] text-band-fg">{side.title}</h3>
                    </div>
                  </div>
                  <CheckList items={side.points} />
                </div>
              </Reveal>
            );
          })}
        </ul>

        <Reveal delay={0.1} className="flex justify-center">
          <SiteCta to={r.howItWorks} variant="ink" size="md" className="group/how">
            {PRODUCT.cta}
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover/how:translate-x-1"
              strokeWidth={2.25}
              aria-hidden="true"
            />
          </SiteCta>
        </Reveal>
      </Frame>
    </Band>
  );
}
