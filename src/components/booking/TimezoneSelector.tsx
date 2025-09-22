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

interface TimezoneSelectorProps {
  selectedTimezone: string;
  onTimezoneChange: (timezone: string) => void;
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
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Time zone</label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border",
              "bg-card hover:bg-accent/50 transition-colors text-left",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            )}
          >
            <Globe className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-sm text-foreground truncate block">
                {selectedTimezoneInfo.label}
              </span>
            </div>
            {currentTime && (
              <span className="text-sm text-muted-foreground flex-shrink-0">
                ({currentTime})
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[380px] p-0 bg-popover border-border shadow-xl"
          align="start"
          sideOffset={4}
        >
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Time Zone
            </span>
          </div>

          {/* Timezone List */}
          <ScrollArea className="h-[300px]">
            <div className="p-2">
              {Object.entries(filteredTimezones).map(([region, zones]) => (
                <div key={region} className="mb-2">
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {region}
                  </div>
                  {zones.map((zone) => {
                    const time = getCurrentTimeInTimezone(zone.id);
                    const isSelected = zone.id === selectedTimezone;

                    return (
                      <button
                        key={zone.id}
                        onClick={() => handleSelect(zone.id)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
                          <span className={cn("truncate", !isSelected && "ml-6")}>
                            {zone.label}
                          </span>
                        </div>
                        <span
                          className={cn(
                            "text-sm flex-shrink-0 ml-2",
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
                <div className="text-center py-8 text-muted-foreground text-sm">
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
