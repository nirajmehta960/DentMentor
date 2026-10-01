import React, { useState, useEffect } from 'react';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { startOfWeek, startOfMonth, subMonths, startOfToday } from 'date-fns';
import { AppPageHeader } from '@/components/site';
import { StatTile, formatUsd } from '@/components/dashboard/dashboard-ui';

export function ActivityTab() {
  const { mentorProfile } = useAuth();
  const [thisWeekSessions, setThisWeekSessions] = useState(0);
  const [thisMonthEarnings, setThisMonthEarnings] = useState(0);
  // Kept so the comparison tile can say when there is nothing to compare with.
  const [lastMonthEarnings, setLastMonthEarnings] = useState(0);
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
        setLastMonthEarnings(lastMonthTotal);

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

  // A percentage only means something against a month that had earnings.
  const hasBaseline = lastMonthEarnings > 0;

  return (
    <div className="flex flex-col gap-6">
      <AppPageHeader
        eyebrow="Activity"
        title="Activity"
        description="Sessions, messages, feedback and payments, newest first."
      />

      {/* Activity Summary Tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          icon={Calendar}
          label="This week"
          value={thisWeekSessions}
          hint="Sessions completed"
          loading={isLoading}
        />
        <StatTile
          icon={DollarSign}
          label="Earnings"
          value={formatUsd(thisMonthEarnings)}
          hint="Completed earnings this month"
          loading={isLoading}
        />
        <StatTile
          icon={TrendingUp}
          label="Vs last month"
          value={hasBaseline ? `${growthPercent >= 0 ? '+' : ''}${growthPercent}%` : '—'}
          hint={hasBaseline ? `Last month: ${formatUsd(lastMonthEarnings)}` : 'No earnings last month to compare with'}
          loading={isLoading}
        />
      </div>

      {/* Recent Activity List */}
      <RecentActivity />
    </div>
  );
}
