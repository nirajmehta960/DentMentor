import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Edit, Trash2, Save, X } from 'lucide-react';
import { format } from 'date-fns';

interface SelectedSlot {
  id: string;
  date: Date;
  time: string;
  duration: number;
}

interface SlotsSummaryCardProps {
  selectedSlots: SelectedSlot[];
  onEditSlot: (id: string) => void;
  onDeleteSlot: (id: string) => void;
  onSaveAll: () => void;
  onClearAll: () => void;
}

export function SlotsSummaryCard({ 
  selectedSlots, 
  onEditSlot, 
  onDeleteSlot, 
  onSaveAll, 
  onClearAll 
}: SlotsSummaryCardProps) {
  if (selectedSlots.length === 0) {
    return null;
  }

  const uniqueDays = new Set(selectedSlots.map(slot => 
    format(slot.date, 'yyyy-MM-dd')
  )).size;

  const getDurationLabel = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    return `${minutes / 60}hr`;
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Selected Availability
          </div>
          <Badge variant="secondary">
            {selectedSlots.length} slots across {uniqueDays} days
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Slots List */}
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {selectedSlots.map((slot) => (
            <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="font-medium">
                    {format(slot.date, 'EEEE, MMM d')}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {slot.time} • {getDurationLabel(slot.duration)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onEditSlot(slot.id)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onDeleteSlot(slot.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={onSaveAll} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save All ({selectedSlots.length})
          </Button>
          <Button 
            variant="outline" 
            onClick={onClearAll}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}