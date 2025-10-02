import React from 'react';
import { MenteeWelcomeBar } from '@/components/mentee-dashboard/MenteeWelcomeBar';
import { MenteeQuickStats } from '@/components/mentee-dashboard/MenteeQuickStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight, Star, MapPin, Sparkles } from 'lucide-react';
import { useMenteeUpcomingSessions } from '@/hooks/useMenteeUpcomingSessions';
import { useMentors } from '@/hooks/useMentors';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface OverviewTabProps {
  onNavigate: (tab: string) => void;
}

export function OverviewTab({ onNavigate }: OverviewTabProps) {
  const { upcomingSessions: sessions, isLoading } = useMenteeUpcomingSessions();
  const upcomingSessions = sessions?.slice(0, 3) || [];
  const { mentors, loading: mentorsLoading } = useMentors();
  
  // Get top 3 recommended mentors
  const recommendedMentors = mentors
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <MenteeWelcomeBar />
      
      {/* Quick Stats */}
      <MenteeQuickStats />
      
      {/* Quick Access Cards - Fixed heights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions Preview */}
        <Card className="border-border/50 flex flex-col h-[500px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 flex-shrink-0">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Upcoming Sessions
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('sessions')}>
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : upcomingSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming sessions</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => onNavigate('mentors')}
                >
                  Find a Mentor
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div 
                    key={session.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {session.service?.title ||
                            session.session_type ||
                            "Mentorship Session"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(session.session_date), 'MMM d, h:mm a')}
                        </p>
                        {session.service?.title && session.mentor?.name && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            with {session.mentor.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {session.duration_minutes} min
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Recommended Mentors Preview */}
        <Card className="border-border/50 flex flex-col h-[500px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 flex-shrink-0">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Recommended Mentors
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('mentors')}>
              Browse All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {mentorsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recommendedMentors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No mentors available</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => onNavigate('mentors')}
                >
                  Browse All Mentors
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendedMentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    className="p-3 rounded-lg border border-border/50 bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/20 shrink-0">
                        <AvatarImage src={mentor.avatar || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-xs">
                          {(mentor.name.startsWith("Dr. ") ? mentor.name : `Dr. ${mentor.name}`)
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-semibold text-sm text-foreground truncate">
                              {mentor.name.startsWith("Dr. ") ? mentor.name : `Dr. ${mentor.name}`}
                            </h4>
                            <p className="text-xs text-muted-foreground truncate">
                              {mentor.school}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500 shrink-0">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="text-xs font-semibold">
                              {mentor.rating?.toFixed(1) || "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {mentor.specialty && (
                            <Badge
                              variant="secondary"
                              className="bg-primary/10 text-primary border-0 text-xs px-1.5 py-0"
                            >
                              {mentor.specialty}
                            </Badge>
                          )}
                          {mentor.location && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{mentor.location}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold text-foreground">
                            ${mentor.price || 0}
                            <span className="text-xs font-normal text-muted-foreground">
                              /hr
                            </span>
                          </span>
                          <Link to={`/mentors?mentor=${mentor.id}`}>
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
