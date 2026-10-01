import { CalendarClock, Clock } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { HERO, HERO_CARDS } from "./content";
import { onScrollFrame } from "./smooth-scroll";

/**
 * The product composition at the foot of the hero: the screenshot in a glass
 * frame, and two cards overhanging it that drift at different rates as you
 * scroll. The screenshot itself never moves — no entrance transform, no tilt.
 */

/**
 * Scroll-linked drift. `rate` is px of drift per px of scroll, signed; the two
 * cards use different rates and it's the DIFFERENCE that reads as floating.
 *
 * Position comes from the offsetTop chain (layout, transform-free) and is cached;
 * the frame callback reads nothing and just writes a transform.
 */
function useDrift(rate: number) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Its own layer while it moves, released on cleanup.
    el.style.willChange = "transform";

    let centre = 0;
    let halfView = 0;
    let amplitude = 0;
    let span = 1;

    const remeasure = () => {
      let y = 0;
      let node: HTMLElement | null = el;
      while (node) {
        y += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      const half = el.offsetHeight / 2;
      centre = y + half;
      halfView = window.innerHeight / 2;
      span = halfView + half;
      amplitude = span * rate;
    };
    remeasure();

    let last = NaN;
    const apply = (scrollY: number) => {
      const fromCentre = scrollY + halfView - centre;
      // Off-screen: nothing to write.
      if (Math.abs(fromCentre) > span * (1 + Math.abs(rate))) return;
      const offset = (fromCentre / span) * amplitude;
      if (Math.abs(offset - last) < 0.01) return;
      last = offset;
      el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    };

    const onResize = () => {
      remeasure();
      apply(window.scrollY);
    };
    // The hero's height changes when the screenshot decodes after mount.
    const observer = new ResizeObserver(onResize);
    observer.observe(document.documentElement);
    window.addEventListener("resize", onResize);
    apply(window.scrollY);
    const unsubscribe = onScrollFrame(apply);

    return () => {
      unsubscribe();
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      el.style.transform = "";
      el.style.willChange = "";
    };
  }, [rate]);

  return ref;
}

/**
 * ONE fade over the whole composition, so frame, screenshot and both cards
 * dissolve on the same line. Stops are fractions of the frame's height: the
 * wrapper is exactly 240px taller than the frame (`pb-60`), which the
 * subtraction removes. Change the padding, the margin or the 240 together.
 */
const HERO_SHOT_MASK = [
  "linear-gradient(to bottom,",
  "#000 0,",
  "#000 calc((100% - 240px) * 0.599),",
  "rgb(0 0 0 / 0.72) calc((100% - 240px) * 0.773),",
  "rgb(0 0 0 / 0.28) calc((100% - 240px) * 0.904),",
  "transparent calc(100% - 240px))",
].join(" ");

/**
 * Empty run below each card's last row. A card must never END inside the visible
 * composition, or you see its edge and shadow stop above the fade; ending well
 * below the fade's zero point makes both cards vanish on the same line.
 */
const SHOT_CARD_FOOT_PX = 300;

