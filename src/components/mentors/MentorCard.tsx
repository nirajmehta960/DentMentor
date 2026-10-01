import { useState, type MouseEvent } from "react";
import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HAIRLINE } from "@/components/site";
import { BookingModal } from "@/components/booking/BookingModal";
import type { Mentor } from "@/hooks/useMentors";
import { cn } from "@/lib/utils";
import { QuickPreviewModal } from "./QuickPreviewModal";
import {
  ChipList,
  EducationList,
  MentorAvatar,
  PriceLine,
  RatingInline,
  VerifiedMark,
  educationLines,
  specialties,
  visibleRating,
} from "./mentor-display";

interface MentorCardProps {
  mentor: Mentor;
  viewMode: "grid" | "list";
  /** Kept for the grid's call site; the entrance is now one Reveal on the grid. */
  index?: number;
  /** Kept for the grid's call site; the entrance is now one Reveal on the grid. */
  isVisible?: boolean;
}

/**
 * The landing's mentor card (src/components/site/mentors.tsx), extended with the
 * directory's two actions. The whole card opens the quick preview; the buttons
 * are there so the same two actions are reachable by keyboard.
 */
export const MentorCard = ({ mentor, viewMode }: MentorCardProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  const rating = visibleRating(mentor);
  const lines = educationLines(mentor);
  const tags = specialties(mentor).slice(0, 3);
  const bio = mentor.professionalBio;

  const openPreview = (e: MouseEvent) => {
    e.stopPropagation();
    setShowPreview(true);
  };
  const openBooking = (e: MouseEvent) => {
    e.stopPropagation();
    setShowBooking(true);
  };

  const nameRow = (
    <h3 className="flex min-w-0 items-center gap-1.5">
      <span className="truncate text-[1.0625rem] font-semibold leading-snug text-foreground">{mentor.name}</span>
      {mentor.verified ? <VerifiedMark /> : null}
    </h3>
  );

  const actions = (
    <div className={cn("grid grid-cols-2 gap-2", viewMode === "list" && "sm:grid-cols-1")}>
      <Button type="button" variant="outline" className="h-11 min-w-0 px-3" onClick={openPreview}>
        View profile
      </Button>
      <Button type="button" className="h-11 min-w-0 px-3" onClick={openBooking}>
        <CalendarDays aria-hidden="true" />
        Book
      </Button>
    </div>
  );

  const cardContent =
    viewMode === "grid" ? (
      <div
        className="group/mentor flex h-full cursor-pointer flex-col gap-5 rounded-xl border bg-white p-5 transition-[transform,box-shadow] duration-200 ease-dm hover:-translate-y-0.5 hover:shadow-[var(--card-shadow)] sm:p-6"
        style={{ borderColor: HAIRLINE }}
        onClick={() => setShowPreview(true)}
      >
        <div className="flex items-start gap-4">
          <MentorAvatar mentor={mentor} className="size-16 text-lg" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {nameRow}
            {mentor.professionalHeadline ? (
              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{mentor.professionalHeadline}</p>
            ) : null}
          </div>
        </div>

        <EducationList lines={lines} />

        {bio ? <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{bio}</p> : null}

        <ChipList items={tags} />

        <div className="mt-auto flex flex-col gap-4 border-t pt-4" style={{ borderColor: HAIRLINE }}>
          <div className="flex min-h-6 items-center justify-between gap-3">
            <PriceLine mentor={mentor} />
            {rating !== null ? <RatingInline rating={rating} /> : null}
          </div>
          {actions}
        </div>
      </div>
    ) : (
      <div
        className="group/mentor flex cursor-pointer flex-col gap-5 rounded-xl border bg-white p-5 transition-[transform,box-shadow] duration-200 ease-dm hover:-translate-y-0.5 hover:shadow-[var(--card-shadow)] sm:flex-row sm:items-start sm:gap-6 sm:p-6"
        style={{ borderColor: HAIRLINE }}
        onClick={() => setShowPreview(true)}
      >
        <div className="flex min-w-0 flex-1 items-start gap-4 sm:gap-5">
          <MentorAvatar mentor={mentor} className="size-16 text-lg sm:size-20 sm:text-xl" />
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              {nameRow}
              {mentor.professionalHeadline ? (
                <p className="line-clamp-1 text-sm text-muted-foreground">{mentor.professionalHeadline}</p>
              ) : null}
            </div>
            <EducationList lines={lines} />
            {bio ? <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{bio}</p> : null}
            <ChipList items={tags} />
          </div>
        </div>

        <div
          className="flex shrink-0 flex-col gap-4 border-t pt-4 sm:w-48 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0"
          style={{ borderColor: HAIRLINE }}
        >
          <div className="flex flex-col gap-1.5">
            <PriceLine mentor={mentor} />
            {rating !== null ? <RatingInline rating={rating} /> : null}
          </div>
          {actions}
        </div>
      </div>
    );

  return (
    <TooltipProvider>
      {cardContent}

      {/* Quick Preview Modal */}
      <QuickPreviewModal mentor={mentor} isOpen={showPreview} onClose={() => setShowPreview(false)} />

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBooking}
        onClose={() => setShowBooking(false)}
        mentorId={mentor.id}
        mentorName={mentor.name}
        mentorAvatar={mentor.avatar}
      />

      {/* Full Image Modal */}
      <Dialog open={showImage} onOpenChange={setShowImage}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{mentor.name}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img
              src={mentor.avatar}
              alt={mentor.name}
              className="max-h-[70vh] max-w-full rounded-xl object-contain"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
