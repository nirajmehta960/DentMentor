import { Star, MapPin, Clock, CheckCircle, Calendar, MessageCircle, Languages, GraduationCap, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Mentor } from '@/hooks/use-mentor-search';
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
                  className="w-28 h-28 rounded-2xl object-cover ring-4 ring-white shadow-lg cursor-pointer object-center"
                  onClick={(e) => { e.stopPropagation(); setShowPhoto(true); }}
                />
                
                {/* Availability Indicator */}
                <div className="absolute -bottom-2 -right-2 flex items-center gap-2 bg-white rounded-full px-2 py-1 shadow-md border">
                  <div className={`w-3 h-3 rounded-full ${availability.color} ${availability.pulse ? 'animate-pulse' : ''}`} />
                  <span className="text-xs font-medium text-foreground">{availability.label}</span>
                </div>
              </div>
              
              <div className="flex-1">
                {/* Name with verification tick */}
                <div className="flex items-center gap-1 mb-1">
                  <h2 className="text-2xl font-bold text-foreground">{mentor.name}</h2>
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
                  <p className="text-muted-foreground mb-1">{mentor.professionalHeadline}</p>
                )}
                <div className="space-y-0.5">
                  {mentor.dentalSchool || mentor.school ? (
                    <p className="text-primary font-medium">🎓 {mentor.dentalSchool || mentor.school}</p>
                  ) : null}
                  {mentor.bachelorUniversity ? (
                    <p className="text-primary font-medium">🎓 {mentor.bachelorUniversity}</p>
                  ) : null}
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
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>Responds in {mentor.responseTime}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-foreground">${mentor.price}</div>
                <div className="text-sm text-muted-foreground">per session</div>
              </div>
            </div>

            <Separator />

            {/* Bio */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">About</h3>
              <p className="text-muted-foreground leading-relaxed">{mentor.bio}</p>
            </div>

            {/* Specializations */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {mentor.tags.map((tag, index) => (
                  <Badge key={tag} variant="secondary" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="w-4 h-4 text-primary" />
                  <div className="text-xl font-bold text-primary">{mentor.sessions || 0}</div>
                </div>
                <div className="text-xs text-muted-foreground">Sessions</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="w-4 h-4 text-primary" />
                  <div className="text-xl font-bold text-primary">{mentor.rating}</div>
                </div>
                <div className="text-xs text-muted-foreground">Rating</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Award className="w-4 h-4 text-primary" />
                  <div className="text-xl font-bold text-primary">{mentor.reviews}</div>
                </div>
                <div className="text-xs text-muted-foreground">Reviews</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                size="lg" 
                className="flex-1 bg-primary hover:bg-primary/90 text-white transition-all duration-200 hover:shadow-md"
                onClick={() => {
                  // Handle booking
                  onClose();
                }}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Session
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="flex-1 border-primary/20 hover:bg-primary/5 transition-all duration-200"
                onClick={() => {
                  // Handle message
                  onClose();
                }}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>

        {/* Full Image Modal */}
        <Dialog open={showPhoto} onOpenChange={setShowPhoto}>
          <DialogContent className="max-w-[50vw] w-[50vw]">
            <DialogHeader>
              <h2 className="text-lg font-semibold">{mentor.name}</h2>
            </DialogHeader>
            <div className="flex justify-center">
              <img
                src={mentor.avatar}
                alt={mentor.name}
                className="max-w-full max-h-[50vh] object-cover rounded-lg"
                style={{ objectPosition: 'center top' }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </Dialog>
    </TooltipProvider>
  );
};
