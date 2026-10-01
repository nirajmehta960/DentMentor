import { Band, CardGlow, Frame, HAIRLINE, Reveal } from "@/components/site";
import { MISSION } from "./content";

/**
 * The mission as the band's statement, set large, with the vision beneath it
 * on a hairline. The labels are the headings, so the outline reads
 * "Our mission / Our vision" rather than a 30-word h2.
 */
export function Mission() {
  return (
    <Band id="mission" tone="paper">
      <CardGlow className="top-[40%]" />
      <Frame width="default">
        <Reveal className="flex max-w-[58rem] flex-col gap-6">
          <h2 className="label text-band-signal">{MISSION.missionLabel}</h2>
          <p className="text-balance font-display text-[clamp(1.5rem,1.05rem+1.9vw,2.5rem)] font-medium leading-[1.2] tracking-[-0.03em] text-band-fg">
            {MISSION.mission}
          </p>
        </Reveal>

        <Reveal delay={0.06} className="mt-14 sm:mt-16">
          <div className="grid gap-4 border-t pt-8 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-10" style={{ borderColor: HAIRLINE }}>
            <h3 className="label pt-1 text-band-signal">{MISSION.visionLabel}</h3>
            <p className="max-w-[42rem] text-pretty text-[1.0625rem] leading-relaxed text-band-muted sm:text-[1.125rem]">
              {MISSION.vision}
            </p>
          </div>
        </Reveal>
      </Frame>
    </Band>
  );
}
