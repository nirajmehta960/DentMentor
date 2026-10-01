import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { HAIRLINE } from '@/components/site';
import { cn } from '@/lib/utils';
import { LABEL } from './mentor-display';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const popularSearches = [
  'India',
  'Nepal',
  'Boston University Henry M. Goldman School of Dental Medicine',
  'Oral Surgery',
  'Orthodontics',
  'General Dentistry',
  'Endodontics',
  'Periodontics',
  'Pediatric Dentistry',
  'Prosthodontics',
  'Oral Pathology',
  'NYU',
  'Manipal College',
  'MDS',
  'BDS',
  'DDS',
  'DMD'
];

/**
 * The directory's search, sized for the ink opening band: a white pill field
 * on deep teal, with suggestions on a white panel below it. Colours are the app
 * tokens (they match the paper band), so the field reads the same anywhere.
 */
export const SearchBar = ({ value, onChange, placeholder }: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div ref={inputRef} className="relative w-full text-left">
      <div className="relative">
        <Search
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 transition-colors duration-200',
            isFocused ? 'text-primary' : 'text-muted-foreground'
          )}
        />

        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-label="Search mentors"
          placeholder={placeholder || "Search mentors..."}
          className="h-14 rounded-full border-transparent bg-white pl-[3.25rem] pr-14 text-base text-foreground shadow-[0_18px_48px_-24px_rgb(0_0_0/0.55)] placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-[rgb(105_211_190)] focus-visible:ring-offset-0 md:text-base"
        />

        {value && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute right-1.5 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Suggestions */}
      {showSuggestions && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border bg-white p-4 text-foreground shadow-large sm:p-5"
          style={{ borderColor: HAIRLINE }}
        >
          <p className={cn(LABEL, 'mb-3 text-muted-foreground')}>Try searching</p>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((search) => (
              <button
                key={search}
                type="button"
                onClick={() => handleSuggestionClick(search)}
                className="min-h-11 max-w-full truncate rounded-full border border-border bg-white px-3.5 text-[0.8125rem] text-foreground transition-colors hover:border-primary hover:text-primary sm:min-h-9"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
