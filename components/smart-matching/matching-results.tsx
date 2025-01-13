'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star } from 'lucide-react'

interface MatchingResultsProps {
  matches: ChildminderMatch[];
  onViewProfile: (childminderId: string) => void;
  onContact: (childminderId: string) => void;
}

interface ChildminderMatch {
  id: string;
  name: string;
  rating: number;
  experience: number;
  distance: number;
  matchScore: number;
  personalityTraits: string[];
  availability: {
    morning?: boolean;
    afternoon?: boolean;
    evening?: boolean;
    weekend?: boolean;
  };
  specialNeeds: boolean;
  hourlyRate: number;
}

export function MatchingResults({ matches, onViewProfile, onContact }: MatchingResultsProps) {
  const formatAvailability = (availability: ChildminderMatch['availability']) => {
    return Object.entries(availability)
      .filter(([_, available]) => available)
      .map(([time]) => time.charAt(0).toUpperCase() + time.slice(1))
      .join(', ')
  }

  return (
    <div className="space-y-4">
      {matches.map(match => (
        <Card key={match.id} className="relative">
          <div className="absolute top-4 right-4 flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{match.rating.toFixed(1)}</span>
          </div>
          <CardHeader>
            <CardTitle className="text-xl">{match.name}</CardTitle>
            <CardDescription>
              {match.experience} years experience • {match.distance.toFixed(1)} km away
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {match.personalityTraits.map(trait => (
                  <Badge key={trait} variant="secondary">{trait}</Badge>
                ))}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Available: {formatAvailability(match.availability)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Rate: £{match.hourlyRate}/hour
                </p>
                {match.specialNeeds && (
                  <Badge variant="outline">Special Needs Experience</Badge>
                )}
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Match Score:</span>
                  <Badge variant="default">{(match.matchScore * 100).toFixed(0)}%</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => onViewProfile(match.id)}>
                    View Profile
                  </Button>
                  <Button onClick={() => onContact(match.id)}>
                    Contact
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 