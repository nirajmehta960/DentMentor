import React from 'react';
import { WelcomeBar } from '@/components/dashboard/WelcomeBar';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { useUpcomingSessions } from '@/hooks/useUpcomingSessions';
import { useAvailability } from '@/hooks/useAvailability';
import { format, addDays, isWithinInterval } from 'date-fns';
import {
  DIVIDED,
  DateLeaf,
  EmptyState,
  PanelHeader,
  SkeletonRows,
  StatusPill,
  WorkPanel,
  hairline,
} from '@/components/dashboard/dashboard-ui';

interface OverviewTabProps {
  onNavigate: (tab: string) => void;
}

/** The rows `useAvailability` returns (its query result is typed `unknown`). */
type AvailabilityRow = { id: string; date: string; time_slots: unknown };

export function OverviewTab({ onNavigate }: OverviewTabProps) {
  const { upcomingSessions: sessions, isLoading } = useUpcomingSessions();
  const upcomingSessions = sessions?.slice(0, 3) || [];
  const { availability: availabilityData, isLoading: isLoadingAvailability } = useAvailability();
  const availability = availabilityData as AvailabilityRow[] | undefined;

  // The next 30 days of availability, computed once for the list and its "view all" check.
  const nextThirtyDays = (availability || []).filter((item) => {
    const itemDate = new Date(item.date + 'T00:00:00');
    const now = new Date();
    const thirtyDaysFromNow = addDays(now, 30);
    return isWithinInterval(itemDate, {
      start: now,
      end: thirtyDaysFromNow,
    });
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Section */}
      <WelcomeBar />

      {/* Quick Stats */}
      <QuickStats />

      {/* Quick Access Panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Sessions Preview */}
        <WorkPanel className="flex flex-col">
          <PanelHeader
            icon={Calendar}
            title="Upcoming sessions"
            description="Your next three bookings"
            actions={
              <Button variant="ghost" size="sm" className="relative after:absolute after:-inset-1 after:content-['']" onClick={() => onNavigate('sessions')}>
                View all
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            }
          />
          {isLoading ? (
            <SkeletonRows rows={3} />
          ) : upcomingSessions.length === 0 ? (
            <EmptyState
              icon={Calendar}
              action={
                <Button variant="outline" size="sm" onClick={() => onNavigate('availability')}>
                  Open time slots
                </Button>
              }
            >
              No upcoming sessions. They appear here as soon as a mentee books one of your slots.
            </EmptyState>
          ) : (
            <ul className={DIVIDED}>
              {upcomingSessions.map((session) => (
                <li key={session.id} className="flex items-center gap-4 px-5 py-4 sm:px-6">
                  <DateLeaf date={new Date(session.session_date)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.9375rem] font-medium text-band-fg">
                      {session.service?.title || session.mentee?.name || session.session_type}
                    </p>
                    <p className="text-[0.8125rem] text-band-muted tabular-nums">
                      {format(new Date(session.session_date), 'EEE')}
                      {/* The month and day are only drawn in the aria-hidden DateLeaf. */}
                      <span className="sr-only"> {format(new Date(session.session_date), 'MMMM d')}</span>
                      , {format(new Date(session.session_date), 'h:mm a')} · {session.duration_minutes} min
                    </p>
                    {session.service?.title && session.mentee?.name && (
                      <p className="truncate text-[0.8125rem] text-band-muted">
                        with {session.mentee.name}
                      </p>
                    )}
                  </div>
                  <StatusPill status={session.status} className="hidden min-[380px]:inline-flex" />
                </li>
              ))}
            </ul>
          )}
        </WorkPanel>

        {/* Availability Quick Access */}
        <WorkPanel className="flex flex-col">
          <PanelHeader
            icon={Clock}
            title="Your availability"
            description="Open dates in the next 30 days"
            actions={
              <Button variant="ghost" size="sm" className="relative after:absolute after:-inset-1 after:content-['']" onClick={() => onNavigate('availability')}>
                Manage
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            }
          />
          {isLoadingAvailability ? (
            <SkeletonRows rows={3} />
          ) : !availability || availability.length === 0 ? (
            <EmptyState
              icon={Clock}
              action={
                <Button variant="outline" size="sm" onClick={() => onNavigate('availability')}>
                  Configure availability
                </Button>
              }
            >
              Set the time slots mentees can book.
            </EmptyState>
          ) : nextThirtyDays.length === 0 ? (
            <EmptyState
              icon={Clock}
              action={
                <Button variant="outline" size="sm" onClick={() => onNavigate('availability')}>
                  Add dates
                </Button>
              }
            >
              No open dates in the next 30 days.
            </EmptyState>
          ) : (
            <div className="flex flex-col">
              <ul className={`${DIVIDED} max-h-[26rem] overflow-y-auto`}>
                {nextThirtyDays.map((item) => {
                  const slots = Array.isArray(item.time_slots) ? item.time_slots : [];
                  const slotCount = slots.length;
                  const itemDate = new Date(item.date + 'T00:00:00');
                  return (
                    <li key={item.id} className="flex items-center gap-4 px-5 py-3.5 sm:px-6">
                      <DateLeaf date={itemDate} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.9375rem] font-medium text-band-fg">
                          {format(itemDate, 'EEEE')}
                        </p>
                        <p className="text-[0.8125rem] text-band-muted">
                          {format(itemDate, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <StatusPill tone="teal" className="normal-case tabular-nums">
                        {slotCount} {slotCount === 1 ? 'slot' : 'slots'}
                      </StatusPill>
                    </li>
                  );
                })}
              </ul>
              {nextThirtyDays.length > 5 && (
                <div className="border-t px-5 py-2 sm:px-6" style={hairline}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate('availability')}
                    className="h-11 w-full"
                  >
                    View all availability
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </WorkPanel>
      </div>
    </div>
  );
}
