import { useState } from "react";
import Navigation from "@/components/Navigation";
import { SearchBar } from "@/components/mentors/SearchBar";
import { FilterSidebar } from "@/components/mentors/FilterSidebar";
import { MentorGrid } from "@/components/mentors/MentorGrid";
import { useMentorSearch } from "@/hooks/use-mentor-search";
import { Button } from "@/components/ui/button";
import { Filter, Grid, List } from "lucide-react";

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

  if (error) {
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 pb-12 sm:pb-16 bg-gradient-to-br from-primary via-primary/95 to-accent">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="text-center text-white">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-4">
              Find Your Perfect Mentor
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto px-4">
              Connect with verified U.S. dental professionals who understand
              your journey
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-6 sm:py-8 bg-muted/30 border-b">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by specialty, location, or mentor name..."
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="text-xs sm:text-sm">Filters</span>
              </Button>

              <div className="flex items-center gap-1 sm:gap-2 border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <Grid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
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
          <div className="flex-1">
            <MentorGrid
              mentors={mentors}
              loading={loading}
              viewMode={viewMode}
              onLoadMore={loadMoreMentors}
              hasMore={hasMore}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mentors;
