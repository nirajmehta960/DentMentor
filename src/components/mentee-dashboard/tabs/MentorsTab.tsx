import React from 'react';
import { RecommendedMentors } from '@/components/mentee-dashboard/RecommendedMentors';
import { Button } from '@/components/ui/button';
import { Users, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MentorsTab() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Find Mentors</h1>
          <p className="text-muted-foreground">
            Discover experienced dental professionals to guide your career
          </p>
        </div>
        <Button onClick={() => navigate('/mentors')}>
          <Search className="w-4 h-4 mr-2" />
          Browse All Mentors
        </Button>
      </div>
      <div className="h-[calc(100vh-20rem)]">
        <RecommendedMentors />
      </div>
    </div>
  );
}
