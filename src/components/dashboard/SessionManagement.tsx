import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MessageCircle, Check, X } from 'lucide-react';
import { useUpcomingSessions } from '@/hooks/useUpcomingSessions';
import { useSessionRequests } from '@/hooks/useSessionRequests';
import { formatDate, formatTime } from '@/lib/utils';

export function SessionManagement() {
  const { upcomingSessions, isLoading: sessionsLoading } = useUpcomingSessions();
  const { sessionRequests, acceptRequest, declineRequest, isLoading: requestsLoading } = useSessionRequests();

  if (sessionsLoading || requestsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Session Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Session Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingSessions?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="requests">
              Requests ({sessionRequests?.length || 0})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="space-y-4 mt-4">
            {upcomingSessions?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming sessions scheduled</p>
              </div>
            ) : (
              upcomingSessions?.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {formatDate(session.session_date)}
                      </Badge>
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(session.session_date)}
                      </Badge>
                    </div>
                    <p className="font-medium">{session.session_type}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.duration_minutes} minutes
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="requests" className="space-y-4 mt-4">
            {sessionRequests?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pending session requests</p>
              </div>
            ) : (
              sessionRequests?.map((request) => (
                <div key={request.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="outline">
                        {formatDate(request.requested_date)}
                      </Badge>
                      <Badge variant="secondary" className="ml-2">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(request.requested_date)}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                      Pending
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="font-medium">{request.session_type}</p>
                    <p className="text-sm text-muted-foreground">
                      Duration: {request.duration_minutes} minutes
                    </p>
                    {request.message && (
                      <p className="text-sm text-muted-foreground mt-2">
                        "{request.message}"
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => acceptRequest(request.id)}
                      className="flex-1"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Accept
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => declineRequest(request.id)}
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}