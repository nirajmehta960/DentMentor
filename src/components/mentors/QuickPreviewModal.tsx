import { Star, MapPin, Clock, CheckCircle, Calendar, MessageCircle, Languages, GraduationCap, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BookingModal } from '@/components/booking/BookingModal';
import { Mentor } from '@/hooks/useMentors';
import { useState } from 'react';

interface QuickPreviewModalProps {
  mentor: Mentor;
  isOpen: boolean;
  onClose: () => void;
}

const availabilityConfig = {
  available: { color: 'bg-green-500', label: 'Available Now', pulse: true },
  busy: { color: 'bg-yellow-500', label: 'In Session', pulse: false },
  offline: { color: 'bg-gray-400', label: 'Offline', pulse: false }
};

export const QuickPreviewModal = ({ mentor, isOpen, onClose }: QuickPreviewModalProps) => {
  const availability = availabilityConfig[mentor.availability];
  const [showPhoto, setShowPhoto] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-in-bottom">
          <DialogHeader className="relative" />

          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-6">
              <div className="relative">
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-32 h-32 rounded-full object-cover border-2 border-primary/20 shadow-lg cursor-pointer object-center hover:border-primary/40 hover:shadow-xl transition-all duration-300"
                  onClick={(e) => { e.stopPropagation(); setShowPhoto(true); }}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                
                {/* Availability Indicator */}
                <div className="absolute -bottom-2 -right-2 flex items-center gap-2 bg-white rounded-full px-2 py-1 shadow-md border">
                  <div className={`w-3 h-3 rounded-full ${availability.color} ${availability.pulse ? 'animate-pulse' : ''}`} />
                  <span className="text-xs font-medium text-foreground">{availability.label}</span>
                </div>
              </div>
              
              <div className="flex-1">
                {/* Name with verification tick */}
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-foreground">Dr. {mentor.name}</h2>
                  {mentor.verified && (
                    <Tooltip>
                      <TooltipTrigger>
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Verified Mentor</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                {mentor.professionalHeadline && (
                  <p className="text-muted-foreground mb-2 font-medium">{mentor.professionalHeadline}</p>
                )}
                {/* Education Section */}
                <div className="space-y-1.5 mt-3">
                  {mentor.usDentalSchool && (
                    <p className="text-sm text-primary font-semibold flex items-center gap-2">
                      <span>🎓</span>
                      {mentor.usDentalSchool}
                    </p>
                  )}
                  {mentor.mdsSpecialization && (
                    <p className="text-sm text-primary font-semibold flex items-center gap-2">
                      <span>🎓</span>
                      {mentor.mdsUniversity 
                        ? `MDS ${mentor.mdsSpecialization} - ${mentor.mdsUniversity}`
                        : `MDS ${mentor.mdsSpecialization}`
                      }
                    </p>
                  )}
                  {mentor.bdsUniversity && (
                    <p className="text-sm text-primary font-semibold flex items-center gap-2">
                      <span>🎓</span>
                      BDS - {mentor.bdsUniversity}
                    </p>
                  )}
                  {/* Legacy fields for backward compatibility */}
                  {(mentor.dentalSchool || mentor.school) && !mentor.usDentalSchool && (
                    <p className="text-sm text-primary font-semibold flex items-center gap-2">
                      <span>🎓</span>
                      {mentor.dentalSchool || mentor.school}
                    </p>
                  )}
                  {mentor.bachelorUniversity && !mentor.bdsUniversity && (
                    <p className="text-sm text-primary font-semibold flex items-center gap-2">
                      <span>🎓</span>
                      {mentor.bachelorUniversity}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{mentor.location}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(mentor.rating)
                              ? 'text-secondary fill-current'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold">{mentor.rating}</span>
                    <span className="text-muted-foreground">({mentor.reviews} reviews)</span>
                  </div>
                  
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-foreground">${mentor.price}</div>
                <div className="text-sm text-muted-foreground">per session</div>
              </div>
            </div>

            <Separator />

            {/* About Section */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                About
              </h3>
              <p className="text-muted-foreground leading-relaxed pl-6">{mentor.professionalBio || mentor.bio}</p>
            </div>

            <Separator />

            {/* Services Section */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Services
              </h3>
              <div className="pl-6">
                {mentor.mentorServices && mentor.mentorServices.length > 0 ? (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {mentor.mentorServices.map((service, index) => (
                      <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-primary flex-shrink-0">•</span>
                        <span className="truncate">{service.service_title}</span>
                      </div>
                    ))}
                  </div>
                ) : mentor.areasOfExpertise && mentor.areasOfExpertise.length > 0 ? (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {mentor.areasOfExpertise.map((area, index) => (
                      <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-primary flex-shrink-0">•</span>
                        <span className="truncate">{area}</span>
                      </div>
                    ))}
                  </div>
                ) : mentor.tags && mentor.tags.length > 0 ? (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {mentor.tags.map((tag, index) => (
                      <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-primary flex-shrink-0">•</span>
                        <span className="truncate">{tag}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No areas of expertise specified</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Specialization Section */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Specialization
              </h3>
              <div className="pl-6">
                {mentor.speciality ? (
                  <Badge variant="secondary" className="text-sm">
                    {mentor.speciality}
                  </Badge>
                ) : (
                  <p className="text-sm text-muted-foreground">No specialization specified</p>
                )}
              </div>
            </div>

            {/* Rating and Sessions */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-primary" />
                <span className="font-semibold">{mentor.rating}</span>
                <span>({mentor.reviews} reviews)</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-primary" />
                <span>{mentor.sessions || mentor.sessionCount || 0} sessions</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                size="lg" 
                className="w-full bg-primary hover:bg-primary/90 text-white transition-all duration-200 hover:shadow-md"
                onClick={() => {
                  setShowBooking(true);
                  onClose();
                }}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Session
              </Button>
            </div>
          </div>
        </DialogContent>

        {/* Full Image Modal - Clean Circular Image Only */}
        <Dialog open={showPhoto} onOpenChange={setShowPhoto}>
          <DialogContent className="max-w-[100vw] max-h-[100vh] p-0 bg-transparent border-none shadow-none">
            <div className="relative flex items-center justify-center w-screen h-screen bg-black/80">
              {/* Close button */}
              <button
                onClick={() => setShowPhoto(false)}
                className="absolute top-6 right-6 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Large circular profile image */}
              <img
                src={mentor.avatar}
                alt={mentor.name}
                className="w-[500px] h-[500px] object-cover rounded-full shadow-2xl"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </Dialog>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBooking}
        onClose={() => setShowBooking(false)}
        mentorId={mentor.id}
        mentorName={mentor.name}
        mentorAvatar={mentor.avatar}
      />
    </TooltipProvider>
  );
};
