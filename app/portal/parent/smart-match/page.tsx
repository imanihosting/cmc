'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from 'react-hot-toast'

interface Childminder {
  id: number;
  name: string;
  profilePicture: string | null;
  hourlyRate: number;
  experience: string | null;
  qualifications: string | null;
  personalityTraits: string[];
  score: number;
  distance: number | null;
}

const personalityTraits = [
  'Energetic',
  'Calm',
  'Creative',
  'Structured',
  'Patient',
  'Playful',
  'Nurturing',
  'Educational'
];

const specializedCare = [
  'Special Needs',
  'Infant Care',
  'Homework Help',
  'Multilingual',
  'Arts & Crafts',
  'Music',
  'Sports',
  'Educational Activities'
];

export default function SmartMatchPage() {
  const { user } = useUser()
  const [maxDistance, setMaxDistance] = useState(10)
  const [selectedTraits, setSelectedTraits] = useState<string[]>([])
  const [selectedCare, setSelectedCare] = useState<string[]>([])
  const [lastMinute, setLastMinute] = useState(false)
  const [childminders, setChildminders] = useState<Childminder[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/childminders/smart-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxDistance,
          personalityTraits: selectedTraits,
          specializedCare: selectedCare,
          lastMinute
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch matches')
      }

      const data = await response.json()
      setChildminders(data)
    } catch (error) {
      console.error('Error fetching matches:', error)
      toast.error('Failed to find matches')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTrait = (trait: string) => {
    setSelectedTraits(prev =>
      prev.includes(trait)
        ? prev.filter(t => t !== trait)
        : [...prev, trait]
    )
  }

  const toggleCare = (care: string) => {
    setSelectedCare(prev =>
      prev.includes(care)
        ? prev.filter(c => c !== care)
        : [...prev, care]
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Smart Matching</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Filters */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Search Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Maximum Distance ({maxDistance}km)</Label>
                <Slider
                  value={[maxDistance]}
                  onValueChange={([value]) => setMaxDistance(value)}
                  min={1}
                  max={50}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Personality Traits</Label>
                <div className="flex flex-wrap gap-2">
                  {personalityTraits.map(trait => (
                    <Badge
                      key={trait}
                      variant={selectedTraits.includes(trait) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleTrait(trait)}
                    >
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Specialized Care</Label>
                <div className="flex flex-wrap gap-2">
                  {specializedCare.map(care => (
                    <Badge
                      key={care}
                      variant={selectedCare.includes(care) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleCare(care)}
                    >
                      {care}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="lastMinute"
                  checked={lastMinute}
                  onCheckedChange={setLastMinute}
                />
                <Label htmlFor="lastMinute">Last Minute Availability</Label>
              </div>

              <Button 
                className="w-full" 
                onClick={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? 'Searching...' : 'Find Matches'}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            {childminders.map(childminder => (
              <motion.div
                key={childminder.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={childminder.profilePicture || ''} alt={childminder.name} />
                          <AvatarFallback>{childminder.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{childminder.name}</h3>
                          <p className="text-sm text-gray-500">
                            {childminder.distance !== null && (
                              <span>{childminder.distance.toFixed(1)}km away • </span>
                            )}
                            €{childminder.hourlyRate}/hour
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">
                          {(childminder.score * 100).toFixed(0)}% Match
                        </div>
                        <Button size="sm" className="mt-2">View Profile</Button>
                      </div>
                    </div>
                    
                    {childminder.personalityTraits?.length > 0 && (
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-2">
                          {childminder.personalityTraits.map(trait => (
                            <Badge key={trait} variant="secondary">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {childminder.experience && (
                      <p className="mt-4 text-sm text-gray-600">
                        {childminder.experience}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {childminders.length === 0 && !isLoading && (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No matches found. Try adjusting your filters.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 