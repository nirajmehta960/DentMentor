import { Star, MapPin, Clock, CheckCircle, Calendar, MessageCircle, Languages, GraduationCap, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
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
              {mentor.verified && (
                <div className="absolute -top-2 -right-2 bg-primary rounded-full p-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              )}
              
              {/* Availability Indicator */}
              <div className="absolute -bottom-2 -right-2 flex items-center gap-2 bg-white rounded-full px-2 py-1 shadow-md border">
                <div className={`w-3 h-3 rounded-full ${availability.color} ${availability.pulse ? 'animate-pulse' : ''}`} />
                <span className="text-xs font-medium text-foreground">{availability.label}</span>
              </div>
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-1">{mentor.name}</h2>
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

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">{mentor.experience}</div>
              <div className="text-sm text-muted-foreground">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">{mentor.sessionCount}</div>
              <div className="text-sm text-muted-foreground">Sessions Completed</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Languages className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">{mentor.languages.length}</div>
              <div className="text-sm text-muted-foreground">Languages</div>
            </div>
          </div>

          <Separator />

          {/* Bio */}
          <div>
            <h3 className="font-semibold text-lg mb-3">About</h3>
            <p className="text-muted-foreground leading-relaxed">{mentor.bio}</p>
          </div>

          {/* Languages */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {mentor.languages.map((language) => (
                <Badge key={language} variant="secondary">
                  {language}
                </Badge>
              ))}
            </div>
          </div>

          {/* Specializations */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {mentor.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-4">
            <Button size="lg" className="flex-1">
              <Calendar className="w-5 h-5 mr-2" />
              Book Session
            </Button>
            <Button variant="outline" size="lg">
              <MessageCircle className="w-5 h-5 mr-2" />
              Send Message
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Face-focused half-size photo viewer */}
      {showPhoto && (
        <Dialog open={showPhoto} onOpenChange={setShowPhoto}>
          <DialogContent className="max-w-[50vw] w-[50vw] p-0 bg-transparent border-none shadow-none">
            <DialogHeader className="hidden" />
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={mentor.avatar}
                alt={`${mentor.name} profile photo`}
                className="w-full h-auto object-cover rounded-2xl"
                style={{ objectPosition: 'center top' }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};