import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Clock,
  DollarSign,
  User,
  Mail,
  MapPin,
  GraduationCap,
  Languages,
  Target,
} from 'lucide-react';
import { format } from 'date-fns';
import type { Session } from '@/hooks/useUpcomingSessions';

interface SessionDetailsDialogProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
}

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Session Details</DialogTitle>
          <DialogDescription>
            Complete information about this mentoring session
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Session Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date</p>
                <p className="font-medium">{formatDate(session.session_date)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Time</p>
                <p className="font-medium">{formatTime(session.session_date)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Duration</p>
                <p className="font-medium flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {session.duration_minutes} minutes
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge variant="outline" className="capitalize">
                  {session.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Service Information */}
          {service && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Service Booked
              </h3>
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <p className="font-semibold text-lg">{service.title}</p>
                {service.description && (
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>
                )}
                {service.price && (
                  <p className="font-medium flex items-center gap-1 text-primary">
                    <DollarSign className="w-4 h-4" />
                    ${service.price} / hour
                  </p>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Mentee Information */}
          {mentee && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Mentee Information
              </h3>
              <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={profile?.avatar_url || menteeProfile?.profile_photo_url} />
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="font-semibold text-lg">{mentee.name}</p>
                    {profile?.email && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {profile.email}
                      </p>
                    )}
                  </div>

                  {/* Mentee Profile Details */}
                  {menteeProfile && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      {menteeProfile.university_name && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" />
                            University
                          </p>
                          <p className="text-sm font-medium">
                            {menteeProfile.university_name}
                          </p>
                        </div>
                      )}
                      {menteeProfile.highest_degree && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Highest Degree</p>
                          <p className="text-sm font-medium">
                            {menteeProfile.highest_degree}
                          </p>
                        </div>
                      )}
                      {menteeProfile.current_location && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Location
                          </p>
                          <p className="text-sm font-medium">
                            {menteeProfile.current_location}
                          </p>
                        </div>
                      )}
                      {menteeProfile.citizenship_country && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Citizenship</p>
                          <p className="text-sm font-medium">
                            {menteeProfile.citizenship_country}
                          </p>
                        </div>
                      )}
                      {menteeProfile.languages_spoken && menteeProfile.languages_spoken.length > 0 && (
                        <div className="sm:col-span-2">
                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <Languages className="w-3 h-3" />
                            Languages
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {menteeProfile.languages_spoken.map((lang: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {menteeProfile.target_programs && menteeProfile.target_programs.length > 0 && (
                        <div className="sm:col-span-2">
                          <p className="text-xs text-muted-foreground mb-1">Target Programs</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {menteeProfile.target_programs.map((program: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {program}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {menteeProfile.target_schools && menteeProfile.target_schools.length > 0 && (
                        <div className="sm:col-span-2">
                          <p className="text-xs text-muted-foreground mb-1">Target Schools</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {menteeProfile.target_schools.map((school: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {school}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {menteeProfile.help_needed && menteeProfile.help_needed.length > 0 && (
                        <div className="sm:col-span-2">
                          <p className="text-xs text-muted-foreground mb-1">Help Needed</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {menteeProfile.help_needed.map((help: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {help}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Payment Information */}
          {(session.price_paid || session.payment_status) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Payment Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                  {session.price_paid && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Amount Paid</p>
                      <p className="font-medium">${session.price_paid}</p>
                    </div>
                  )}
                  {session.payment_status && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                      <Badge variant="outline" className="capitalize">
                        {session.payment_status}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Session Notes */}
          {session.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Notes</h3>
                <p className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
                  {session.notes}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
