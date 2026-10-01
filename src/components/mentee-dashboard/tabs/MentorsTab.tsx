import React from 'react';
import { RecommendedMentors } from '@/components/mentee-dashboard/RecommendedMentors';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppPageHeader } from '@/components/site';

export function MentorsTab() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8">
      <AppPageHeader
        eyebrow="Mentors"
        title="Find mentors"
        description="Mentors are U.S. dental students and graduates. Those who've submitted proof of admission or their degree carry a Verified badge."
        actions={
          <Button size="lg" onClick={() => navigate('/mentors')}>
            <Search className="size-4" strokeWidth={1.75} aria-hidden="true" />
            Browse all mentors
          </Button>
        }
      />
      <RecommendedMentors />
    </div>
  );
}
