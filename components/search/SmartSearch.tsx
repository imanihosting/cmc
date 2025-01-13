'use client'

import React, { useState } from 'react'
import { Search, Sliders, MapPin } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SearchFilters {
  location: string;
  maxDistance: number;
  personalityTraits: string[];
  availability: {
    morning?: boolean;
    afternoon?: boolean;
    evening?: boolean;
    weekend?: boolean;
  };
  experience: number;
  specialNeeds: boolean;
}

interface SmartSearchProps {
  onSearch: (filters: SearchFilters) => void;
  className?: string;
}

export function SmartSearch({ onSearch, className = '' }: SmartSearchProps) {
  const [location, setLocation] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    maxDistance: 10,
    personalityTraits: [] as string[],
    availability: {},
    experience: 0,
    specialNeeds: false
  })

  const handleSearch = () => {
    onSearch({
      ...filters,
      location
    })
  }

  const updateFilters = (updates: Partial<SearchFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...updates
    }))
  }

  return (
    <div className={`w-full max-w-3xl mx-auto space-y-4 ${className}`}>
      <div className="flex gap-3 p-2 bg-white/5 backdrop-blur-sm rounded-lg border border-border">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Enter your location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-10 h-11 bg-background text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(true)}
              className="h-11 px-4 flex items-center gap-2"
            >
              <Sliders className="h-4 w-4" />
              <span className="text-foreground">Filters</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Advanced Search Filters</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Maximum Distance (km)</Label>
                <Slider
                  value={[filters.maxDistance]}
                  onValueChange={([value]: number[]) => updateFilters({ maxDistance: value })}
                  max={50}
                  step={1}
                />
                <span className="text-sm text-muted-foreground">{filters.maxDistance} km</span>
              </div>

              <div className="space-y-2">
                <Label>Personality Traits</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Patient', 'Energetic', 'Creative', 'Organized'].map(trait => (
                    <Button
                      key={trait}
                      variant={filters.personalityTraits.includes(trait) ? "default" : "outline"}
                      onClick={() => {
                        const traits = filters.personalityTraits.includes(trait)
                          ? filters.personalityTraits.filter((t: string) => t !== trait)
                          : [...filters.personalityTraits, trait]
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
                    ['morning', 'Morning'],
                    ['afternoon', 'Afternoon'],
                    ['evening', 'Evening'],
                    ['weekend', 'Weekend']
                  ].map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Switch
                        checked={filters.availability[key as keyof typeof filters.availability] || false}
                        onCheckedChange={(checked) => 
                          updateFilters({
                            availability: {
                              ...filters.availability,
                              [key]: checked
                            }
                          })
                        }
                      />
                      <Label>{label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Minimum Years of Experience</Label>
                <Slider
                  value={[filters.experience]}
                  onValueChange={([value]: number[]) => updateFilters({ experience: value })}
                  max={20}
                  step={1}
                />
                <span className="text-sm text-muted-foreground">{filters.experience} years</span>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={filters.specialNeeds}
                  onCheckedChange={(checked) => updateFilters({ specialNeeds: checked })}
                />
                <Label>Special Needs Experience</Label>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Button onClick={handleSearch} className="h-11 px-6 flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span className="font-medium">Search</span>
        </Button>
      </div>
    </div>
  )
} 