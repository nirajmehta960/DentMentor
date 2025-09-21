import { useState } from 'react';
import { Star, MapPin, DollarSign, CheckCircle, Calendar, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { QuickPreviewModal } from './QuickPreviewModal';
import { BookingModal } from '@/components/booking/BookingModal';
import { Mentor } from '@/hooks/useMentors';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';

interface MentorCardProps {
  mentor: Mentor;
  viewMode: 'grid' | 'list';
  index: number;
  isVisible: boolean;
}

const availabilityConfig = {
  available: { color: 'bg-green-500', label: 'Available', pulse: true },
  busy: { color: 'bg-yellow-500', label: 'In Session', pulse: false },
  offline: { color: 'bg-gray-400', label: 'Offline', pulse: false }
};

export const MentorCard = ({ mentor, viewMode, index, isVisible }: MentorCardProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  const availability = availabilityConfig[mentor.availability];

  const cardContent = (
    <div 
      className={`mentor-card group relative bg-white rounded-2xl border border-border overflow-hidden transition-all duration-500 cursor-pointer h-full ${
        isVisible ? 'animate-in' : 'opacity-0 translate-y-8'
      } ${isHovered ? 'shadow-xl scale-[1.02] -translate-y-1' : 'shadow-sm hover:shadow-lg'}`}
      style={{ 
        transitionDelay: `${index * 100}ms`,
        transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setShowPreview(true)}
    >
      {/* Gradient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Card Content */}
      <div className="relative z-10 p-6 h-full flex flex-col">
        {viewMode === 'grid' ? (
          // Grid Layout
          <>
            {/* Header */}
            <div className="flex items-start gap-4 md:gap-6 mb-4 md:mb-6">
              <div className="relative">
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-2 border-primary/20 shadow-lg group-hover:border-primary/40 group-hover:shadow-xl transition-all duration-300"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                
                {/* Availability Indicator */}
                <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
                  <div 
                    className={`w-4 h-4 rounded-full border-2 border-white ${availability.color} ${
                      availability.pulse ? 'animate-pulse' : ''
                    }`}
                  />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                {/* Name with verification tick */}
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-xl text-foreground truncate group-hover:text-primary transition-colors">
                    Dr. {mentor.name}
                  </h3>
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
                  <p className="text-muted-foreground text-base mb-2 truncate font-medium">{mentor.professionalHeadline}</p>
                )}
                <div className="space-y-1 mb-3 min-h-[4.5rem] flex flex-col justify-start">
                  {mentor.usDentalSchool && (
                    <p className="text-primary font-semibold text-sm truncate">🎓 {mentor.usDentalSchool}</p>
                  )}
                  {mentor.mdsSpecialization && (
                    <p className="text-primary font-semibold text-sm truncate">🎓 {mentor.mdsUniversity 
                      ? `MDS ${mentor.mdsSpecialization} - ${mentor.mdsUniversity}`
                      : `MDS ${mentor.mdsSpecialization}`
                    }</p>
                  )}
                  {mentor.bdsUniversity && (
                    <p className="text-primary font-semibold text-sm truncate">🎓 BDS - {mentor.bdsUniversity}</p>
                  )}
                  {/* Legacy fields for backward compatibility */}
                  {(mentor.dentalSchool || mentor.school) && !mentor.usDentalSchool && (
                    <p className="text-primary font-semibold text-sm truncate">🎓 {mentor.dentalSchool || mentor.school}</p>
                  )}
                  {mentor.bachelorUniversity && !mentor.bdsUniversity && (
                    <p className="text-primary font-semibold text-sm truncate">🎓 {mentor.bachelorUniversity}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{mentor.location}</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">${mentor.price}</div>
                <div className="text-sm text-muted-foreground">per session</div>
              </div>
            </div>

            {/* Middle Content - Flexible */}
            <div className="flex-grow">
              {/* Rating & Stats */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(mentor.rating)
                          ? 'text-secondary fill-current'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-base font-semibold">{mentor.rating}</span>
                <span className="text-sm text-muted-foreground">({mentor.reviews})</span>
              </div>

              {/* Bio */}
              <p className="text-base text-muted-foreground mb-5 line-clamp-3 leading-relaxed">
                {mentor.professionalBio || mentor.bio}
              </p>

              {/* Specialization */}
              <div className="flex flex-wrap gap-2 mb-6">
                {mentor.speciality && (
                  <Badge 
                    variant="secondary" 
                    className="text-sm px-3 py-1 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {mentor.speciality}
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button 
                size="default" 
                className="w-full bg-primary hover:bg-primary/90 text-white transition-all duration-200 hover:shadow-lg text-base py-3"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBooking(true);
                }}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Session
              </Button>
            </div>
          </>
        ) : (
          // List Layout
          <>
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-36 h-36 rounded-full object-cover border-2 border-primary/20 shadow-lg group-hover:border-primary/40 group-hover:shadow-xl transition-all duration-300"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                
                {/* Availability Indicator */}
                <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
                  <div 
                    className={`w-4 h-4 rounded-full border-2 border-white ${availability.color} ${
                      availability.pulse ? 'animate-pulse' : ''
                    }`}
                  />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                {/* Name with verification tick */}
                <div className="flex items-center gap-1 mb-1">
                  <h3 className="font-semibold text-xl text-foreground truncate group-hover:text-primary transition-colors">
                    Dr. {mentor.name}
                  </h3>
                  {mentor.verified && (
                    <Tooltip>
                      <TooltipTrigger>
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Verified Mentor</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                {mentor.professionalHeadline && (
                  <p className="text-muted-foreground text-sm mb-2 truncate">{mentor.professionalHeadline}</p>
                )}
                <div className="space-y-0.5 mb-2">
                  {mentor.dentalSchool || mentor.school ? (
                    <p className="text-primary font-medium text-sm truncate">🎓 {mentor.dentalSchool || mentor.school}</p>
                  ) : null}
                  {mentor.bachelorUniversity ? (
                    <p className="text-primary font-medium text-sm truncate">🎓 {mentor.bachelorUniversity}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{mentor.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground mb-1">${mentor.price}</div>
                <div className="text-sm text-muted-foreground mb-4">per session</div>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
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
                  <span className="text-sm font-medium">{mentor.rating}</span>
                  <span className="text-xs text-muted-foreground">({mentor.reviews})</span>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white transition-all duration-200 hover:shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowBooking(true);
                    }}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
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
                target.src = '/placeholder.svg';
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
