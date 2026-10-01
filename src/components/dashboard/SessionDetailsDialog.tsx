import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  DollarSign,
  User,
  Mail,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import type { Session } from '@/hooks/useUpcomingSessions';
import { IconTile, MetaLabel, StatusPill } from './dashboard-ui';

interface SessionDetailsDialogProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
}

/* This dialog portals to <body>, outside the dashboard's AppShell, so it uses
   the app theme tokens (which carry the same teal ink) instead of band tokens. */

function Section({ icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <IconTile icon={icon} />
        <h3 className="font-display text-[1rem] font-semibold tracking-[-0.01em] text-foreground">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Fact({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <MetaLabel className="mb-1.5">{label}</MetaLabel>
      <div className="text-[0.9375rem] font-medium text-foreground">{children}</div>
    </div>
  );
}

function Chips({ items, tone = 'muted' }: { items: string[]; tone?: 'muted' | 'teal' }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, idx) => (
        <StatusPill key={idx} tone={tone} className="normal-case">
          {item}
        </StatusPill>
      ))}
    </div>
  );
}

const FACT_GRID = 'grid grid-cols-1 gap-x-6 gap-y-4 rounded-xl border p-4 sm:grid-cols-2';

export function SessionDetailsDialog({
  session,
  isOpen,
  onClose,
}: SessionDetailsDialogProps) {
  if (!session) return null;

  const mentee = session.mentee;
  const menteeProfile = mentee?.menteeProfile;
  const profile = mentee?.profile;
  const service = session.service;

  const initials = profile
    ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() || 'M'
    : 'M';

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'EEEE, MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-2xl overflow-y-auto rounded-2xl p-5 sm:p-7">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle className="font-display text-[1.375rem] font-semibold tracking-[-0.02em]">
            Session details
          </DialogTitle>
          <DialogDescription>
            Everything about this session and the mentee who booked it.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-7">
          {/* Session Information */}
          <Section icon={Calendar} title="Session">
            <div className={FACT_GRID}>
              <Fact label="Date">{formatDate(session.session_date)}</Fact>
              <Fact label="Time">
                <span className="tabular-nums">{formatTime(session.session_date)}</span>
              </Fact>
              <Fact label="Duration">
                <span className="tabular-nums">{session.duration_minutes} minutes</span>
              </Fact>
              <Fact label="Status">
                <StatusPill status={session.status} />
              </Fact>
            </div>
          </Section>

          {/* Service Information */}
          {service && (
            <Section icon={Target} title="Service booked">
              <div className="flex flex-col gap-2 rounded-xl border p-4">
                <p className="text-[1rem] font-semibold text-foreground">{service.title}</p>
                {service.description && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                )}
                {service.price && (
                  <p className="text-[0.9375rem] font-semibold text-primary tabular-nums">
                    ${service.price}
                  </p>
                )}
              </div>
            </Section>
          )}

          {/* Mentee Information */}
          {mentee && (
            <Section icon={User} title="Mentee">
              <div className="flex flex-col gap-5 rounded-xl border p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="size-14">
                    <AvatarImage src={profile?.avatar_url || menteeProfile?.profile_photo_url} className="object-cover" />
                    <AvatarFallback className="bg-[rgb(15_112_93/0.1)] text-base font-semibold text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-[1.0625rem] font-semibold text-foreground">{mentee.name}</p>
                    {profile?.email && (
                      <p className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{profile.email}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Mentee Profile Details */}
                {menteeProfile && (
                  <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                    {menteeProfile.university_name && (
                      <Fact label="University">{menteeProfile.university_name}</Fact>
                    )}
                    {menteeProfile.highest_degree && (
                      <Fact label="Highest degree">{menteeProfile.highest_degree}</Fact>
                    )}
                    {menteeProfile.current_location && (
                      <Fact label="Location">{menteeProfile.current_location}</Fact>
                    )}
                    {menteeProfile.citizenship_country && (
                      <Fact label="Citizenship">{menteeProfile.citizenship_country}</Fact>
                    )}
                    {menteeProfile.languages_spoken && menteeProfile.languages_spoken.length > 0 && (
                      <Fact label="Languages" wide>
                        <Chips items={menteeProfile.languages_spoken} />
                      </Fact>
                    )}
                    {menteeProfile.target_programs && menteeProfile.target_programs.length > 0 && (
                      <Fact label="Target programs" wide>
                        <Chips items={menteeProfile.target_programs} tone="teal" />
                      </Fact>
                    )}
                    {menteeProfile.target_schools && menteeProfile.target_schools.length > 0 && (
                      <Fact label="Target schools" wide>
                        <Chips items={menteeProfile.target_schools} tone="teal" />
                      </Fact>
                    )}
                    {menteeProfile.help_needed && menteeProfile.help_needed.length > 0 && (
                      <Fact label="Help needed" wide>
                        <Chips items={menteeProfile.help_needed} />
                      </Fact>
                    )}
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Payment Information */}
          {(session.price_paid || session.payment_status) && (
            <Section icon={DollarSign} title="Payment">
              <div className={FACT_GRID}>
                {session.price_paid && (
                  <Fact label="Amount paid">
                    <span className="tabular-nums">${session.price_paid}</span>
                  </Fact>
                )}
                {session.payment_status && (
                  <Fact label="Payment status">
                    <StatusPill status={session.payment_status} />
                  </Fact>
                )}
              </div>
            </Section>
          )}

          {/* Session Notes */}
          {session.notes && (
            <section className="flex flex-col gap-2">
              <MetaLabel>Notes</MetaLabel>
              <p className="whitespace-pre-line rounded-xl border p-4 text-sm leading-relaxed text-muted-foreground">
                {session.notes}
              </p>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
