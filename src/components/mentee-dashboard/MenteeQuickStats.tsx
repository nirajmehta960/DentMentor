import React from "react";
import { useMenteeDashboardStats } from "@/hooks/useMenteeDashboardStats";
import { Calendar, Clock, Users, BookOpen } from "lucide-react";
import { StatTile, StatTileSkeleton } from "./parts";

/**
 * Four figures straight from `useMenteeDashboardStats`. No trend arrows: the
 * hook returns no earlier period to compare against.
 */
export function MenteeQuickStats() {
  const { stats, isLoading } = useMenteeDashboardStats();

  if (isLoading) {
    return (
      <div role="status" aria-label="Loading your figures" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatTileSkeleton key={i} />
        ))}
      </div>
    );
  }

  const statsData = [
    {
      label: "Sessions completed",
      value: stats?.sessionsCompleted?.toString() || "0",
      hint: "This month",
      icon: Calendar,
    },
    {
      label: "Upcoming sessions",
      value: stats?.upcomingSessions?.toString() || "0",
      hint: "Scheduled",
      icon: Clock,
    },
    {
      label: "Mentors connected",
      value: stats?.mentorsConnected?.toString() || "0",
      hint: "Across your bookings",
      icon: Users,
    },
    {
      label: "Hours of mentorship",
      value: stats?.hoursOfMentorship?.toString() || "0",
      hint: "Completed sessions",
      icon: BookOpen,
    },
  ];

  return (
    <section aria-label="Your figures">
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {statsData.map((stat) => (
          <li key={stat.label} className="min-w-0">
            <StatTile icon={stat.icon} label={stat.label} value={stat.value} hint={stat.hint} />
          </li>
        ))}
      </ul>
    </section>
  );
}
