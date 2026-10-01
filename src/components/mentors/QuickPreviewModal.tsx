import { BadgeCheck, CalendarDays, Clock, MapPin, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { BookingModal } from "@/components/booking/BookingModal";
import type { Mentor } from "@/hooks/useMentors";
import { cn } from "@/lib/utils";
import {
  CHIP,
  ChipList,
  EducationList,
  LABEL,
  MentorAvatar,
  PriceLine,
  RatingInline,
  educationLines,
  formatPrice,
  hasRealAvatar,
  specialties,
  visibleLocation,
  visibleRating,
} from "./mentor-display";

interface QuickPreviewModalProps {
  mentor: Mentor;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * A mentor's profile at a glance, inside the restyled Dialog. Portalled out of
 * the site scope, so it uses the app tokens (which match the paper band).
 * `data-lenis-prevent` lets the wheel scroll this panel on Lenis pages.
 */
export const QuickPreviewModal = ({ mentor, isOpen, onClose }: QuickPreviewModalProps) => {
  const [showBooking, setShowBooking] = useState(false);
  const [showImageFullscreen, setShowImageFullscreen] = useState(false);

  // Get specialty for display
  const getSpecialty = () => {
    if (mentor.speciality) return mentor.speciality;
    if (mentor.professionalHeadline) return mentor.professionalHeadline;
    return "Dental Mentor";
  };

  // The mentor's own active services, with what they cost and how long they run.
  const services = mentor.mentorServices ?? [];

  // Get languages
  const getLanguages = () => {
    if (mentor.languages && mentor.languages.length > 0) {
      return mentor.languages;
    }
    return ["English"];
  };

  const handleBookSession = () => {
    setShowBooking(true);
    onClose();
  };

  const lines = educationLines(mentor);
  const tags = specialties(mentor);
  const rating = visibleRating(mentor);
  const location = visibleLocation(mentor);
  const sessions = mentor.sessionCount || mentor.sessions || 0;
  const about = mentor.professionalBio;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          data-lenis-prevent=""
          className="flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-y-auto p-0 sm:rounded-2xl [&>button:last-child]:hidden"
        >
          {/* Header */}
          <div className="relative border-b border-border px-5 pb-6 pt-6 sm:px-8 sm:pt-8">
            <DialogClose className="absolute right-3 top-3 grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:right-4 sm:top-4">
              <X className="size-5" aria-hidden="true" />
              <span className="sr-only">Close</span>
            </DialogClose>

            <div className="flex flex-col gap-5 pr-10 sm:flex-row sm:items-start sm:gap-6">
              <MentorAvatar
                mentor={mentor}
                className="size-20 text-xl sm:size-24 sm:text-2xl"
                onClick={hasRealAvatar(mentor) ? () => setShowImageFullscreen(true) : undefined}
              />

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="font-display text-[1.5rem] font-semibold tracking-[-0.02em] text-foreground">
                    {mentor.name}
                  </DialogTitle>
                  {mentor.verified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[rgb(15_112_93/0.08)] px-2.5 py-1 text-xs font-semibold text-primary">
                      <BadgeCheck className="size-3.5" strokeWidth={2} aria-hidden="true" />
                      Verified
                    </span>
                  ) : null}
                </div>
                <DialogDescription className="text-[0.9375rem] font-medium text-muted-foreground">
                  {getSpecialty()}
                </DialogDescription>

                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <PriceLine mentor={mentor} />
                  {rating !== null ? <RatingInline rating={rating} /> : null}
                  {sessions > 0 ? (
                    <span className="text-[0.8125rem] text-muted-foreground tabular-nums">
                      <span className="font-semibold text-foreground">{sessions}</span> sessions
                    </span>
                  ) : null}
                  {location ? (
                    <span className="inline-flex items-center gap-1 text-[0.8125rem] text-muted-foreground">
                      <MapPin className="size-3.5" aria-hidden="true" />
                      From {location}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-8 px-5 py-7 sm:px-8">
            {lines.length > 0 ? (
              <section className="flex flex-col gap-3">
                <h3 className={cn(LABEL, "text-primary")}>Education</h3>
                <EducationList lines={lines} clamp={false} className="gap-2 [&_li]:text-[0.9375rem]" />
              </section>
            ) : null}

            {about ? (
              <section className="flex flex-col gap-3">
                <h3 className={cn(LABEL, "text-primary")}>About</h3>
                <p className="break-words text-[0.9375rem] leading-relaxed text-muted-foreground">{about}</p>
              </section>
            ) : null}

            <section className="flex flex-col gap-3">
              <h3 className={cn(LABEL, "text-primary")}>Services</h3>
              {services.length > 0 ? (
                <ul className="overflow-hidden rounded-xl border border-border">
                  {services.map((service) => (
                    <li
                      key={service.id}
                      className="flex items-start justify-between gap-4 border-t border-border px-4 py-4 first:border-t-0 sm:px-5"
                    >
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="break-words text-[0.9375rem] font-semibold text-foreground">
                          {service.service_title}
                        </span>
                        {service.duration_minutes ? (
                          <span className="inline-flex items-center gap-1 text-[0.8125rem] text-muted-foreground tabular-nums">
                            <Clock className="size-3.5" aria-hidden="true" />
                            {service.duration_minutes} min
                          </span>
                        ) : null}
                      </div>
                      <span className="shrink-0 text-[0.9375rem] font-semibold text-foreground tabular-nums">
                        {formatPrice(Number(service.price))}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[0.9375rem] text-muted-foreground">
                  {mentor.name} hasn't listed any services yet.
                </p>
              )}
            </section>

            {tags.length > 0 ? (
              <section className="flex flex-col gap-3">
                <h3 className={cn(LABEL, "text-primary")}>Specialties</h3>
                <ChipList items={tags} />
              </section>
            ) : null}

            {getLanguages().length > 0 ? (
              <section className="flex flex-col gap-3">
                <h3 className={cn(LABEL, "text-primary")}>Languages</h3>
                <ul className="flex flex-wrap gap-1.5">
                  {getLanguages().map((language) => (
                    <li key={language} className={CHIP}>
                      {language}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 mt-auto border-t border-border bg-white/95 px-5 py-4 backdrop-blur sm:px-8">
            <Button variant="hero" size="xl" className="w-full" onClick={handleBookSession}>
              <CalendarDays aria-hidden="true" />
              Book a session
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBooking}
        onClose={() => setShowBooking(false)}
        mentorId={mentor.id}
        mentorName={mentor.name}
        mentorAvatar={mentor.avatar}
      />

      {/* Full-Screen Image Viewer */}
      <Dialog open={showImageFullscreen} onOpenChange={setShowImageFullscreen}>
        <DialogContent className="max-h-[95vh] max-w-[95vw] gap-0 border-0 bg-[rgb(5_36_30/0.96)] p-0 [&>button:last-child]:hidden">
          <DialogTitle className="sr-only">{mentor.name}</DialogTitle>
          <div className="relative flex h-full w-full items-center justify-center p-4">
            <DialogClose
              className="absolute right-3 top-3 z-50 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              onClick={() => setShowImageFullscreen(false)}
            >
              <X className="size-5" aria-hidden="true" />
              <span className="sr-only">Close</span>
            </DialogClose>
            <div className="relative flex h-full w-full items-center justify-center">
              <img
                src={mentor.avatar}
                alt={mentor.name}
                className="max-h-[90vh] max-w-full rounded-xl object-contain"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
