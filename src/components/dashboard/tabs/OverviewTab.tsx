import React from 'react';
import { WelcomeBar } from '@/components/dashboard/WelcomeBar';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useUpcomingSessions } from '@/hooks/useUpcomingSessions';
import { useAvailability } from '@/hooks/useAvailability';
import { format, startOfMonth, endOfMonth, addDays, isWithinInterval } from 'date-fns';

interface OverviewTabProps {
  onNavigate: (tab: string) => void;
}

export function OverviewTab({ onNavigate }: OverviewTabProps) {
  const { upcomingSessions: sessions, isLoading } = useUpcomingSessions();
  const upcomingSessions = sessions?.slice(0, 3) || [];
  const { availability, isLoading: isLoadingAvailability } = useAvailability();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <WelcomeBar />
      
      {/* Quick Stats */}
      <QuickStats />
      
      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions Preview */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Upcoming Sessions
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('sessions')}>
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
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
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
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
                          {session.service?.title || session.mentee?.name || session.session_type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(session.session_date), 'MMM d, h:mm a')}
                        </p>
                        {session.service?.title && session.mentee?.name && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            with {session.mentee.name}
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
        
        {/* Availability Quick Access */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Your Availability
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('availability')}>
              Manage
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingAvailability ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !availability || availability.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto mb-3 text-primary/50" />
                <p className="text-muted-foreground mb-4">Set your available time slots</p>
                <Button variant="outline" size="sm" onClick={() => onNavigate('availability')}>
                  Configure Availability
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availability
                  .filter((item) => {
                    const itemDate = new Date(item.date + 'T00:00:00');
                    const now = new Date();
                    const thirtyDaysFromNow = addDays(now, 30);
                    return isWithinInterval(itemDate, {
                      start: now,
                      end: thirtyDaysFromNow,
                    });
                  })
                  .map((item) => {
                    const slots = Array.isArray(item.time_slots) ? item.time_slots : [];
                    const slotCount = slots.length;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {format(new Date(item.date + 'T00:00:00'), 'MMM d, yyyy')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {slotCount} {slotCount === 1 ? 'slot' : 'slots'} available
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                            {slotCount}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                {availability.filter((item) => {
                  const itemDate = new Date(item.date + 'T00:00:00');
                  const now = new Date();
                  const thirtyDaysFromNow = addDays(now, 30);
                  return isWithinInterval(itemDate, {
                    start: now,
                    end: thirtyDaysFromNow,
                  });
                }).length > 5 && (
                  <div className="text-center pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onNavigate('availability')}
                      className="text-xs"
                    >
                      View All Availability
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}
