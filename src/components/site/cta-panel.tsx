import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { SiteCta } from "./button";
import { Band, Frame, WIDE_RAIL, type BandTone } from "./chrome";
import { Reveal } from "./reveal";

type Action = { to: string; label: string };

/**
 * An inset closing panel on the animated brand-teal field. Construction and
 * contrast reasoning are under FLUID GRADIENT in site.css.
 *
 * Every colour here is fixed white — the panel is a surface inside a light band,
 * so `band-fg` would resolve to the band's dark ink and vanish. The primary
 * action is a white fill: an orange or teal button on this panel would disappear.
 */
export function CtaPanel({
  id,
  tone = "mist",
  badge,
  heading,
  supporting,
  primary,
  secondary,
  className,
}: {
  id: string;
  tone?: BandTone;
  badge?: ReactNode;
  heading: readonly string[];
  supporting?: string;
  primary: Action;
  secondary?: Action;
  className?: string;
}) {
  return (
    <Band id={id} tone={tone} className={cn("pt-0 sm:pt-0 lg:pt-0", className)}>
      <Frame width="wide" className={WIDE_RAIL}>
        <Reveal>
          <div
            className={cn(
              "relative isolate overflow-hidden rounded-[2rem] px-6 py-24 sm:px-16 sm:py-32",
              "bg-[rgb(4_28_24)] shadow-[0_40px_100px_-45px_rgb(2_20_17/0.45)]",
            )}
          >
            {/* Field, then darkener, then grain — each depends on being above the last.
                `data-animate-idle` runs the blobs only while the panel is near view. */}
            <div aria-hidden="true" data-animate-idle="" className="dm-fluid pointer-events-none -z-30">
              <span className="dm-fluid-b" />
              <span className="dm-fluid-a" />
              <span className="dm-fluid-c" />
            </div>
            <div aria-hidden="true" className="dm-fluid-core pointer-events-none -z-20" />
            <div aria-hidden="true" className="dm-grain pointer-events-none -z-10" />

            <div className="mx-auto flex max-w-[42rem] flex-col items-center gap-6 text-center">
              {badge ? (
                <p className="label inline-flex items-center gap-2 rounded-pill border border-white/25 px-3 py-1.5 text-white/80">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-white/90" />
                  {badge}
                </p>
              ) : null}

              <h2 className="text-balance font-display text-display-2 font-medium tracking-[-0.03em] text-white">
                {heading.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h2>

              {supporting ? <p className="max-w-[34rem] text-body-sm leading-relaxed text-white/85">{supporting}</p> : null}

              <div className="mt-2 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
                <SiteCta
                  to={primary.to}
                  variant="secondary"
                  data-cta={`${id}-primary`}
                  className="landing-cta-flat group/go border-transparent bg-white text-[rgb(5_36_30)] hover:bg-white/90"
                >
                  {primary.label}
                  <ArrowRight
                    className="size-4 transition-transform duration-200 group-hover/go:translate-x-1"
                    strokeWidth={2.25}
                    aria-hidden="true"
                  />
                </SiteCta>
                {secondary ? (
                  <SiteCta
                    to={secondary.to}
                    variant="secondary"
                    data-cta={`${id}-secondary`}
                    className="landing-cta-flat border-white/30 text-white hover:border-white/60 hover:bg-white/10"
                  >
                    {secondary.label}
                  </SiteCta>
                ) : null}
              </div>
            </div>
          </div>
        </Reveal>
      </Frame>
    </Band>
  );
}
