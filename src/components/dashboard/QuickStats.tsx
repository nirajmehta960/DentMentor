import React from "react";
import { CalendarCheck, DollarSign, Star, Users } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { StatTile, formatUsd } from "./dashboard-ui";

/**
 * Four figures straight from `useDashboardStats` — no trend chips, because
 * nothing here is compared against an earlier period.
 */
export function QuickStats() {
  const { stats, isLoading } = useDashboardStats();

  const rating = stats?.averageRating || 0;

  const statsData = [
    {
      title: "Completed",
      value: stats?.sessionsThisMonth || 0,
      hint: "Sessions completed this month",
      icon: CalendarCheck,
    },
    {
      title: "Earnings",
      value: formatUsd(stats?.earningsThisMonth || 0),
      hint: "This month",
      icon: DollarSign,
    },
    {
      title: "Rating",
      value: rating > 0 ? rating.toFixed(1) : "—",
      hint: rating > 0 ? "Average from session feedback" : "No ratings yet",
      icon: Star,
    },
    {
      title: "Mentees",
      value: stats?.totalMentees || 0,
      hint: "Unique mentees across all bookings",
      icon: Users,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 xl:grid-cols-4">
      {statsData.map((stat) => (
        <StatTile
          key={stat.title}
          icon={stat.icon}
          label={stat.title}
          value={stat.value}
          hint={stat.hint}
          loading={isLoading}
        />
      ))}
    </div>
  );
}
