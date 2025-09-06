import { useState } from 'react';
import { X, Filter, ChevronDown, ChevronUp, Star, DollarSign, Clock, Languages, MapPin, BookOpen, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Filters } from '@/hooks/use-mentor-search';

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

const availabilityOptions = [
  { value: 'available', label: 'Available', color: 'bg-green-500' },
  { value: 'busy', label: 'Busy', color: 'bg-yellow-500' },
  { value: 'offline', label: 'Offline', color: 'bg-gray-400' }
];

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
    rating: true,
    price: true,
    availability: false,
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

  const handleAvailabilityChange = (availability: string, checked: boolean) => {
    const newAvailability = checked
      ? [...filters.availability, availability]
      : filters.availability.filter(a => a !== availability);
    onFilterChange('availability', newAvailability);
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

  return (
    <>
      {/* Mobile Overlay */}
      {isVisible && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:sticky top-0 left-0 h-screen lg:h-auto w-80 bg-white border-r border-border z-50 lg:z-auto
        transform transition-transform duration-300 ease-out lg:transform-none
        ${isVisible ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Filters</h3>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 animate-bounce-in">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="text-xs"
                >
                  Clear All
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="lg:hidden"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Sort Section */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('sort')}
              className="flex items-center justify-between w-full text-left mb-3 group"
            >
              <span className="font-medium text-sm text-foreground">Sort By</span>
              {expandedSections.sort ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </button>
            
            {expandedSections.sort && (
              <div className="animate-accordion-down">
                <Select value={sortBy} onValueChange={onSortChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price">Lowest Price</SelectItem>
                    <SelectItem value="experience">Most Experience</SelectItem>
                    <SelectItem value="reviews">Most Reviews</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Separator />

          {/* Specialty Filter */}
          <div className="mb-6 mt-6">
            <button
              onClick={() => toggleSection('specialty')}
              className="flex items-center justify-between w-full text-left mb-3 group"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm text-foreground">Specialty</span>
              </div>
              {expandedSections.specialty ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </button>
            
            {expandedSections.specialty && (
              <div className="space-y-3 animate-accordion-down">
                {specialties.map((specialty, index) => (
                  <div key={specialty} className="flex items-center space-x-2 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <Checkbox
                      id={specialty}
                      checked={filters.specialty.includes(specialty)}
                      onCheckedChange={(checked) => handleSpecialtyChange(specialty, checked as boolean)}
                    />
                    <label htmlFor={specialty} className="text-sm text-foreground cursor-pointer">
                      {specialty}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Experience Range */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('experience')}
              className="flex items-center justify-between w-full text-left mb-3 group"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm text-foreground">Experience</span>
              </div>
              {expandedSections.experience ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </button>
            
            {expandedSections.experience && (
              <div className="animate-accordion-down">
                <div className="px-2">
                  <Slider
                    value={filters.experience}
                    onValueChange={(value) => onFilterChange('experience', value)}
                    max={20}
                    min={0}
                    step={1}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{filters.experience[0]} years</span>
                    <span>{filters.experience[1]} years</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rating Filter */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('rating')}
              className="flex items-center justify-between w-full text-left mb-3 group"
            >
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm text-foreground">Minimum Rating</span>
              </div>
              {expandedSections.rating ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </button>
            
            {expandedSections.rating && (
              <div className="space-y-2 animate-accordion-down">
                {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <Checkbox
                      id={`rating-${rating}`}
                      checked={filters.rating === rating}
                      onCheckedChange={(checked) => onFilterChange('rating', checked ? rating : 0)}
                    />
                    <label htmlFor={`rating-${rating}`} className="flex items-center text-sm text-foreground cursor-pointer">
                      <span className="mr-1">{rating}</span>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < rating ? 'text-secondary fill-current' : 'text-muted-foreground'}`}
                        />
                      ))}
                      <span className="ml-1 text-muted-foreground">& up</span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('price')}
              className="flex items-center justify-between w-full text-left mb-3 group"
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm text-foreground">Price Range</span>
              </div>
              {expandedSections.price ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </button>
            
            {expandedSections.price && (
              <div className="animate-accordion-down">
                <div className="px-2">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => onFilterChange('priceRange', value)}
                    max={300}
                    min={50}
                    step={10}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>${filters.priceRange[0]}</span>
                    <span>${filters.priceRange[1]}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Availability Filter */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('availability')}
              className="flex items-center justify-between w-full text-left mb-3 group"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm text-foreground">Availability</span>
              </div>
              {expandedSections.availability ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </button>
            
            {expandedSections.availability && (
              <div className="space-y-3 animate-accordion-down">
                {availabilityOptions.map((option, index) => (
                  <div key={option.value} className="flex items-center space-x-2 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <Checkbox
                      id={option.value}
                      checked={filters.availability.includes(option.value)}
                      onCheckedChange={(checked) => handleAvailabilityChange(option.value, checked as boolean)}
                    />
                    <label htmlFor={option.value} className="flex items-center text-sm text-foreground cursor-pointer">
                      <div className={`w-2 h-2 rounded-full ${option.color} mr-2`} />
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verified Filter */}
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={filters.verified}
                onCheckedChange={(checked) => onFilterChange('verified', checked as boolean)}
              />
              <label htmlFor="verified" className="flex items-center text-sm text-foreground cursor-pointer">
                <CheckCircle className="w-4 h-4 text-primary mr-2" />
                Verified Mentors Only
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};