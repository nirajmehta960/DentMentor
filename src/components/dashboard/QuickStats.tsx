import React from "react";
import {
  Calendar,
  DollarSign,
  Star,
  Users,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { cn } from "@/lib/utils";

export function QuickStats() {
  const { stats, isLoading } = useDashboardStats();

  const statsData = [
    {
      title: "Sessions This Month",
      value: stats?.sessionsThisMonth || 0,
      icon: Calendar,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-500/10 to-blue-600/5",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Monthly Earnings",
      value: `$${stats?.earningsThisMonth || 0}`,
      icon: DollarSign,
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-500/10 to-emerald-600/5",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Average Rating",
      value: stats?.averageRating ? stats.averageRating.toFixed(1) : "0.0",
      suffix: "⭐",
      icon: Star,
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-500/10 to-orange-500/5",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
      trend: "Excellent",
      trendUp: true,
    },
    {
      title: "Total Mentees",
      value: stats?.totalMentees || 0,
      icon: Users,
      gradient: "from-violet-500 to-purple-600",
      bgGradient: "from-violet-500/10 to-purple-600/5",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-600",
      trend: "+3",
      trendUp: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl bg-card border border-border p-6 animate-pulse"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-muted"></div>
              <div className="w-16 h-6 rounded-full bg-muted"></div>
            </div>
            <div className="space-y-2">
              <div className="h-8 w-24 bg-muted rounded"></div>
              <div className="h-4 w-32 bg-muted rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={cn(
              "group relative overflow-hidden rounded-xl sm:rounded-2xl bg-card border border-border/50 p-4 sm:p-5 md:p-6",
              "transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1"
            )}
          >
            {/* Background gradient */}
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                stat.bgGradient
              )}
            />

            {/* Decorative circle */}
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div
                  className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300",
                    stat.iconBg,
                    "group-hover:scale-110"
                  )}
                >
                  <Icon
                    className={cn("w-5 h-5 sm:w-6 sm:h-6", stat.iconColor)}
                  />
                </div>

                <div
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
                    stat.trendUp
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-red-500/10 text-red-600"
                  )}
                >
                  {stat.trendUp ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {stat.trend}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-bold text-foreground">
                    {stat.value}
                  </span>
                  {stat.suffix && (
                    <span className="text-lg sm:text-xl">{stat.suffix}</span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {stat.title}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
