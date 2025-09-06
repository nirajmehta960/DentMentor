import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Activity, 
  MessageCircle, 
  Calendar, 
  Star, 
  DollarSign, 
  Reply, 
  Eye, 
  Filter,
  Check,
  X
} from 'lucide-react';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { formatDistanceToNow } from 'date-fns';

export function RecentActivity() {
  const { activities, isLoading } = useRecentActivity();
  const [filter, setFilter] = useState<string>('all');

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'session_completed':
        return Calendar;
      case 'new_message':
        return MessageCircle;
      case 'new_feedback':
        return Star;
      case 'payment_received':
        return DollarSign;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'session_completed':
        return 'text-green-600';
      case 'new_message':
        return 'text-blue-600';
      case 'new_feedback':
        return 'text-yellow-600';
      case 'payment_received':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredActivities = activities?.filter(activity => 
    filter === 'all' || activity.type === filter
  );

  const getQuickActionButton = (activity: any) => {
    switch (activity.type) {
      case 'new_message':
        return (
          <Button variant="ghost" size="sm">
            <Reply className="w-3 h-3 mr-1" />
            Reply
          </Button>
        );
      case 'session_completed':
        return (
          <Button variant="ghost" size="sm">
            <Eye className="w-3 h-3 mr-1" />
            View Details
          </Button>
        );
      case 'new_feedback':
        return (
          <Button variant="ghost" size="sm">
            <Reply className="w-3 h-3 mr-1" />
            Respond
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardTitle>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {['all', 'session_completed', 'new_message', 'new_feedback', 'payment_received'].map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterType)}
            >
              {filterType === 'all' ? 'All' : 
               filterType === 'session_completed' ? 'Sessions' :
               filterType === 'new_message' ? 'Messages' :
               filterType === 'new_feedback' ? 'Feedback' :
               'Payments'}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredActivities?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No activities found</p>
            </div>
          ) : (
            filteredActivities?.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              const iconColor = getActivityColor(activity.type);
              
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full bg-muted ${iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {activity.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Check className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      {activity.metadata?.mentee_name && (
                        <div className="flex items-center gap-2">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={activity.metadata.mentee_avatar} />
                            <AvatarFallback className="text-xs">
                              {activity.metadata.mentee_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {activity.metadata.mentee_name}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        {getQuickActionButton(activity)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}