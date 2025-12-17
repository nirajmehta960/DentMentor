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
    console.warn("Error loading mentors from database:", error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 via-background to-background">
      {/* Fixed Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navigation />
      </div>

      {/* Hero Section with premium gradient */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-primary via-primary/95 to-accent relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent)/0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--secondary)/0.2),transparent_50%)]" />
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-primary-foreground max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-4 border border-white/20">
              {mentors.length > 0
                ? `${mentors.length}+ Verified Mentors Available`
                : "15+ Verified Mentors Available"}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Find Your Perfect Mentor
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
              Connect with verified U.S. dental professionals who understand
              your journey and are ready to guide you to success
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter Section - Sticky */}
      <section className="sticky top-20 z-40 py-6 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by specialty, location, or mentor name..."
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>

              <div className="hidden sm:flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
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
