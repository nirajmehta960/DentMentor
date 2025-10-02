import React from "react";
import { useMentors } from "@/hooks/useMentors";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Star,
  MapPin,
  ChevronRight,
  Sparkles,
  Heart,
  Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";

export function RecommendedMentors() {
  const { mentors, loading } = useMentors();

  // Get top 3 mentors (by rating or most recent)
  const recommendedMentors = mentors
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);

  if (loading) {
    return (
      <div className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg rounded-xl p-6">
        <div className="h-8 bg-muted/50 rounded animate-pulse mb-4" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-muted/50 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 sm:p-6 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Recommended Mentors</h3>
              <p className="text-sm text-muted-foreground">
                Based on your goals and preferences
              </p>
            </div>
          </div>
          <Link to="/mentors">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary/80"
            >
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
        {recommendedMentors.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No mentors available</p>
            <Link to="/mentors">
              <Button
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                Browse All Mentors
              </Button>
            </Link>
          </div>
        ) : (
          recommendedMentors.map((mentor) => (
            <div
              key={mentor.id}
              className="group relative p-4 rounded-xl border border-border/50 bg-background/50 hover:border-primary/30 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                    <AvatarImage src={mentor.avatar || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                      {(mentor.name.startsWith("Dr. ") ? mentor.name : `Dr. ${mentor.name}`)
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute -top-1 -right-1 p-1 rounded-full bg-background shadow-sm border border-border/50 hover:border-pink-500/50 transition-colors">
                    <Heart className={`h-3.5 w-3.5 text-muted-foreground`} />
                  </button>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {mentor.name.startsWith("Dr. ") ? mentor.name : `Dr. ${mentor.name}`}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {mentor.school}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 shrink-0">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-semibold">
                        {mentor.rating?.toFixed(1) || "N/A"}
                      </span>
                      {mentor.reviews && (
                        <span className="text-xs text-muted-foreground">
                          ({mentor.reviews})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {mentor.specialty && (
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary border-0 text-xs"
                      >
                        {mentor.specialty}
                      </Badge>
                    )}
                    {mentor.location && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {mentor.location}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-foreground">
                      ${mentor.price || 0}
                      <span className="text-sm font-normal text-muted-foreground">
                        /hr
                      </span>
                    </span>
                    <Link to={`/mentors?mentor=${mentor.id}`}>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                      >
                        <Calendar className="h-4 w-4 mr-1.5" />
                        Book Session
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
