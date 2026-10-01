import { useState, type ReactNode } from 'react';
import { BadgeCheck, ChevronDown, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { HAIRLINE, Panel, Reveal } from '@/components/site';
import { Filters } from '@/hooks/use-mentor-search';
import { cn } from '@/lib/utils';
import { LABEL } from './mentor-display';

interface FilterSidebarProps {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: any) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

const specialties = [
  'General Dentistry',
  'Orthodontics',
  'Oral Surgery',
  'Periodontics',
  'Endodontics',
  'Pediatric Dentistry',
  'Prosthodontics',
  'Oral Pathology'
];

const locations = [
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
  'Boston, MA',
  'San Francisco, CA',
  'Philadelphia, PA',
  'Detroit, MI',
  'Seattle, WA'
];

const languages = [
  'English',
  'Spanish',
  'Mandarin',
  'French',
  'Arabic',
  'Hindi',
  'Korean',
  'Portuguese'
];

/*
 * Rating, price and availability filters (and the rating, price and reviews
 * sorts) are not offered: `useMentors` fills them with invented values — a 4.5
 * rating for every unrated mentor, reviews at 30% of sessions, a $100 rate the
 * cards no longer show (they show the mentor's real service prices), and
 * "available" for everyone. Filtering on them would contradict the cards.
 * Restore them once `use-mentor-search` filters on real data.
 *
 * The "rating" sort value stays as the default order: with no real ratings it
 * keeps the directory's own order.
 */
const sortOptions = [
  { value: 'rating', label: 'Default order' },
  { value: 'experience', label: 'Most experience' }
];

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-');

function FilterSection({
  title,
  open,
  onToggle,
  panelId,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  panelId: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b px-5 last:border-b-0" style={{ borderColor: HAIRLINE }}>
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="group flex h-12 w-full items-center justify-between text-left"
        >
          <span className={cn(LABEL, 'text-muted-foreground group-hover:text-foreground')}>{title}</span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'size-4 text-muted-foreground transition-transform duration-200 ease-dm group-hover:text-foreground',
              open && 'rotate-180'
            )}
          />
        </button>
      </h3>
      {open ? (
        <div id={panelId} className="pb-5">
          {children}
        </div>
      ) : null}
    </section>
  );
}

function CheckRow({
  boxId,
  checked,
  onCheckedChange,
  children,
}: {
  boxId: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <li className="flex items-center gap-3">
      <Checkbox id={boxId} checked={checked} onCheckedChange={(value) => onCheckedChange(value as boolean)} />
      <label htmlFor={boxId} className="flex min-h-10 flex-1 cursor-pointer items-center gap-1.5 text-sm text-foreground">
        {children}
      </label>
    </li>
  );
}

/**
 * The directory's filters: a sticky hairline panel beside the results on large
 * screens, a left sheet below them. Both render the same body from the same
 * state; ids are prefixed per instance so each label points at its own box.
 */
