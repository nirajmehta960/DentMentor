import { ArrowRight, ArrowUpRight, BadgeCheck, Star } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";
import { SiteCta } from "./button";
import { Band, BandHeader, Frame, HAIRLINE, WIDE_RAIL } from "./chrome";
import { MENTORS } from "./content";
import { Reveal } from "./reveal";
import { useSiteRoutes } from "./routes";
import { MIN_FEATURED, useFeaturedMentors, useLandingStats, type FeaturedMentor } from "./use-landing-data";

const CARD_HEIGHT = "min-h-[13.5rem]";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function Avatar({ mentor }: { mentor: FeaturedMentor }) {
  const [failed, setFailed] = useState(false);
  if (!mentor.avatarUrl || failed) {
    return (
      <span
        aria-hidden="true"
        className="grid size-14 shrink-0 place-items-center rounded-full bg-[rgb(15_112_93/0.1)] text-[1rem] font-semibold text-band-signal"
      >
        {initials(mentor.name)}
      </span>
    );
  }
  return (
    <img
      src={mentor.avatarUrl}
      alt=""
      width={56}
      height={56}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="size-14 shrink-0 rounded-full object-cover"
    />
  );
}

function MentorCard({ mentor, to }: { mentor: FeaturedMentor; to: string }) {
  const specialties = mentor.specializations.slice(0, 2);
  const showRating = mentor.rating !== null && mentor.rating > 0 && mentor.sessions > 0;

  return (
    <Link
      to={to}
      className={cn(
        "group/mentor flex h-full flex-col gap-5 rounded-xl border bg-white p-6 transition-[transform,box-shadow] duration-200 ease-dm hover:-translate-y-0.5 hover:shadow-[var(--card-shadow)]",
        CARD_HEIGHT,
      )}
      style={{ borderColor: HAIRLINE }}
    >
      <div className="flex items-start gap-4">
        <Avatar mentor={mentor} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[1.0625rem] font-semibold text-band-fg">{mentor.name}</span>
            <BadgeCheck className="size-4 shrink-0 text-band-signal" aria-label="Verified" strokeWidth={2} />
          </span>
          {mentor.school ? (
            <span className="line-clamp-1 text-[0.875rem] text-band-muted">{mentor.school}</span>
          ) : null}
          {mentor.headline ? (
            <span className="line-clamp-2 text-[0.8125rem] leading-relaxed text-band-faint">{mentor.headline}</span>
          ) : null}
        </div>
        <ArrowUpRight
          className="size-4 shrink-0 text-band-faint transition-transform duration-200 ease-dm group-hover/mentor:-translate-y-0.5 group-hover/mentor:translate-x-0.5 group-hover/mentor:text-band-signal"
          strokeWidth={2}
          aria-hidden="true"
        />
      </div>

      {specialties.length ? (
        <ul className="flex flex-wrap gap-1.5">
          {specialties.map((s) => (
            <li
              key={s}
              className="rounded-pill bg-[rgb(15_112_93/0.07)] px-2.5 py-1 text-[0.75rem] font-medium text-band-signal"
            >
              {s}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4" style={{ borderColor: HAIRLINE }}>
        {showRating ? (
          <span className="flex items-center gap-1 text-[0.8125rem] text-band-muted" data-numeric="">
            <Star className="size-3.5 fill-current text-[rgb(234_85_11)]" aria-hidden="true" />
            <span className="font-semibold text-band-fg">{mentor.rating!.toFixed(1)}</span>
            <span className="sr-only">out of 5</span>
          </span>
        ) : (
          <span className="text-[0.8125rem] text-band-faint">{MENTORS.cardCta}</span>
        )}
        {mentor.startingPrice !== null ? (
          <span className="text-[0.8125rem] text-band-muted" data-numeric="">
            from <span className="font-semibold text-band-fg">${Math.round(mentor.startingPrice)}</span>
          </span>
        ) : null}
      </div>
    </Link>
  );
}

/**
 * Real, verified mentors from `featured_mentors()`. The cards arrive after mount,
 * and the reveal observer only sees elements present at mount — so there is ONE
 * Reveal around a wrapper that always exists, never one per card.
 *
 * The grid renders only once there are enough mentors to show. No skeletons: while
 * data is thin the grid never appears, and skeletons collapsing on an empty result
 * would pull every band below upward after load. The band is below the fold, so
 * the grid arriving late shifts nothing on screen.
 */
export function Mentors() {
  const r = useSiteRoutes();
  const stats = useLandingStats();
  const { data } = useFeaturedMentors(6);

  const mentors = data ?? [];
  const showGrid = mentors.length >= MIN_FEATURED;

  return (
    <Band id="mentors" tone="tint" className="pt-24 sm:pt-28 lg:pt-32">
      <Frame width="wide" className={cn("flex flex-col gap-12", WIDE_RAIL)}>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <BandHeader eyebrow={MENTORS.eyebrow} heading={MENTORS.heading} plainHeading lead={MENTORS.lead}>
              {stats.verifiedMentors !== null ? (
                <p className="label text-band-faint" data-numeric="">
                  <span className="text-band-signal">{stats.verifiedMentors}</span> {MENTORS.countLabel}
                </p>
              ) : null}
            </BandHeader>
          </Reveal>
          <Reveal delay={0.06} className="shrink-0">
            <SiteCta to={r.mentors} variant="ink" size="md" className="group/all">
              {MENTORS.cta}
              <ArrowRight
                className="size-4 transition-transform duration-200 group-hover/all:translate-x-1"
                strokeWidth={2.25}
                aria-hidden="true"
              />
            </SiteCta>
          </Reveal>
        </div>

        {/* Always mounted, so the observer sees it; collapses to nothing when hidden. */}
        <Reveal className={showGrid ? undefined : "-mt-12"}>
          {showGrid ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mentors.map((mentor) => (
                <li key={mentor.id} className="min-w-0">
                  <MentorCard mentor={mentor} to={r.mentors} />
                </li>
              ))}
            </ul>
          ) : null}
        </Reveal>
      </Frame>
    </Band>
  );
}
