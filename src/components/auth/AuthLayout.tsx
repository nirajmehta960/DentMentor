import { BadgeCheck, CalendarClock, CreditCard, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { AppShell, DentMark, Enter, Wordmark } from "@/components/site";
import { cn } from "@/lib/utils";

/**
 * The sign-in / sign-up frame: on lg+ an ink brand panel on the left and the
 * form on paper to the right; below lg the form alone under a compact brand row.
 *
 * `AppShell nav={false}` rather than `SiteShell`: it sets the kit scope and
 * motion without Lenis or a footer, and the site nav over a split layout is
 * noise — the mark is the way home.
 *
 * Every claim here is a product fact (see src/components/site/content.ts); no
 * counts, quotes or endorsements.
 */

const FACTS: readonly { icon: LucideIcon; text: string }[] = [
  {
    icon: BadgeCheck,
    text: "Mentors are U.S. dental students and graduates. Verified profiles carry a badge.",
  },
  {
    icon: CalendarClock,
    text: "Availability is shown in your timezone, and Stripe checkout holds your slot while you pay.",
  },
  {
    icon: CreditCard,
    text: "Pay per session. No subscriptions.",
  },
];

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell nav={false}>
      <div className="grid min-h-svh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <BrandPanel />

        <div data-band="paper" className="flex min-w-0 flex-col bg-band-ground text-band-fg">
          <div className="flex items-center px-5 pt-4 sm:px-8 sm:pt-6 lg:hidden">
            <HomeLink />
          </div>

          <div className="flex flex-1 items-center justify-center px-5 pb-12 pt-8 sm:px-8 sm:py-14 lg:py-16">
            <div className="w-full max-w-[26rem]">{children}</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function HomeLink({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="DentMentor home"
      className={cn("flex min-h-11 items-center gap-2.5 self-start rounded-[0.375rem]", className)}
    >
      <DentMark />
      <Wordmark />
    </Link>
  );
}

function BrandPanel() {
  return (
    <aside
      data-band="ink"
      className="relative isolate hidden overflow-clip bg-band-ground text-band-fg lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:self-start"
    >
      <div aria-hidden="true" className="dm-page-ground pointer-events-none absolute inset-0 -z-10" />
      <div aria-hidden="true" className="dm-grain dm-grain-faint pointer-events-none absolute inset-0 -z-10" />

      <div className="flex h-full flex-col justify-between gap-12 px-10 py-8 xl:px-16 xl:py-10">
        <HomeLink />

        <div className="flex max-w-[30rem] flex-col gap-7">
          <Enter>
            <p
              className="label inline-flex items-center gap-2 rounded-pill border px-3 py-1.5 text-band-fg"
              style={{ borderColor: "rgb(245 250 249 / 0.22)" }}
            >
              <span aria-hidden="true" className="size-1.5 rounded-full bg-band-signal" />
              Mentorship for international dentists
            </p>
          </Enter>

          <Enter delay={0.07}>
            <p className="text-balance font-display text-display-3 font-medium tracking-[-0.03em] text-band-fg">
              <span className="block">Your path to U.S. dentistry,</span>
              <span className="block bg-[linear-gradient(90deg,#ffffff_12%,rgb(105_211_190)_62%,rgb(62_186_244)_98%)] bg-clip-text pb-[0.12em] text-transparent">
                guided by those who walked it.
              </span>
            </p>
          </Enter>

          <Enter delay={0.14}>
            <p className="text-pretty text-body-sm leading-relaxed text-band-muted">
              Book 1:1 sessions with U.S. dental students and graduates for SOP reviews, mock interviews, CV
              reviews and application strategy.
            </p>
          </Enter>

          <Enter delay={0.21}>
            <ul className="flex flex-col gap-4 border-t pt-7">
              {FACTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3.5">
                  <span
                    aria-hidden="true"
                    className="grid size-10 shrink-0 place-items-center rounded-tile border bg-white/[0.04]"
                  >
                    <Icon className="size-[1.125rem] text-band-signal" strokeWidth={1.75} />
                  </span>
                  <span className="pt-2 text-[0.9375rem] leading-relaxed text-band-muted">{text}</span>
                </li>
              ))}
            </ul>
          </Enter>
        </div>

        <p className="text-[0.8125rem] text-band-faint">© 2026 DentMentor. All rights reserved.</p>
      </div>
    </aside>
  );
}