export function HeroShot({ className }: { className?: string }) {
  // A missing or broken screenshot shows a quiet surface rather than a broken-image icon.
  const [failed, setFailed] = useState(false);

  return (
    <div
      className="relative w-full pb-60 -mb-60"
      style={{
        maskImage: HERO_SHOT_MASK,
        WebkitMaskImage: HERO_SHOT_MASK,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }}
    >
      {/* `data-nav-flip` is what the nav watches to decide when to turn light. On phones the
          frame runs 12% past each edge so the product reads as a product, not a
          thumbnail — negative margins, because auto margins can't centre a box wider
          than its parent. The hero's `overflow-clip` stops it becoming a scrollbar. */}
      <div
        id="hero-shot"
        data-nav-flip="48"
        className={cn(
          "relative mx-[-12%] w-[124%] max-w-none px-4",
          "sm:mx-auto sm:w-full sm:max-w-[66rem] sm:px-8",
          className,
        )}
      >
        {/* Glass frame: the padding is the pane. Radii stay concentric — outer
            minus padding equals inner — at both sizes. No backdrop-blur: behind it
            is a smooth glow, and a blur on a masked element with moving children
            is a per-frame cost for nothing. */}
        <div
          className={cn(
            "hero-shot-still relative rounded-[1.25rem] p-[6px] sm:rounded-[1.75rem] sm:p-[10px]",
            "bg-[linear-gradient(160deg,rgb(255_255_255/0.28),rgb(255_255_255/0.12)_45%,rgb(255_255_255/0.05))]",
            "ring-1 ring-inset ring-white/25",
            "shadow-[0_40px_100px_-40px_rgb(2_20_17/0.55)]",
          )}
        >
          {failed || !HERO.shot.src ? (
            <div
              role="img"
              aria-label={HERO.shot.alt}
              className="w-full rounded-[0.875rem] bg-[linear-gradient(180deg,rgb(245_250_249),rgb(230_241_239))] sm:rounded-[1.25rem]"
              style={{ aspectRatio: `${HERO.shot.width} / ${HERO.shot.height}` }}
            />
          ) : (
            <img
              src={HERO.shot.src}
              alt={HERO.shot.alt}
              width={HERO.shot.width}
              height={HERO.shot.height}
              loading="eager"
              decoding="async"
              onError={() => setFailed(true)}
              // React 18 knows neither spelling of this attribute.
              {...({ fetchpriority: "high" } as Record<string, string>)}
              draggable={false}
              className="relative block w-full select-none rounded-[0.875rem] sm:rounded-[1.25rem]"
            />
          )}
        </div>

        {/* Desktop only: at phone width they would cover the screenshot rather
            than frame it. */}
        <ShotCard
          rate={0.2}
          width={277}
          className="-left-8 top-[58%] hidden lg:block xl:-left-20"
          icon={<Clock />}
          label={HERO_CARDS.services.label}
          title={HERO_CARDS.services.title}
        >
          <ul className="flex flex-col">
            {HERO_CARDS.services.rows.map((row) => (
              <li
                key={row.title}
                className="flex items-center justify-between gap-3 border-b border-band-rule-faint py-2.5 last:border-0"
              >
                <span className="truncate text-[0.8125rem] font-semibold text-band-fg">{row.title}</span>
                <span className="shrink-0 text-[0.75rem] text-band-muted" data-numeric="">
                  {row.meta}
                </span>
              </li>
            ))}
          </ul>
        </ShotCard>

        <ShotCard
          rate={-0.15}
          width={288}
          className="-right-4 top-[30%] hidden lg:block xl:-right-16"
          icon={<CalendarClock />}
          label={HERO_CARDS.schedule.label}
          title={HERO_CARDS.schedule.title}
        >
          <ul className="grid grid-cols-2 gap-2">
            {HERO_CARDS.schedule.slots.map((slot, i) => (
              <li
                key={slot}
                data-numeric=""
                className={cn(
                  "rounded-tile border py-2 text-center text-[0.8125rem] font-medium",
                  i === HERO_CARDS.schedule.selected
                    ? "border-transparent bg-[rgb(15_112_93)] text-white"
                    : "border-band-rule text-band-fg",
                )}
              >
                {slot}
              </li>
            ))}
          </ul>
          <p className="mt-3 rounded-pill bg-band-fg py-2.5 text-center text-[0.8125rem] font-medium text-white">
            {HERO_CARDS.schedule.cta}
          </p>
        </ShotCard>
      </div>
    </div>
  );
}

/**
 * One overhanging card. `data-band="paper"` so its colours resolve against its
 * own white ground rather than the hero's ink. `aria-hidden`: everything on it
 * restates what the screenshot's alt text already describes.
 */
function ShotCard({
  rate,
  width,
  icon,
  label,
  title,
  className,
  children,
}: {
  rate: number;
  width: number;
  icon: ReactNode;
  label: string;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useDrift(rate);

  return (
    <div ref={ref} aria-hidden="true" className={cn("absolute z-20", className)} style={{ width }}>
      <div
        data-band="paper"
        className="hero-shot-card overflow-hidden rounded-[10px] border-[0.78px] border-[#E3ECEA] bg-white px-5 pt-4 text-band-fg"
        style={{ paddingBottom: SHOT_CARD_FOOT_PX }}
      >
        <div className="flex items-center gap-2.5">
          <span className="grid size-7 place-items-center rounded-[8px] bg-[rgb(15_112_93/0.08)] text-band-signal [&>svg]:size-4">
            {icon}
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="label text-band-signal">{label}</p>
            <p className="truncate text-[0.9375rem] font-semibold leading-tight text-band-fg">{title}</p>
          </div>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
