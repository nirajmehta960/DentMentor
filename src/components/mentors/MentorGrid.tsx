import { useEffect, useRef } from 'react';
import { MentorCard } from './MentorCard';
import { LoadingSkeleton } from './LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { Mentor } from '@/hooks/use-mentor-search';
import { Loader2 } from 'lucide-react';

interface MentorGridProps {
  mentors: Mentor[];
  loading: boolean;
  viewMode: 'grid' | 'list';
  onLoadMore: () => void;
  hasMore: boolean;
}

export const MentorGrid = ({ mentors, loading, viewMode, onLoadMore, hasMore }: MentorGridProps) => {
  const { ref: gridRef, isVisible } = useScrollAnimation();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Auto-load more when scrolling near bottom
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  if (loading && mentors.length === 0) {
    return (
      <div className={`grid gap-6 items-stretch ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <LoadingSkeleton key={index} viewMode={viewMode} />
        ))}
      </div>
    );
  }

  if (!loading && mentors.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No mentors found</h3>
        <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
      </div>
    );
  }

  return (
    <div ref={gridRef} className="space-y-6">
      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {mentors.length} mentor{mentors.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Mentor Grid */}
      <div 
        className={`grid gap-6 items-stretch ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2' 
            : 'grid-cols-1'
        }`}
      >
        {mentors.map((mentor, index) => (
          <MentorCard
            key={mentor.id}
            mentor={mentor}
            viewMode={viewMode}
            index={index}
            isVisible={isVisible}
          />
        ))}
      </div>

      {/* Loading More */}
      {loading && mentors.length > 0 && (
        <div className="grid gap-6 mt-6 items-stretch grid-cols-1 md:grid-cols-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div 
              key={index}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <LoadingSkeleton viewMode={viewMode} />
            </div>
          ))}
        </div>
      )}

      {/* Load More Trigger */}
      <div ref={loadMoreRef} className="py-8">
        {hasMore && !loading && (
          <div className="text-center">
            <Button 
              onClick={onLoadMore}
              variant="outline" 
              size="lg"
              className="px-8"
            >
              Load More Mentors
            </Button>
          </div>
        )}
        
        {loading && mentors.length > 0 && (
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
            <span className="text-muted-foreground">Loading more mentors...</span>
          </div>
        )}
        
        {!hasMore && mentors.length > 0 && (
          <div className="text-center text-muted-foreground">
            <p>You've seen all available mentors</p>
          </div>
        )}
      </div>
    </div>
  );
};