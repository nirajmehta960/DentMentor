import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { SiteCta } from "./button";
import { Band, Frame, HAIRLINE, HEADING_GRADIENT, Label } from "./chrome";
import { HOW_IT_WORKS, SIGNED_IN_CTA } from "./content";
import { Reveal } from "./reveal";
import { useSiteRoutes } from "./routes";

/**
 * The journey as a vertical rail, not a card grid — the page has already shown
 * one. Every step gets the same card; its position on the rail says it's last.
 */
export function HowItWorks() {
  const r = useSiteRoutes();
  const [setup, claim] = HOW_IT_WORKS.heading;

  return (
    <Band id="how-it-works" tone="tint" className="overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[58%] h-[min(520px,75%)] w-[min(720px,100%)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(21_157_130/0.07)_0%,transparent_68%)]" />
      </div>

      <Frame width="default">
        <Reveal className="flex flex-col items-center gap-5 text-center">
          <Label>{HOW_IT_WORKS.eyebrow}</Label>
          <h2 className="max-w-[44rem] text-balance font-display text-display-2 font-medium tracking-[-0.03em]">
            <span className="block text-band-fg">{setup}</span>
            <span className={cn("block", HEADING_GRADIENT)}>{claim}</span>
          </h2>
          <p className="max-w-[36rem] text-body-sm leading-relaxed text-band-muted">{HOW_IT_WORKS.lead}</p>
        </Reveal>

        <div className="mx-auto mt-12 max-w-[36rem] lg:mt-14">
          <ol className="relative flex flex-col gap-3 pl-12">
            <span aria-hidden="true" className="absolute bottom-10 left-[1.1875rem] top-4 w-px bg-[rgb(15_112_93/0.18)]" />

            {HOW_IT_WORKS.steps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={Math.min(i, 3) * 0.04} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-12 top-3 grid size-10 place-items-center rounded-full border-2 border-[rgb(15_112_93/0.25)] bg-white text-band-signal"
                >
                  <span className="stat">{String(i + 1).padStart(2, "0")}</span>
                </span>

                <div
                  className="flex flex-col gap-1.5 rounded-[1.25rem] border bg-white p-5 shadow-[var(--card-shadow)]"
                  style={{ borderColor: HAIRLINE }}
                >
                  <p className="stat text-band-signal">{step.label}</p>
                  <h3 className="font-display text-[1.0625rem] font-semibold tracking-[-0.01em] text-band-fg">
                    {step.title}
                  </h3>
                  <p className="text-[0.875rem] leading-relaxed text-band-muted">{step.meta}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal delay={0.2} className="mt-10 flex justify-center">
          <SiteCta to={r.account} variant="ink" size="lg" className="group/start">
            {r.isLoggedIn ? SIGNED_IN_CTA : HOW_IT_WORKS.cta}
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover/start:translate-x-1"
              strokeWidth={2.25}
              aria-hidden="true"
            />
          </SiteCta>
        </Reveal>
      </Frame>
    </Band>
  );
}