export const FilterSidebar = ({
  filters,
  onFilterChange,
  sortBy,
  onSortChange,
  isVisible,
  onClose
}: FilterSidebarProps) => {
  const [expandedSections, setExpandedSections] = useState({
    sort: true,
    specialty: true,
    experience: true,
    languages: false,
    verified: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    const newSpecialties = checked
      ? [...filters.specialty, specialty]
      : filters.specialty.filter(s => s !== specialty);
    onFilterChange('specialty', newSpecialties);
  };

  const handleLocationChange = (location: string, checked: boolean) => {
    const newLocations = checked
      ? [...filters.location, location]
      : filters.location.filter(l => l !== location);
    onFilterChange('location', newLocations);
  };

  const handleLanguageChange = (language: string, checked: boolean) => {
    const newLanguages = checked
      ? [...filters.languages, language]
      : filters.languages.filter(l => l !== language);
    onFilterChange('languages', newLanguages);
  };

  const clearAllFilters = () => {
    onFilterChange('specialty', []);
    onFilterChange('location', []);
    onFilterChange('experience', [0, 20]);
    onFilterChange('rating', 0);
    onFilterChange('priceRange', [0, 300]);
    onFilterChange('availability', []);
    onFilterChange('languages', []);
    onFilterChange('verified', false);
  };

  const activeFiltersCount =
    filters.specialty.length +
    filters.location.length +
    filters.availability.length +
    filters.languages.length +
    (filters.rating > 0 ? 1 : 0) +
    (filters.verified ? 1 : 0);

  const renderBody = (idPrefix: string, closeButton?: () => void) => {
    const id = (name: string) => `${idPrefix}-${slug(name)}`;

    return (
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex min-h-16 items-center justify-between gap-3 border-b px-5 py-3" style={{ borderColor: HAIRLINE }}>
          <div className="flex items-center gap-2">
            <h2 className="text-[0.9375rem] font-semibold text-foreground">Filters</h2>
            {activeFiltersCount > 0 && (
              <span className="grid h-6 min-w-6 place-items-center rounded-full bg-[rgb(15_112_93/0.1)] px-1.5 text-xs font-semibold tabular-nums text-primary">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear all
              </Button>
            )}
            {closeButton ? (
              <button
                type="button"
                onClick={closeButton}
                aria-label="Close filters"
                className="grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Sort Section */}
        <FilterSection title="Sort by" open={expandedSections.sort} onToggle={() => toggleSection('sort')} panelId={id('section-sort')}>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-full" aria-label="Sort by">
              <SelectValue />
            </SelectTrigger>
            <SelectContent data-lenis-prevent="">
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterSection>

        {/* Specialty Filter */}
        <FilterSection title="Specialty" open={expandedSections.specialty} onToggle={() => toggleSection('specialty')} panelId={id('section-specialty')}>
          <ul className="flex flex-col">
            {specialties.map((specialty) => (
              <CheckRow
                key={specialty}
                boxId={id(`specialty-${specialty}`)}
                checked={filters.specialty.includes(specialty)}
                onCheckedChange={(checked) => handleSpecialtyChange(specialty, checked)}
              >
                {specialty}
              </CheckRow>
            ))}
          </ul>
        </FilterSection>

        {/* Experience Range */}
        <FilterSection title="Experience" open={expandedSections.experience} onToggle={() => toggleSection('experience')} panelId={id('section-experience')}>
          <div className="px-1 pt-2">
            <Slider
              value={filters.experience}
              onValueChange={(value) => onFilterChange('experience', value)}
              max={20}
              min={0}
              step={1}
              className="mb-3"
              aria-label="Years of experience"
            />
            <div className="flex justify-between text-xs tabular-nums text-muted-foreground">
              <span>{filters.experience[0]} years</span>
              <span>{filters.experience[1]} years</span>
            </div>
          </div>
        </FilterSection>

        {/* Verified Filter */}
        <div className="px-5 py-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id={id('verified')}
              className="mt-3"
              checked={filters.verified}
              onCheckedChange={(checked) => onFilterChange('verified', checked as boolean)}
            />
            <label htmlFor={id('verified')} className="flex min-h-10 flex-1 cursor-pointer flex-col justify-center gap-0.5 py-2">
              <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <BadgeCheck className="size-4 text-primary" aria-hidden="true" />
                Verified mentors only
              </span>
              <span className="text-xs leading-relaxed text-muted-foreground">
                Mentors who completed optional document verification.
              </span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Large screens: a sticky panel beside the results. The Reveal sits inside
          the sticky element — wrapping it would leave sticky no room to travel. */}
      <aside className="hidden w-64 shrink-0 lg:block" aria-label="Filters">
        <div className="sticky top-24">
          <Reveal>
            <Panel data-lenis-prevent="" className="max-h-[calc(100vh-7.5rem)] overflow-y-auto bg-white">
              {renderBody('filters-panel')}
            </Panel>
          </Reveal>
        </div>
      </aside>

      {/* Below lg: the same filters in a sheet. */}
      <Sheet open={isVisible} onOpenChange={(open) => { if (!open) onClose(); }}>
        <SheetContent
          side="left"
          data-lenis-prevent=""
          aria-describedby={undefined}
          className="w-[min(22rem,88vw)] overflow-y-auto p-0 lg:hidden [&>button:last-child]:hidden"
        >
          <SheetTitle className="sr-only">Filters</SheetTitle>
          {renderBody('filters-sheet', onClose)}
        </SheetContent>
      </Sheet>
    </>
  );
};
