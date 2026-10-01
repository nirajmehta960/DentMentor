import { Band, BandHeader, Frame, Reveal, WIDE_RAIL } from "@/components/site";
import { HOW_FAQ } from "./content";
import { FaqList } from "./parts";

/** The landing FAQ's layout — heading on a left rail, questions on the wide half. */
export function HowItWorksFaq() {
  return (
    <Band id="faq" tone="mist">
      <Frame width="wide" className={WIDE_RAIL}>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] lg:gap-x-20">
          <Reveal>
            <BandHeader
              eyebrow={HOW_FAQ.eyebrow}
              heading={HOW_FAQ.heading}
              plainHeading
              lead={HOW_FAQ.lead}
              headingClassName="text-display-3 font-medium"
            />
          </Reveal>

          <FaqList items={HOW_FAQ.items} idPrefix="how-faq" />
        </div>
      </Frame>
    </Band>
  );
}
