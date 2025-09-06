import { useState, useRef, useEffect } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const popularSearches = [
  'Orthodontics',
  'NBDE Prep',
  'Residency Applications',
  'Board Preparation',
  'Clinical Skills',
  'Oral Surgery'
];

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
    <div ref={inputRef} className="relative">
      <div 
        className={`relative transition-all duration-300 ease-in-out transform ${
          isFocused ? 'scale-[1.02] shadow-lg' : 'shadow-sm'
        }`}
      >
        <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
          isFocused ? 'text-primary' : 'text-muted-foreground'
        } w-5 h-5`} />
        
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder || "Search mentors..."}
          className={`pl-12 pr-12 h-14 text-lg bg-white border-2 transition-all duration-300 ${
            isFocused 
              ? 'border-primary focus:border-primary ring-4 ring-primary/10' 
              : 'border-border hover:border-primary/50'
          }`}
        />
        
        {value && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        {/* Expanding focus ring animation */}
        <div 
          className={`absolute inset-0 rounded-lg border-2 border-primary transition-all duration-300 ${
            isFocused ? 'scale-105 opacity-20' : 'scale-100 opacity-0'
          } pointer-events-none`}
        />
      </div>

      {/* Popular Searches Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-border z-50 overflow-hidden animate-slide-in-top">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Popular Searches</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search, index) => (
                <Badge
                  key={search}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-white transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => handleSuggestionClick(search)}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};