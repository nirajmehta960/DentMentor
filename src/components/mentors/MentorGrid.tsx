import { useEffect, useRef, type ReactNode } from 'react';
import { Loader2, SearchX } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { HAIRLINE, Reveal } from '@/components/site';
import type { Mentor } from '@/hooks/useMentors';
import { cn } from '@/lib/utils';
import { LoadingSkeleton } from './LoadingSkeleton';
import { MentorCard } from './MentorCard';

interface MentorGridProps {
  mentors: Mentor[];
  loading: boolean;
  viewMode: 'grid' | 'list';
  onLoadMore: () => void;
  hasMore: boolean;
  /** Controls shown on the results row (filters, layout), in every state. */
  toolbar?: ReactNode;
}

/**
 * The directory's results. One `Reveal` on a wrapper that is always mounted —
 * cards arrive after load and change with every filter, so a per-card entrance
 * would replay on each keystroke.
 */
export const MentorGrid = ({ mentors, loading, viewMode, onLoadMore, hasMore, toolbar }: MentorGridProps) => {
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

  const gridClass = cn(
    'grid items-stretch gap-4 sm:gap-5',
    viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
  );

  let status: ReactNode = null;
  let body: ReactNode;

  if (loading && mentors.length === 0) {
    status = 'Loading mentors…';
    body = (
      <div className={gridClass} aria-hidden="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <LoadingSkeleton key={index} viewMode={viewMode} />
        ))}
      </div>
    );
  } else if (!loading && mentors.length === 0) {
    body = (
      <div
        className="flex flex-col items-center gap-4 rounded-xl border bg-white px-6 py-16 text-center"
        style={{ borderColor: HAIRLINE }}
      >
        <span
          className="grid size-[52px] place-items-center rounded-tile border-[1.5px] bg-white"
          style={{ borderColor: HAIRLINE }}
        >
          <SearchX className="size-6 text-band-signal" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1.5">
          <h3 className="font-display text-xl font-semibold tracking-[-0.01em] text-band-fg">No mentors found</h3>
          <p className="max-w-sm text-sm leading-relaxed text-band-muted">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      </div>
    );
  } else {
    status = (
      <>
        Showing <span className="font-semibold text-band-fg">{mentors.length}</span> mentor
        {mentors.length !== 1 ? 's' : ''}
      </>
    );
    body = (
      <>
        {/* Mentor Grid */}
        <ul className={gridClass}>
          {mentors.map((mentor, index) => (
            <li key={mentor.id} className="min-w-0">
              <MentorCard mentor={mentor} viewMode={viewMode} index={index} isVisible />
            </li>
          ))}
        </ul>

        {/* Loading More */}
        {loading && mentors.length > 0 && (
          <div className={cn(gridClass, 'mt-1')} aria-hidden="true">
            {Array.from({ length: 3 }).map((_, index) => (
              <LoadingSkeleton key={index} viewMode={viewMode} />
            ))}
          </div>
        )}

        {/* Load More Trigger */}
        <div ref={loadMoreRef} className="py-6">
          {hasMore && !loading && (
            <div className="text-center">
              <Button onClick={onLoadMore} variant="outline" size="lg" className="px-8">
                Load more mentors
              </Button>
            </div>
          )}

          {loading && mentors.length > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-band-muted">
              <Loader2 className="size-5 animate-spin text-band-signal" aria-hidden="true" />
              <span>Loading more mentors…</span>
            </div>
          )}

          {!hasMore && mentors.length > 0 && (
            <p className="text-center text-sm text-band-faint">You've seen all available mentors</p>
          )}
        </div>
      </>
    );
  }

  return (
    <Reveal className="flex flex-col gap-5">
      <div className="flex min-h-11 items-center justify-between gap-3">
        <p className="text-sm text-band-muted" data-numeric="" aria-live="polite">
          {status}
        </p>
        {toolbar}
      </div>
      {body}
    </Reveal>
  );
};
