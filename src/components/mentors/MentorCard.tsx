import { useState } from "react";
import {
  Star,
  MapPin,
  DollarSign,
  CheckCircle,
  Calendar,
  Languages,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QuickPreviewModal } from "./QuickPreviewModal";
import { BookingModal } from "@/components/booking/BookingModal";
import { Mentor } from "@/hooks/useMentors";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

interface MentorCardProps {
  mentor: Mentor;
  viewMode: "grid" | "list";
  index: number;
  isVisible: boolean;
}

const availabilityConfig = {
  available: { color: "bg-green-500", label: "Available", pulse: true },
  busy: { color: "bg-yellow-500", label: "In Session", pulse: false },
  offline: { color: "bg-gray-400", label: "Offline", pulse: false },
};

export const MentorCard = ({
  mentor,
  viewMode,
  index,
  isVisible,
}: MentorCardProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  const availability = availabilityConfig[mentor.availability];

  const cardContent = (
    <div
      className={`mentor-card group relative bg-white rounded-2xl border border-border overflow-hidden transition-all duration-500 cursor-pointer h-full ${
        isVisible ? "animate-in" : "opacity-0 translate-y-8"
      } ${
        isHovered
          ? "shadow-xl scale-[1.02] -translate-y-1"
          : "shadow-sm hover:shadow-lg"
      }`}
      style={{
        transitionDelay: `${index * 100}ms`,
        transform: isHovered
          ? "translateY(-4px) scale(1.02)"
          : "translateY(0) scale(1)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setShowPreview(true)}
    >
      {/* Top gradient accent - Teal bar at top on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Gradient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Card Content */}
      <div className="relative z-10 p-4 sm:p-5 md:p-6 h-full flex flex-col">
        {viewMode === "grid" ? (
          // Grid Layout
          <>
            {/* Header */}
            <div className="flex items-start gap-3 sm:gap-4 md:gap-6 mb-3 sm:mb-4 md:mb-6">
              <div className="relative flex-shrink-0">
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-full object-cover border-2 border-primary/20 shadow-lg group-hover:border-primary/40 group-hover:shadow-xl transition-all duration-300"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />

                {/* Availability Indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 flex items-center justify-center">
                  <div
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 rounded-full border-2 border-white ${
                      availability.color
                    } ${availability.pulse ? "animate-pulse" : ""}`}
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                {/* Name with verification tick */}
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <h3 className="font-bold text-base sm:text-lg md:text-xl text-foreground truncate group-hover:text-primary transition-colors">
                    Dr. {mentor.name}
                  </h3>
                  {mentor.verified && (
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-primary rounded-full flex items-center justify-center ring-2 ring-background flex-shrink-0">
                          <BadgeCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-primary-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Verified Mentor</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                {mentor.professionalHeadline && (
                  <p className="text-muted-foreground text-sm sm:text-base mb-1.5 sm:mb-2 truncate font-medium">
                    {mentor.professionalHeadline}
                  </p>
                )}
                <div className="space-y-0.5 sm:space-y-1 mb-2 sm:mb-3 min-h-[3.5rem] sm:min-h-[4.5rem] flex flex-col justify-start">
                  {mentor.usDentalSchool && (
                    <p className="text-primary font-semibold text-xs sm:text-sm truncate">
                      🎓 {mentor.usDentalSchool}
                    </p>
                  )}
                  {mentor.mdsSpecialization && (
                    <p className="text-primary font-semibold text-xs sm:text-sm truncate">
                      🎓{" "}
                      {mentor.mdsUniversity
                        ? `MDS ${mentor.mdsSpecialization} - ${mentor.mdsUniversity}`
                        : `MDS ${mentor.mdsSpecialization}`}
                    </p>
                  )}
                  {mentor.bdsUniversity && (
                    <p className="text-primary font-semibold text-xs sm:text-sm truncate">
                      🎓 BDS - {mentor.bdsUniversity}
                    </p>
                  )}
                  {/* Legacy fields for backward compatibility */}
                  {(mentor.dentalSchool || mentor.school) &&
                    !mentor.usDentalSchool && (
                      <p className="text-primary font-semibold text-xs sm:text-sm truncate">
                        🎓 {mentor.dentalSchool || mentor.school}
                      </p>
                    )}
                  {mentor.bachelorUniversity && !mentor.bdsUniversity && (
                    <p className="text-primary font-semibold text-xs sm:text-sm truncate">
                      🎓 {mentor.bachelorUniversity}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{mentor.location}</span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  ${mentor.price}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  per session
                </div>
              </div>
            </div>

            {/* Middle Content - Flexible */}
            <div className="flex-grow">
              {/* Rating & Stats */}
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-5">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 ${
                        i < Math.floor(mentor.rating)
                          ? "text-secondary fill-current"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm sm:text-base font-semibold">
                  {mentor.rating}
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  ({mentor.reviews})
                </span>
              </div>

              {/* Bio */}
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 md:mb-5 line-clamp-3 leading-relaxed">
                {mentor.professionalBio || mentor.bio}
              </p>

              {/* Specialization */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-5 md:mb-6">
                {mentor.speciality && (
                  <Badge
                    variant="secondary"
                    className="text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {mentor.speciality}
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 sm:gap-3">
              <Button
                size="sm"
                className="w-full bg-primary hover:bg-primary/90 text-white transition-all duration-200 hover:shadow-lg text-xs sm:text-sm md:text-base py-2 sm:py-2.5 md:py-3"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBooking(true);
                }}
              >
                <Calendar className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 mr-1.5 sm:mr-2" />
                Book Session
              </Button>
            </div>
          </>
        ) : (
          // List Layout
          <>
            <div className="flex items-center gap-4 sm:gap-5 md:gap-6">
              <div className="relative flex-shrink-0">
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-36 lg:h-36 rounded-full object-cover border-2 border-primary/20 shadow-lg group-hover:border-primary/40 group-hover:shadow-xl transition-all duration-300"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />

                {/* Availability Indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 flex items-center justify-center">
                  <div
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 rounded-full border-2 border-white ${
                      availability.color
                    } ${availability.pulse ? "animate-pulse" : ""}`}
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                {/* Name with verification tick */}
                <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
                  <h3 className="font-semibold text-lg sm:text-xl text-foreground truncate group-hover:text-primary transition-colors">
                    Dr. {mentor.name}
                  </h3>
                  {mentor.verified && (
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center ring-2 ring-background flex-shrink-0">
                          <BadgeCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Verified Mentor</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                {mentor.professionalHeadline && (
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2 truncate">
                    {mentor.professionalHeadline}
                  </p>
                )}
                <div className="space-y-0.5 mb-1.5 sm:mb-2">
                  {mentor.dentalSchool || mentor.school ? (
                    <p className="text-primary font-medium text-xs sm:text-sm truncate">
                      🎓 {mentor.dentalSchool || mentor.school}
                    </p>
                  ) : null}
                  {mentor.bachelorUniversity ? (
                    <p className="text-primary font-medium text-xs sm:text-sm truncate">
                      🎓 {mentor.bachelorUniversity}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{mentor.location}</span>
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-xl sm:text-2xl font-bold text-foreground mb-0.5 sm:mb-1">
                  ${mentor.price}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  per session
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                          i < Math.floor(mentor.rating)
                            ? "text-secondary fill-current"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm font-medium">
                    {mentor.rating}
                  </span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    ({mentor.reviews})
                  </span>
                </div>

                <div className="flex gap-1.5 sm:gap-2">
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white transition-all duration-200 hover:shadow-md text-xs sm:text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowBooking(true);
                    }}
                  >
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Book
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      {cardContent}

      {/* Quick Preview Modal */}
      <QuickPreviewModal
        mentor={mentor}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />

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
            <h2 className="text-lg font-semibold">Dr. {mentor.name}</h2>
          </DialogHeader>
          <div className="flex justify-center">
            <img
              src={mentor.avatar}
              alt={mentor.name}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
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
