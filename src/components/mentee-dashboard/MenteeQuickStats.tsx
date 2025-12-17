import React from "react";
import { useMenteeDashboardStats } from "@/hooks/useMenteeDashboardStats";
import { Calendar, Clock, Users, BookOpen, TrendingUp } from "lucide-react";

export function MenteeQuickStats() {
  const { stats, isLoading } = useMenteeDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const statsData = [
    {
      label: "Sessions Completed",
      value: stats?.sessionsCompleted?.toString() || "0",
      change: "This month",
      trend: stats && stats.sessionsCompleted > 0 ? "up" : "neutral",
      icon: Calendar,
      gradient: "from-primary/20 to-primary/5",
      iconColor: "text-primary",
    },
    {
      label: "Upcoming Sessions",
      value: stats?.upcomingSessions?.toString() || "0",
      change: "Scheduled",
      trend: "neutral",
      icon: Clock,
      gradient: "from-blue-500/20 to-blue-500/5",
      iconColor: "text-blue-500",
    },
    {
      label: "Mentors Connected",
      value: stats?.mentorsConnected?.toString() || "0",
      change: "Active connections",
      trend: stats && stats.mentorsConnected > 0 ? "up" : "neutral",
      icon: Users,
      gradient: "from-purple-500/20 to-purple-500/5",
      iconColor: "text-purple-500",
    },
    {
      label: "Hours of Mentorship",
      value: stats?.hoursOfMentorship?.toString() || "0",
      change: "Total hours",
      trend: stats && stats.hoursOfMentorship > 0 ? "up" : "neutral",
      icon: BookOpen,
      gradient: "from-emerald-500/20 to-emerald-500/5",
      iconColor: "text-emerald-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {statsData.map((stat, index) => (
        <div
          key={stat.label}
          className="relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 group rounded-xl"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Background gradient */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50 group-hover:opacity-70 transition-opacity`}
          />

          <div className="relative p-4 sm:p-5 lg:p-6">
            <div className="flex items-start justify-between mb-4">
              <div
                className={`p-2 sm:p-3 rounded-xl bg-background/80 shadow-sm ${stat.iconColor}`}
              >
                <stat.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              {stat.trend === "up" && (
                <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium bg-emerald-500/10 px-2 py-1 rounded-full">
                  <TrendingUp className="h-3 w-3" />
                  <span>Up</span>
                </div>
              )}
            </div>

            <div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                {stat.label}
              </p>
              <p className="text-xs text-muted-foreground/80">{stat.change}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
