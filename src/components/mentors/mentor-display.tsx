import { BadgeCheck, GraduationCap, Star } from "lucide-react";
import { useState } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Mentor } from "@/hooks/useMentors";
import { cn } from "@/lib/utils";

/**
 * What the directory may say about a mentor — shared by the card, the quick
 * preview and the booking header.
 *
 * `useMentors` fills gaps in a profile with invented values: a 4.5 rating for
 * every unrated mentor, a review count of 30% of sessions, five years'
 * experience, a $100 rate, "United States", "Dental School", ["English"], a stock portrait,
 * "< 2 hours" response time and "available" for everyone. Those placeholders are
 * matched here and never shown. When the hook stops inventing them, delete the
 * matching entries below.
 */
const PLACEHOLDER = {
  rating: 4.5,
  school: "Dental School",
  location: "United States",
  /** `languages_spoken || ['English']` — a lone "English" is the hook's default. */
  languages: ["English"],
  avatars: ["https://images.unsplash.com/photo-1559839734-2b71ea197ec2", "/placeholder.svg"],
} as const;

/** The small tracked uppercase label, for content portalled outside the site scope. */
export const LABEL = "text-[0.6875rem] font-semibold uppercase leading-[1.4] tracking-[0.14em]";

/** Brand-teal chip fill, the landing's specialty chip. */
export const CHIP = "rounded-full bg-[rgb(15_112_93/0.07)] px-2.5 py-1 text-xs font-medium text-primary";

export function isPlaceholderAvatar(url: string | null | undefined): boolean {
  if (!url) return true;
  return PLACEHOLDER.avatars.some((prefix) => url.startsWith(prefix));
}

export function initials(name: string): string {
  return name
    .replace(/^dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

/** A mentor's own photo, or their initials on a teal tint — never a stock face. */
export function PersonAvatar({
  name,
  src,
  className,
  onClick,
}: {
  name: string;
  src?: string | null;
  className?: string;
  onClick?: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const real = !failed && !isPlaceholderAvatar(src);

  if (!real) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "grid shrink-0 place-items-center rounded-full bg-[rgb(15_112_93/0.1)] font-semibold text-primary",
          className,
        )}
      >
        {initials(name)}
      </span>
    );
  }

  const image = (
    <img
      src={src as string}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn("shrink-0 rounded-full object-cover", className)}
    />
  );

  if (!onClick) return image;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View ${name}'s photo`}
      className="shrink-0 rounded-full transition-opacity hover:opacity-90"
    >
      {image}
    </button>
  );
}

export function MentorAvatar({ mentor, className, onClick }: { mentor: Mentor; className?: string; onClick?: () => void }) {
  return <PersonAvatar name={mentor.name} src={mentor.avatar} className={className} onClick={onClick} />;
}

export function hasRealAvatar(mentor: Mentor): boolean {
  return !isPlaceholderAvatar(mentor.avatar);
}

/** U.S. school, then MDS, then BDS — the same three levels the profile records. */
export function educationLines(mentor: Mentor): string[] {
  const lines: string[] = [];
  const derivedSchool = mentor.school && mentor.school !== PLACEHOLDER.school ? mentor.school : null;
  const usSchool = mentor.usDentalSchool || mentor.dentalSchool || derivedSchool;
  if (usSchool) lines.push(usSchool);
  if (mentor.mdsSpecialization) {
    lines.push(
      mentor.mdsUniversity
        ? `MDS ${mentor.mdsSpecialization} – ${mentor.mdsUniversity}`
        : `MDS ${mentor.mdsSpecialization}`,
    );
  }
  const bds = mentor.bdsUniversity || mentor.bachelorUniversity;
  if (bds) lines.push(`BDS – ${bds}`);
  return lines;
}

/** The mentor's own specialty and areas of expertise, de-duplicated. */
export function specialties(mentor: Mentor): string[] {
  const all = [mentor.speciality, ...(mentor.areasOfExpertise ?? [])].filter(
    (value): value is string => typeof value === "string" && value.trim().length > 0,
  );
  return Array.from(new Set(all));
}

/**
 * A rating only once there are reviews behind it. `reviews` is derived from
 * sessions in the hook and 4.5 is its stand-in for "unrated", so both gates apply.
 */
export function visibleRating(mentor: Mentor): number | null {
  if (!(mentor.reviews > 0)) return null;
  if (!(mentor.rating > 0) || mentor.rating === PLACEHOLDER.rating) return null;
  return mentor.rating;
}

export function visibleLocation(mentor: Mentor): string | null {
  return mentor.location && mentor.location !== PLACEHOLDER.location ? mentor.location : null;
}

/**
 * The languages a mentor entered. The hook substitutes ["English"] when none
 * were, so a lone "English" is treated as not entered.
 */
export function visibleLanguages(mentor: Mentor): string[] {
  const languages = (mentor.languages ?? []).filter(
    (value): value is string => typeof value === "string" && value.trim().length > 0,
  );
  const isPlaceholder =
    languages.length === PLACEHOLDER.languages.length &&
    languages.every((language, i) => language === PLACEHOLDER.languages[i]);
  return isPlaceholder ? [] : Array.from(new Set(languages));
}

export function formatPrice(amount: number): string {
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`;
}

/** From the mentor's own active services — what checkout actually charges. */
export function priceSummary(mentor: Mentor): { amount: number; from: boolean } | null {
  const prices = (mentor.mentorServices ?? [])
    .map((service) => Number(service.price))
    .filter((price) => Number.isFinite(price) && price >= 0);
  if (prices.length === 0) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return { amount: min, from: max > min };
}

export function PriceLine({ mentor, className }: { mentor: Mentor; className?: string }) {
  const price = priceSummary(mentor);
  if (!price) {
    return <p className={cn("text-[0.8125rem] text-muted-foreground", className)}>No services listed yet</p>;
  }
  return (
    <p className={cn("text-[0.8125rem] text-muted-foreground tabular-nums", className)}>
      {price.from ? "from " : null}
      <span className="text-base font-semibold text-foreground">{formatPrice(price.amount)}</span>
      {price.from ? null : " per session"}
    </p>
  );
}

export function RatingInline({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-[0.8125rem] text-muted-foreground tabular-nums", className)}>
      <Star className="size-3.5 fill-current text-secondary" aria-hidden="true" />
      <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
      <span className="sr-only">out of 5</span>
    </span>
  );
}

export function VerifiedMark({ className }: { className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("inline-flex shrink-0 text-primary", className)}>
          <BadgeCheck className="size-[1.125rem]" strokeWidth={2} aria-hidden="true" />
          <span className="sr-only">Verified</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>Verified mentor</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function EducationList({ lines, className, clamp = true }: { lines: string[]; className?: string; clamp?: boolean }) {
  if (lines.length === 0) return null;
  return (
    <ul className={cn("flex flex-col gap-1.5", className)}>
      {lines.map((line) => (
        <li key={line} className="flex items-start gap-2 text-[0.8125rem] leading-snug text-muted-foreground">
          <GraduationCap className="mt-px size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
          <span className={cn("min-w-0", clamp ? "line-clamp-1" : "break-words")}>{line}</span>
        </li>
      ))}
    </ul>
  );
}

export function ChipList({ items, className }: { items: string[]; className?: string }) {
  if (items.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {items.map((item) => (
        <li key={item} className={CHIP}>
          {item}
        </li>
      ))}
    </ul>
  );
}
