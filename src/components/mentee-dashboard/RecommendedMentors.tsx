import React from "react";
import { useMentors } from "@/hooks/useMentors";
import { Button } from "@/components/ui/button";
import { Users, ChevronRight, BadgeCheck, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  DashboardPanel,
  EmptyState,
  LIST_ROW,
  ListSkeleton,
  PanelHeader,
  PersonAvatar,
  ROW_RULE,
  StatusPill,
  TAP,
  mentorSchool,
  mentorSpecialties,
  plainName,
  startingPrice,
} from "./parts";

export function RecommendedMentors() {
  const { mentors, loading } = useMentors();

  // Get top 3 mentors (by rating or most recent)
  const recommendedMentors = mentors
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);

  return (
    <DashboardPanel aria-labelledby="mentors-explore">
      <PanelHeader
        id="mentors-explore"
        title="Mentors to explore"
        description="Each mentor sets their own services, prices and session lengths."
        action={
          <Button asChild variant="ghost" size="sm" className={TAP}>
            <Link to="/mentors">
              View all
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      {loading ? (
        <ListSkeleton rows={3} />
      ) : recommendedMentors.length === 0 ? (
        <EmptyState
          icon={Users}
          message="No mentors are listed right now."
          action={
            <Button asChild size="sm" className={TAP}>
              <Link to="/mentors">Browse all mentors</Link>
            </Button>
          }
        />
      ) : (
        <ul>
          {recommendedMentors.map((mentor) => {
            const name = plainName(mentor.name);
            const school = mentorSchool(mentor);
            const specialties = mentorSpecialties(mentor);
            const from = startingPrice(mentor);
            const headline = mentor.professionalHeadline && mentor.professionalHeadline !== mentor.name
              ? mentor.professionalHeadline
              : null;

            return (
              <li
                key={mentor.id}
                className={cn(LIST_ROW, "flex flex-col gap-4 py-5 sm:flex-row sm:items-center")}
                style={ROW_RULE}
              >
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <PersonAvatar name={name} src={mentor.avatar} className="size-14" fallbackClassName="text-[1rem]" />

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h3 className="flex items-center gap-1.5">
                      <span className="truncate text-[1rem] font-semibold text-band-fg">{name}</span>
                      {mentor.verified ? (
                        <BadgeCheck className="size-4 shrink-0 text-band-signal" strokeWidth={2} aria-label="Verified" role="img" />
                      ) : null}
                    </h3>
                    {school ? <p className="truncate text-[0.875rem] text-band-muted">{school}</p> : null}
                    {headline ? (
                      <p className="line-clamp-2 text-[0.8125rem] leading-relaxed text-band-faint">{headline}</p>
                    ) : null}
                    {specialties.length ? (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {specialties.map((s) => (
                          <StatusPill key={s} className="whitespace-normal break-words">{s}</StatusPill>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center sm:gap-2">
                  {from !== null ? (
                    <p className="text-[0.875rem] text-band-muted tabular-nums">
                      from <span className="text-[1.0625rem] font-semibold text-band-fg">${Math.round(from)}</span>
                    </p>
                  ) : (
                    <span aria-hidden="true" />
                  )}
                  <Button asChild variant="hero" size="sm" className={TAP}>
                    <Link to={`/mentors?mentor=${mentor.id}`}>
                      <Calendar className="size-4" strokeWidth={1.75} aria-hidden="true" />
                      Book session
                    </Link>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardPanel>
  );
}
