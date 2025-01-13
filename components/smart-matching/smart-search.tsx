import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SmartSearchProps {
  onSearch: (filters: SearchFilters) => void;
}

interface SearchFilters {
  personalityTraits?: string[];
  availabilityNeeded?: {
    startTime: string;
    endTime: string;
    days: string[];
  };
  maxDistance?: number;
  lastMinute?: boolean;
  specializedCare?: string[];
}

export function SmartSearch({ onSearch }: SmartSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    maxDistance: 10,
    personalityTraits: [],
    availabilityNeeded: {
      startTime: '09:00',
      endTime: '17:00',
      days: []
    },
    specializedCare: [],
    lastMinute: false
  })

  const handleSearch = () => {
    // Only include fields that have values
    const searchQuery: SearchFilters = {};
    if (filters.maxDistance) searchQuery.maxDistance = filters.maxDistance;
    if (filters.personalityTraits?.length) searchQuery.personalityTraits = filters.personalityTraits;
    if (filters.specializedCare?.length) searchQuery.specializedCare = filters.specializedCare;
    if (filters.lastMinute) searchQuery.lastMinute = true;
    if (filters.availabilityNeeded?.days.length) searchQuery.availabilityNeeded = filters.availabilityNeeded;

    onSearch(searchQuery);
  }

  const updateFilters = (updates: Partial<SearchFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...updates
    }))
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div className="flex gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              Search Filters
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Smart Search Filters</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Maximum Distance (km)</Label>
                <Slider
                  value={[filters.maxDistance || 10]}
                  onValueChange={([value]: number[]) => updateFilters({ maxDistance: value })}
                  max={50}
                  step={1}
                />
                <span className="text-sm text-muted-foreground">{filters.maxDistance || 10} km</span>
              </div>

              <div className="space-y-2">
                <Label>Personality Traits</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Patient', 'Energetic', 'Creative', 'Organized'].map(trait => (
                    <Button
                      key={trait}
                      variant={filters.personalityTraits?.includes(trait) ? "default" : "outline"}
                      onClick={() => {
                        const traits = filters.personalityTraits?.includes(trait)
                          ? filters.personalityTraits.filter(t => t !== trait)
                          : [...(filters.personalityTraits || []), trait]
                        updateFilters({ personalityTraits: traits })
                      }}
                    >
                      {trait}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Availability</Label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    'Monday', 'Tuesday', 'Wednesday', 'Thursday',
                    'Friday', 'Saturday', 'Sunday'
                  ].map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Switch
                        checked={filters.availabilityNeeded?.days.includes(day) || false}
                        onCheckedChange={(checked) => {
                          const days = checked
                            ? [...(filters.availabilityNeeded?.days || []), day]
                            : filters.availabilityNeeded?.days.filter(d => d !== day) || [];
                          updateFilters({
                            availabilityNeeded: {
                              startTime: filters.availabilityNeeded?.startTime || '09:00',
                              endTime: filters.availabilityNeeded?.endTime || '17:00',
                              days
                            }
                          })
                        }}
                      />
                      <Label>{day}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Specialized Care</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Special Needs', 'Infant Care', 'Homework Help', 'Multilingual'].map(care => (
                    <Button
                      key={care}
                      variant={filters.specializedCare?.includes(care) ? "default" : "outline"}
                      onClick={() => {
                        const careTypes = filters.specializedCare?.includes(care)
                          ? filters.specializedCare.filter(t => t !== care)
                          : [...(filters.specializedCare || []), care]
                        updateFilters({ specializedCare: careTypes })
                      }}
                    >
                      {care}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={filters.lastMinute || false}
                  onCheckedChange={(checked) => updateFilters({ lastMinute: checked })}
                />
                <Label>Last Minute Availability</Label>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Button onClick={handleSearch}>Search</Button>
      </div>
    </div>
  )
} 