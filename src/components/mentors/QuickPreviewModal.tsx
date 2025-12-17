import {
  X,
  Star,
  MapPin,
  Clock,
  CheckCircle,
  Calendar,
  MessageCircle,
  GraduationCap,
  Award,
  Users,
  Briefcase,
  Globe,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { BookingModal } from "@/components/booking/BookingModal";
import { Mentor } from "@/hooks/useMentors";
import { useState } from "react";

interface QuickPreviewModalProps {
  mentor: Mentor;
  isOpen: boolean;
  onClose: () => void;
}

const availabilityConfig = {
  available: {
    color: "bg-green-500",
    label: "Available Now",
    pulse: true,
    textColor: "text-green-700",
  },
  busy: {
    color: "bg-amber-500",
    label: "In Session",
    pulse: false,
    textColor: "text-amber-700",
  },
  offline: {
    color: "bg-muted-foreground",
    label: "Offline",
    pulse: false,
    textColor: "text-muted-foreground",
  },
};

export const QuickPreviewModal = ({
  mentor,
  isOpen,
  onClose,
}: QuickPreviewModalProps) => {
  const [showBooking, setShowBooking] = useState(false);
  const [showImageFullscreen, setShowImageFullscreen] = useState(false);
  const availability = availabilityConfig[mentor.availability];

  // Get school name for display
  const getSchoolName = () => {
    if (mentor.usDentalSchool) return mentor.usDentalSchool;
    if (mentor.dentalSchool) return mentor.dentalSchool;
    if (mentor.school) return mentor.school;
    return null;
  };

  // Get specialty for display
  const getSpecialty = () => {
    if (mentor.speciality) return mentor.speciality;
    if (mentor.professionalHeadline) return mentor.professionalHeadline;
    return "Dental Mentor";
  };

  // Get services
  const getServices = () => {
    if (mentor.mentorServices && mentor.mentorServices.length > 0) {
      return mentor.mentorServices.map((s) => s.service_title);
    }
    if (mentor.areasOfExpertise && mentor.areasOfExpertise.length > 0) {
      return mentor.areasOfExpertise;
    }
    return [
      "CV/Resume Review",
      "SOP Review & Feedback",
      "Mock Interview Session",
      "Application Strategy Consultation",
    ];
  };

  // Get languages
  const getLanguages = () => {
    if (mentor.languages && mentor.languages.length > 0) {
      return mentor.languages;
    }
    return ["English"];
  };

  // Get tags/specializations
  const getTags = () => {
    if (mentor.areasOfExpertise && mentor.areasOfExpertise.length > 0) {
      return mentor.areasOfExpertise;
    }
    if (mentor.speciality) {
      return [mentor.speciality];
    }
    return [];
  };

  const handleBookSession = () => {
    setShowBooking(true);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-0 shadow-2xl [&>button]:hidden">
          {/* Header with gradient background */}
          <div className="relative bg-gradient-to-br from-primary via-primary/95 to-accent p-6 pb-8">
            {/* Decorative elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent)/0.3),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--secondary)/0.2),transparent_50%)]" />

            <DialogClose className="absolute right-4 top-4 rounded-full bg-white/10 backdrop-blur-sm p-2 opacity-70 hover:opacity-100 hover:bg-white/20 transition-all z-20">
              <X className="h-4 w-4 text-white" />
              <span className="sr-only">Close</span>
            </DialogClose>

            <div className="relative z-10 mt-8">
              <div className="flex items-start gap-5 mb-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-xl cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setShowImageFullscreen(true)}
                  >
                    <img
                      src={mentor.avatar}
                      alt={mentor.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                </div>

                <div className="flex-1 text-white min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold">{mentor.name}</h2>
                    {mentor.verified && (
                      <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ring-2 ring-white/30 flex-shrink-0">
                        <BadgeCheck className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-white/90 font-medium text-lg mb-3">
                    {getSpecialty()}
                  </p>

                  {/* Education Section - All three levels */}
                  <div className="space-y-1.5 mb-3 pr-4">
                    {mentor.usDentalSchool && (
                      <div className="flex items-start gap-1.5 text-sm text-white/90">
                        <GraduationCap className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span className="break-words">
                          {mentor.usDentalSchool}
                        </span>
                      </div>
                    )}
                    {mentor.mdsSpecialization && (
                      <div className="flex items-start gap-1.5 text-sm text-white/90">
                        <GraduationCap className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span className="break-words">
                          {mentor.mdsUniversity
                            ? `MDS ${mentor.mdsSpecialization} - ${mentor.mdsUniversity}`
                            : `MDS ${mentor.mdsSpecialization}`}
                        </span>
                      </div>
                    )}
                    {mentor.bdsUniversity && (
                      <div className="flex items-start gap-1.5 text-sm text-white/90">
                        <GraduationCap className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span className="break-words">
                          BDS - {mentor.bdsUniversity}
                        </span>
                      </div>
                    )}
                    {/* Legacy fields for backward compatibility */}
                    {(mentor.dentalSchool || mentor.school) &&
                      !mentor.usDentalSchool && (
                        <div className="flex items-start gap-1.5 text-sm text-white/90">
                          <GraduationCap className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span className="break-words">
                            {mentor.dentalSchool || mentor.school}
                          </span>
                        </div>
                      )}
                    {mentor.bachelorUniversity && !mentor.bdsUniversity && (
                      <div className="flex items-start gap-1.5 text-sm text-white/90">
                        <GraduationCap className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span className="break-words">
                          {mentor.bachelorUniversity}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-white/80">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{mentor.location}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
                  <div className="text-3xl font-bold text-white">
                    ${mentor.price}
                  </div>
                  <div className="text-xs text-white/70 uppercase tracking-wide">
                    per session
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Rating and Stats Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(mentor.rating)
                          ? "text-secondary fill-current"
                          : "text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-lg">{mentor.rating}</span>
                <span className="text-muted-foreground">
                  ({mentor.reviews} reviews)
                </span>
              </div>

              {mentor.responseTime && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Responds in {mentor.responseTime}</span>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {mentor.experience || mentor.years_experience || 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  Years Experience
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {mentor.sessionCount || mentor.sessions || 0}
                </div>
                <div className="text-xs text-muted-foreground">Sessions</div>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-secondary" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {getLanguages().length}
                </div>
                <div className="text-xs text-muted-foreground">Languages</div>
              </div>
            </div>

            <Separator />

            {/* Education Section - Detailed */}
            {(mentor.usDentalSchool ||
              mentor.mdsSpecialization ||
              mentor.bdsUniversity ||
              mentor.dentalSchool ||
              mentor.school ||
              mentor.bachelorUniversity) && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Education
                </h3>
                <div className="space-y-2">
                  {mentor.usDentalSchool && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GraduationCap className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{mentor.usDentalSchool}</span>
                    </div>
                  )}
                  {mentor.mdsSpecialization && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GraduationCap className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>
                        {mentor.mdsUniversity
                          ? `MDS ${mentor.mdsSpecialization} - ${mentor.mdsUniversity}`
                          : `MDS ${mentor.mdsSpecialization}`}
                      </span>
                    </div>
                  )}
                  {mentor.bdsUniversity && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GraduationCap className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>BDS - {mentor.bdsUniversity}</span>
                    </div>
                  )}
                  {/* Legacy fields for backward compatibility */}
                  {(mentor.dentalSchool || mentor.school) &&
                    !mentor.usDentalSchool && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <GraduationCap className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{mentor.dentalSchool || mentor.school}</span>
                      </div>
                    )}
                  {mentor.bachelorUniversity && !mentor.bdsUniversity && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GraduationCap className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{mentor.bachelorUniversity}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Separator />

            {/* About Section */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                About
              </h3>
              <p className="text-muted-foreground leading-relaxed break-words">
                {mentor.professionalBio || mentor.bio}
              </p>
            </div>

            {/* Services Section */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Services Offered
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {getServices().map((service) => (
                  <div
                    key={service}
                    className="flex items-center gap-2 text-sm text-muted-foreground p-2 rounded-lg bg-muted/30"
                  >
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="break-words">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Languages */}
            {getLanguages().length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {getLanguages().map((language) => (
                    <Badge
                      key={language}
                      variant="secondary"
                      className="bg-primary/10 text-primary border-0"
                    >
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Specialization Section */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Specialization
              </h3>
              <div className="flex flex-wrap gap-2">
                {mentor.speciality ? (
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-0"
                  >
                    {mentor.speciality}
                  </Badge>
                ) : getTags().length > 0 ? (
                  getTags().map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="border-primary/30 text-foreground"
                    >
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No specialization specified
                  </p>
                )}
              </div>
            </div>

            {/* Rating and Sessions - Bottom Section */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-primary" />
                <span className="font-semibold">{mentor.rating}</span>
                <span>({mentor.reviews} reviews)</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-primary" />
                <span>
                  {mentor.sessions || mentor.sessionCount || 0} sessions
                </span>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                size="lg"
                className="flex-1 h-12"
                onClick={handleBookSession}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Session
              </Button>
            </div>
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
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 gap-0 border-0 bg-black/95 backdrop-blur-sm [&>button]:hidden">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <DialogClose
              className="absolute right-4 top-4 z-50 rounded-full bg-white/10 backdrop-blur-sm p-2 opacity-70 hover:opacity-100 hover:bg-white/20 transition-all"
              onClick={() => setShowImageFullscreen(false)}
            >
              <X className="h-6 w-6 text-white" />
              <span className="sr-only">Close</span>
            </DialogClose>
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={mentor.avatar}
                alt={mentor.name}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
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
