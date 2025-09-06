import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, DollarSign, Star, Users } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';

export function QuickStats() {
  const { stats, isLoading } = useDashboardStats();

  const statsData = [
    {
      title: 'Sessions This Month',
      value: stats?.sessionsThisMonth || 0,
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      title: 'Monthly Earnings',
      value: `$${stats?.earningsThisMonth || 0}`,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Average Rating',
      value: stats?.averageRating ? `${stats.averageRating.toFixed(1)} ⭐` : '0.0 ⭐',
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      title: 'Total Mentees',
      value: stats?.totalMentees || 0,
      icon: Users,
      color: 'text-purple-600'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}