import React from 'react';
import { MenteeWelcomeBar } from '@/components/mentee-dashboard/MenteeWelcomeBar';
import { MenteeQuickStats } from '@/components/mentee-dashboard/MenteeQuickStats';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight, BadgeCheck, Users } from 'lucide-react';
import { useMenteeUpcomingSessions } from '@/hooks/useMenteeUpcomingSessions';
import { useMentors } from '@/hooks/useMentors';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
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
} from '@/components/mentee-dashboard/parts';

interface OverviewTabProps {
  onNavigate: (tab: string) => void;
}

export function OverviewTab({ onNavigate }: OverviewTabProps) {
  const { upcomingSessions: sessions, isLoading } = useMenteeUpcomingSessions();
  const upcomingSessions = sessions?.slice(0, 3) || [];
  const { mentors, loading: mentorsLoading } = useMentors();

  // Get top 3 recommended mentors
  const recommendedMentors = mentors
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Section */}
      <MenteeWelcomeBar />

      {/* Quick Stats */}
      <MenteeQuickStats />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Sessions Preview */}
        <DashboardPanel aria-labelledby="overview-sessions">
          <PanelHeader
            id="overview-sessions"
            title="Upcoming sessions"
            description="Times are shown in your time zone."
            action={
              <Button variant="ghost" size="sm" className={TAP} onClick={() => onNavigate('sessions')}>
                View all
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            }
          />
          {isLoading ? (
            <ListSkeleton rows={3} />
          ) : upcomingSessions.length === 0 ? (
            <EmptyState
              icon={Calendar}
              message="You have no upcoming sessions."
              action={
                <Button size="sm" className={TAP} onClick={() => onNavigate('mentors')}>
                  Find a mentor
                </Button>
              }
            />
          ) : (
            <ul>
              {upcomingSessions.map((session) => {
                const when = new Date(session.session_date);
                return (
                  <li key={session.id} className={cn(LIST_ROW, 'flex items-center gap-4')} style={ROW_RULE}>
                    <span
                      aria-hidden="true"
                      className="flex size-12 shrink-0 flex-col items-center justify-center rounded-tile border bg-white leading-none"
                      style={ROW_RULE}
                    >
                      <span className="text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-band-signal">
                        {format(when, 'MMM')}
                      </span>
                      <span className="mt-0.5 text-[1.0625rem] font-semibold text-band-fg tabular-nums">
                        {format(when, 'd')}
                      </span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.9375rem] font-medium text-band-fg">
                        {session.service?.title ||
                          session.session_type ||
                          "Mentorship Session"}
                      </p>
                      <p className="text-[0.8125rem] text-band-muted tabular-nums">
                        {format(when, 'MMM d, h:mm a')}
                      </p>
                      {session.service?.title && session.mentor?.name && (
                        <p className="truncate text-[0.8125rem] text-band-muted">
                          with {plainName(session.mentor.name)}
                        </p>
                      )}
                    </div>
                    <StatusPill className="tabular-nums">{session.duration_minutes} min</StatusPill>
                  </li>
                );
              })}
            </ul>
          )}
        </DashboardPanel>

        {/* Mentors Preview */}
        <DashboardPanel aria-labelledby="overview-mentors">
          <PanelHeader
            id="overview-mentors"
            title="Mentors to explore"
            description="Each mentor sets their own services, prices and session lengths."
            action={
              <Button variant="ghost" size="sm" className={TAP} onClick={() => onNavigate('mentors')}>
                Browse all
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            }
          />
          {mentorsLoading ? (
            <ListSkeleton rows={3} />
          ) : recommendedMentors.length === 0 ? (
            <EmptyState
              icon={Users}
              message="No mentors are listed right now."
              action={
                <Button size="sm" className={TAP} onClick={() => onNavigate('mentors')}>
                  Browse all mentors
                </Button>
              }
            />
          ) : (
            <ul>
              {recommendedMentors.map((mentor) => {
                const name = plainName(mentor.name);
                const school = mentorSchool(mentor);
                const specialties = mentorSpecialties(mentor, 1);
                const from = startingPrice(mentor);
                return (
                  <li key={mentor.id} className={cn(LIST_ROW, 'flex items-start gap-4')} style={ROW_RULE}>
                    <PersonAvatar name={name} src={mentor.avatar} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5">
                        <span className="truncate text-[0.9375rem] font-medium text-band-fg">{name}</span>
                        {mentor.verified ? (
                          <BadgeCheck className="size-4 shrink-0 text-band-signal" strokeWidth={2} aria-label="Verified" role="img" />
                        ) : null}
                      </p>
                      {school ? <p className="truncate text-[0.8125rem] text-band-muted">{school}</p> : null}
                      {specialties.length || from !== null ? (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {specialties.map((s) => (
                            <StatusPill key={s} className="whitespace-normal break-words">{s}</StatusPill>
                          ))}
                          {from !== null ? (
                            <span className="text-[0.8125rem] text-band-muted tabular-nums">
                              from <span className="font-semibold text-band-fg">${Math.round(from)}</span>
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                    <Button asChild variant="outline" size="sm" className={cn('shrink-0', TAP)}>
                      <Link to={`/mentors?mentor=${mentor.id}`}>View</Link>
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </DashboardPanel>
      </div>
    </div>
  );
}
