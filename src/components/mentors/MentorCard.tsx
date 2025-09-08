import { useState } from 'react';
import { Star, MapPin, Clock, DollarSign, CheckCircle, Calendar, MessageCircle, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuickPreviewModal } from './QuickPreviewModal';
import { Mentor } from '@/hooks/use-mentor-search';
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

  const availability = availabilityConfig[mentor.availability];

  const cardContent = (
    <div 
      className={`mentor-card group relative bg-white rounded-2xl border border-border overflow-hidden transition-all duration-500 cursor-pointer ${
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
      <div className="relative z-10 p-6">
        {viewMode === 'grid' ? (
          // Grid Layout
          <>
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="relative">
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-20 h-20 rounded-xl object-cover ring-2 ring-white shadow-md group-hover:ring-primary/20 transition-all duration-300"
                />
                {mentor.verified && (
                  <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
                
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
                <h3 className="font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                  {mentor.name}
                </h3>
                {mentor.professionalHeadline && (
                  <p className="text-muted-foreground text-sm mb-1 truncate">{mentor.professionalHeadline}</p>
                )}
                <div className="space-y-0.5 mb-1">
                  {mentor.dentalSchool || mentor.school ? (
                    <p className="text-primary font-medium text-xs truncate">🎓 {mentor.dentalSchool || mentor.school}</p>
                  ) : null}
                  {mentor.bachelorUniversity ? (
                    <p className="text-primary font-medium text-xs truncate">🎓 {mentor.bachelorUniversity}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{mentor.location}</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-foreground">${mentor.price}</div>
                <div className="text-xs text-muted-foreground">per session</div>
              </div>
            </div>

            {/* Rating & Stats */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
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
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{mentor.responseTime}</span>
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
              {mentor.bio}
            </p>

            {/* Tags → Specializations only */}
            <div className="flex flex-wrap gap-1 mb-4">
              {mentor.tags.slice(0, 3).map((tag, tagIndex) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-xs animate-fade-in"
                  style={{ animationDelay: `${(index * 100) + (tagIndex * 50)}ms` }}
                >
                  {tag}
                </Badge>
              ))}
              {mentor.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{mentor.tags.length - 3} more
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                className="flex-1 group/btn"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle booking logic
                }}
              >
                <Calendar className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                Book Session
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle message logic
                }}
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          // List Layout
          <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0">
              <img
                src={mentor.avatar}
                alt={mentor.name}
                className="w-24 h-24 rounded-xl object-cover ring-2 ring-white shadow-md"
              />
              {mentor.verified && (
                <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1">
                <div className={`w-4 h-4 rounded-full border-2 border-white ${availability.color}`} />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-xl text-foreground">{mentor.name}</h3>
                  {mentor.professionalHeadline && (
                    <p className="text-muted-foreground text-sm">{mentor.professionalHeadline}</p>
                  )}
                  <div className="space-y-0.5">
                    {mentor.dentalSchool || mentor.school ? (
                      <p className="text-primary text-sm">🎓 {mentor.dentalSchool || mentor.school}</p>
                    ) : null}
                    {mentor.bachelorUniversity ? (
                      <p className="text-primary text-sm">🎓 {mentor.bachelorUniversity}</p>
                    ) : null}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-foreground">${mentor.price}</div>
                  <div className="text-sm text-muted-foreground">per session</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-3">
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
                  <span className="ml-1 text-sm font-medium">{mentor.rating}</span>
                  <span className="text-sm text-muted-foreground">({mentor.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {mentor.location}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {mentor.responseTime}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{mentor.bio}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {mentor.tags.slice(0, 4).map((tag, tagIndex) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={(e) => e.stopPropagation()}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Session
                  </Button>
                  <Button variant="outline" onClick={(e) => e.stopPropagation()}>
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Hover Glow Effect */}
      <div className={`absolute inset-0 rounded-2xl border-2 border-primary/20 transition-all duration-300 pointer-events-none ${
        isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
      }`} />
    </div>
  );

  return (
    <>
      {cardContent}
      
      {/* Quick Preview Modal */}
      <QuickPreviewModal
        mentor={mentor}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />

      {/* Image viewer restricted to QuickPreviewModal */}
    </>
  );
};