import { useState } from "react";
import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";

import { Band, Frame, HAIRLINE, PageHero, SiteShell } from "@/components/site";
// Not on the kit's index yet; the same live, floored count the landing shows.
import { useLandingStats } from "@/components/site/use-landing-data";
import { SearchBar } from "@/components/mentors/SearchBar";
import { FilterSidebar } from "@/components/mentors/FilterSidebar";
import { MentorGrid } from "@/components/mentors/MentorGrid";
import { useMentorSearch } from "@/hooks/use-mentor-search";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Mentors = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const {
    mentors,
    loading,
    searchQuery,
    setSearchQuery,
    filters,
    updateFilter,
    sortBy,
    setSortBy,
    loadMoreMentors,
    hasMore,
    error,
  } = useMentorSearch();

  // Live count of verified mentors; null while loading, on error or below the
  // landing's floor — in which case the eyebrow names the page instead.
  const { verifiedMentors } = useLandingStats();

  if (error) {
    console.warn("Error loading mentors from database:", error);
  }

  const toolbar = (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        variant="outline"
        onClick={() => setShowFilters(!showFilters)}
        className="h-11 bg-white lg:hidden"
        aria-expanded={showFilters}
      >
        <SlidersHorizontal aria-hidden="true" />
        Filters
      </Button>

      <div
        role="group"
        aria-label="Layout"
        className="hidden items-center rounded-full border bg-white sm:flex"
        style={{ borderColor: HAIRLINE }}
      >
        {(
          [
            { mode: "grid", label: "Grid view", Icon: LayoutGrid },
            { mode: "list", label: "List view", Icon: List },
          ] as const
        ).map(({ mode, label, Icon }) => (
          <button
            key={mode}
            type="button"
            aria-label={label}
            aria-pressed={viewMode === mode}
            onClick={() => setViewMode(mode)}
            className={cn(
              "grid size-11 place-items-center rounded-full transition-colors duration-200",
              viewMode === mode
                ? "bg-[rgb(15_112_93/0.1)] text-band-signal"
                : "text-band-muted hover:text-band-fg"
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <SiteShell nav="overlay">
      {/* `overflow-visible` + `z-10`: the search suggestions hang below the band. */}
      <PageHero
        eyebrow={verifiedMentors !== null ? `${verifiedMentors} verified mentors` : "Mentor directory"}
        title={["Find a mentor who's", "walked your path."]}
        lead="Book 1:1 sessions with U.S. dental students and graduates — for SOP reviews, mock interviews, CV reviews and application strategy. Each mentor sets their own services and prices."
        className="z-10 overflow-visible"
      >
        <div className="mx-auto w-full max-w-[40rem]">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by specialty, location, or mentor name..."
          />
        </div>
      </PageHero>

      <Band id="directory" tone="tint" className="pb-24 pt-10 sm:pb-28 sm:pt-12 lg:pb-32 lg:pt-14">
        <Frame width="wide">
          <div className="flex gap-8 xl:gap-10">
            {/* Filter Sidebar */}
            <FilterSidebar
              filters={filters}
              onFilterChange={updateFilter}
              sortBy={sortBy}
              onSortChange={(value) =>
                setSortBy(value as "rating" | "price" | "experience" | "reviews")
              }
              isVisible={showFilters}
              onClose={() => setShowFilters(false)}
            />

            {/* Mentor Grid */}
            <div className="min-w-0 flex-1">
              <MentorGrid
                mentors={mentors}
                loading={loading}
                viewMode={viewMode}
                onLoadMore={loadMoreMentors}
                hasMore={hasMore}
                toolbar={toolbar}
              />
            </div>
          </div>
        </Frame>
      </Band>
    </SiteShell>
  );
};

export default Mentors;
