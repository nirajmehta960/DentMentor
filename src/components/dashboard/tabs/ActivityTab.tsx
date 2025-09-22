import React, { useState, useEffect } from 'react';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { startOfWeek, startOfMonth, subMonths, startOfToday } from 'date-fns';

export function ActivityTab() {
  const { mentorProfile } = useAuth();
  const [thisWeekSessions, setThisWeekSessions] = useState(0);
  const [thisMonthEarnings, setThisMonthEarnings] = useState(0);
  const [growthPercent, setGrowthPercent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mentorProfile?.id) {
      setIsLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const now = new Date();
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const monthStart = startOfMonth(now);
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        const lastMonthEnd = monthStart;

        // Fetch sessions this week
        const { data: thisWeekSessionsData, error: sessionsError } = await supabase
          .from('sessions')
          .select('id')
          .eq('mentor_id', mentorProfile.id)
          .eq('status', 'completed')
          .gte('session_date', weekStart.toISOString());

        if (sessionsError) throw sessionsError;
        setThisWeekSessions(thisWeekSessionsData?.length || 0);

        // Fetch earnings this month
        const { data: thisMonthTransactions, error: thisMonthError } = await supabase
          .from('transactions')
          .select('amount')
          .eq('mentor_id', mentorProfile.id)
          .eq('transaction_type', 'earning')
          .eq('status', 'completed')
          .gte('created_at', monthStart.toISOString());

        if (thisMonthError) throw thisMonthError;
        const thisMonthTotal = thisMonthTransactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
        setThisMonthEarnings(thisMonthTotal);

        // Fetch earnings last month for growth calculation
        const { data: lastMonthTransactions, error: lastMonthError } = await supabase
          .from('transactions')
          .select('amount')
          .eq('mentor_id', mentorProfile.id)
          .eq('transaction_type', 'earning')
          .eq('status', 'completed')
          .gte('created_at', lastMonthStart.toISOString())
          .lt('created_at', lastMonthEnd.toISOString());

        if (lastMonthError) throw lastMonthError;
        const lastMonthTotal = lastMonthTransactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
        
        // Calculate growth percentage
        if (lastMonthTotal > 0) {
          const growth = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
          setGrowthPercent(Math.round(growth));
        } else if (thisMonthTotal > 0) {
          setGrowthPercent(100);
        } else {
          setGrowthPercent(0);
        }
      } catch (error) {
        console.error('Error fetching activity stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [mentorProfile?.id]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Activity & Analytics</h2>
        <p className="text-muted-foreground mt-1">Track your mentoring activity and performance</p>
      </div>
      
      {/* Activity Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
            ) : (
              <>
                <div className="text-2xl font-bold">{thisWeekSessions}</div>
                <p className="text-xs text-muted-foreground">Sessions completed</p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-20 bg-muted rounded animate-pulse" />
            ) : (
              <>
                <div className="text-2xl font-bold">${thisMonthEarnings.toFixed(0)}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
            ) : (
              <>
                <div className={`text-2xl font-bold ${growthPercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {growthPercent >= 0 ? '+' : ''}{growthPercent}%
                </div>
                <p className="text-xs text-muted-foreground">vs last month</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity List */}
      <RecentActivity />
    </div>
  );
}
