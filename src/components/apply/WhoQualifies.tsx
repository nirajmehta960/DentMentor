import { BadgeCheck, GraduationCap, School, type LucideIcon } from "lucide-react";

import { Band, BandHeader, Frame, HAIRLINE, Label, Reveal, WIDE_RAIL } from "@/components/site";
import { CheckList, FeatureCard, IconTile } from "@/components/how-it-works/parts";
import { WHO_QUALIFIES } from "./content";

/* Indexed by position, matching `WHO_QUALIFIES.groups`. */
const GROUP_ICONS: readonly LucideIcon[] = [School, GraduationCap];

/**
 * Eligibility, stated plainly: two groups who qualify, and the optional
 * verification beside them — marked optional, so it never reads as a gate.
 */
export function WhoQualifies() {
  const { verification } = WHO_QUALIFIES;

  return (
    <Band id="who-qualifies" tone="tint">
      <Frame width="wide" className={`flex flex-col gap-14 ${WIDE_RAIL}`}>
        <Reveal>
          <BandHeader eyebrow={WHO_QUALIFIES.eyebrow} heading={WHO_QUALIFIES.heading} lead={WHO_QUALIFIES.lead} />
        </Reveal>

        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {WHO_QUALIFIES.groups.map((group, i) => (
            <Reveal as="li" key={group.title} delay={i * 0.05} className="min-w-0">
              <FeatureCard icon={GROUP_ICONS[i]} title={group.title} body={group.body} raised />
            </Reveal>
          ))}

          <Reveal as="li" delay={0.1} className="min-w-0 md:col-span-2 lg:col-span-1">
            <div
              className="flex h-full flex-col gap-6 rounded-xl border border-dashed bg-white/60 p-6"
              style={{ borderColor: "rgb(15 112 93 / 0.3)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <IconTile icon={BadgeCheck} />
                <span className="label rounded-pill border px-2.5 py-1 text-band-signal" style={{ borderColor: HAIRLINE }}>
                  {verification.label}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-[1.125rem] font-medium leading-[1.25] tracking-[-0.01em] text-band-fg sm:text-[1.25rem]">
                  {verification.title}
                </h3>
                <p className="text-[0.9375rem] leading-[1.6] text-band-muted">{verification.body}</p>
              </div>
              <div className="flex flex-col gap-3 border-t pt-5" style={{ borderColor: HAIRLINE }}>
                <Label className="text-band-faint">{verification.documentsLabel}</Label>
                <CheckList items={verification.documents} className="gap-2 [&_li]:text-[0.875rem]" />
              </div>
            </div>
          </Reveal>
        </ul>
      </Frame>
    </Band>
  );
}
