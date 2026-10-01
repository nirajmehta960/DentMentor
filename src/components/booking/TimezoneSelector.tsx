import React, { useState, useMemo } from 'react';
import { Globe, Search, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LABEL } from '@/components/mentors/mentor-display';

interface TimezoneSelectorProps {
  selectedTimezone: string;
  onTimezoneChange: (timezone: string) => void;
  showLabel?: boolean;
}

// Common timezones grouped by region
const timezoneGroups = {
  'US/CANADA': [
    { id: 'America/Los_Angeles', label: 'Pacific Time - US & Canada', abbr: 'PT' },
    { id: 'America/Denver', label: 'Mountain Time - US & Canada', abbr: 'MT' },
    { id: 'America/Chicago', label: 'Central Time - US & Canada', abbr: 'CT' },
    { id: 'America/New_York', label: 'Eastern Time - US & Canada', abbr: 'ET' },
    { id: 'America/Anchorage', label: 'Alaska Time', abbr: 'AKT' },
    { id: 'Pacific/Honolulu', label: 'Hawaii Time', abbr: 'HT' },
  ],
  'EUROPE': [
    { id: 'Europe/London', label: 'London, Edinburgh', abbr: 'GMT/BST' },
    { id: 'Europe/Paris', label: 'Paris, Berlin, Rome', abbr: 'CET' },
    { id: 'Europe/Athens', label: 'Athens, Helsinki, Istanbul', abbr: 'EET' },
    { id: 'Europe/Moscow', label: 'Moscow, St. Petersburg', abbr: 'MSK' },
  ],
  'ASIA': [
    { id: 'Asia/Dubai', label: 'Dubai, Abu Dhabi', abbr: 'GST' },
    { id: 'Asia/Kolkata', label: 'Mumbai, New Delhi, Kolkata', abbr: 'IST' },
    { id: 'Asia/Bangkok', label: 'Bangkok, Jakarta', abbr: 'ICT' },
    { id: 'Asia/Singapore', label: 'Singapore, Hong Kong', abbr: 'SGT' },
    { id: 'Asia/Tokyo', label: 'Tokyo, Seoul', abbr: 'JST' },
    { id: 'Asia/Shanghai', label: 'Beijing, Shanghai', abbr: 'CST' },
  ],
  'AUSTRALIA/PACIFIC': [
    { id: 'Australia/Perth', label: 'Perth', abbr: 'AWST' },
    { id: 'Australia/Sydney', label: 'Sydney, Melbourne', abbr: 'AEST' },
    { id: 'Pacific/Auckland', label: 'Auckland, Wellington', abbr: 'NZST' },
  ],
  'SOUTH AMERICA': [
    { id: 'America/Sao_Paulo', label: 'São Paulo, Rio de Janeiro', abbr: 'BRT' },
    { id: 'America/Buenos_Aires', label: 'Buenos Aires', abbr: 'ART' },
    { id: 'America/Lima', label: 'Lima, Bogota', abbr: 'PET' },
  ],
  'AFRICA': [
    { id: 'Africa/Cairo', label: 'Cairo', abbr: 'EET' },
    { id: 'Africa/Johannesburg', label: 'Johannesburg, Cape Town', abbr: 'SAST' },
    { id: 'Africa/Lagos', label: 'Lagos, Accra', abbr: 'WAT' },
  ],
};

const allTimezones = Object.entries(timezoneGroups).flatMap(([region, zones]) =>
  zones.map((zone) => ({ ...zone, region }))
);

const getCurrentTimeInTimezone = (timezone: string): string => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date());
  } catch {
    return '';
  }
};

export const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({
  selectedTimezone,
  onTimezoneChange,
  showLabel = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedTimezoneInfo = useMemo(() => {
    const found = allTimezones.find((tz) => tz.id === selectedTimezone);
    return found || { id: selectedTimezone, label: selectedTimezone, abbr: '' };
  }, [selectedTimezone]);

  const filteredTimezones = useMemo(() => {
    if (!searchQuery.trim()) return timezoneGroups;

    const query = searchQuery.toLowerCase();
    const filtered: Partial<typeof timezoneGroups> = {};

    Object.entries(timezoneGroups).forEach(([region, zones]) => {
      const matchingZones = zones.filter(
        (zone) =>
          zone.label.toLowerCase().includes(query) ||
          zone.id.toLowerCase().includes(query) ||
          zone.abbr.toLowerCase().includes(query)
      );
      if (matchingZones.length > 0) {
        filtered[region as keyof typeof timezoneGroups] = matchingZones;
      }
    });

    return filtered;
  }, [searchQuery]);

  const handleSelect = (timezone: string) => {
    onTimezoneChange(timezone);
    setIsOpen(false);
    setSearchQuery('');
  };

  const currentTime = getCurrentTimeInTimezone(selectedTimezone);

  return (
    <div className={showLabel ? "flex flex-col gap-2" : ""}>
      {showLabel && <label className={cn(LABEL, "text-muted-foreground")}>Time zone</label>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-11 w-full items-center gap-3 rounded-[10px] border border-input bg-background px-3.5 text-left",
              "transition-colors hover:bg-muted/60",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
          >
            <Globe className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate text-sm text-foreground">
              {selectedTimezoneInfo.label}
            </span>
            {currentTime && (
              <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                {currentTime}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          data-lenis-prevent=""
          className="w-[min(380px,calc(100vw-2rem))] overflow-hidden p-0"
          align="start"
          sideOffset={6}
        >
          {/* Search */}
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Search..."
                aria-label="Search time zones"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Timezone List */}
          <ScrollArea className="h-[300px]">
            <div className="p-2">
              {Object.entries(filteredTimezones).map(([region, zones]) => (
                <div key={region} className="mb-2">
                  <div className={cn(LABEL, "px-3 pb-1.5 pt-2 text-muted-foreground")}>
                    {region}
                  </div>
                  {zones.map((zone) => {
                    const time = getCurrentTimeInTimezone(zone.id);
                    const isSelected = zone.id === selectedTimezone;

                    return (
                      <button
                        type="button"
                        key={zone.id}
                        onClick={() => handleSelect(zone.id)}
                        aria-pressed={isSelected}
                        className={cn(
                          "flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-3 text-left text-sm transition-colors",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          {isSelected ? (
                            <Check className="size-4 shrink-0" aria-hidden="true" />
                          ) : (
                            <span className="size-4 shrink-0" aria-hidden="true" />
                          )}
                          <span className="truncate">{zone.label}</span>
                        </span>
                        <span
                          className={cn(
                            "shrink-0 text-sm tabular-nums",
                            isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                          )}
                        >
                          {time}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}

              {Object.keys(filteredTimezones).length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No timezones found
                </div>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};
