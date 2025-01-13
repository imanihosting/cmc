import { prisma } from "@/lib/prisma"

interface MatchingPreferences {
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

interface MatchWeights {
  distance: number;
  experience: number;
  rating: number;
  personality: number;
}

const DEFAULT_WEIGHTS: MatchWeights = {
  distance: 0.3,
  experience: 0.2,
  rating: 0.2,
  personality: 0.3,
}

export class MatchingService {
  private calculateDistanceScore(distance: number, maxDistance: number): number {
    if (distance > maxDistance) return 0;
    return 1 - (distance / maxDistance);
  }

  private calculateExperienceScore(experience: number, minExperience: number): number {
    if (experience < minExperience) return 0;
    return Math.min(experience / 10, 1); // Cap at 10 years
  }

  private calculatePersonalityScore(
    childminderTraits: string[],
    preferredTraits: string[]
  ): number {
    if (!preferredTraits.length) return 1;
    const matches = preferredTraits.filter(trait => 
      childminderTraits.includes(trait)
    ).length;
    return matches / preferredTraits.length;
  }

  private calculateAvailabilityScore(
    childminderAvailability: any,
    preferredAvailability: any
  ): number {
    const requestedSlots = Object.entries(preferredAvailability)
      .filter(([_, wanted]) => wanted)
      .map(([slot]) => slot);

    if (!requestedSlots.length) return 1;

    const matches = requestedSlots.filter(slot => 
      childminderAvailability[slot]
    ).length;

    return matches / requestedSlots.length;
  }

  private async calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): Promise<number> {
    // Haversine formula for calculating distance between two points
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  async findMatches(
    preferences: MatchingPreferences,
    weights: MatchWeights = DEFAULT_WEIGHTS
  ) {
    // Get user's coordinates from location string
    // In a real app, use a geocoding service here
    const userCoords = { lat: 51.5074, lon: -0.1278 }; // Example: London coordinates

    // Find all potential matches
    const childminders = await prisma.user.findMany({
      where: {
        role: 'childminder',
        // Add any basic filtering criteria
        ...(preferences.specialNeeds && {
          specialNeedsExperience: true
        }),
      },
      select: {
        id: true,
        name: true,
        geolocation: true,
        personalityTraits: true,
        experience: true,
        averageRating: true,
        hourlyRate: true,
        availability: true,
        specialNeedsExperience: true,
      }
    });

    // Calculate scores and sort matches
    const scoredMatches = await Promise.all(
      childminders.map(async childminder => {
        const geolocation = JSON.parse(childminder.geolocation || '{"lat":0,"lon":0}');
        const distance = await this.calculateDistance(
          userCoords.lat,
          userCoords.lon,
          geolocation.lat,
          geolocation.lon
        );

        const distanceScore = this.calculateDistanceScore(distance, preferences.maxDistance);
        const experienceScore = this.calculateExperienceScore(
          parseInt(childminder.experience || '0'), 
          preferences.experience
        );
        const personalityScore = this.calculatePersonalityScore(
          JSON.parse(childminder.personalityTraits || '[]'),
          preferences.personalityTraits
        );
        const availabilityScore = this.calculateAvailabilityScore(
          JSON.parse(childminder.availability || '{}'),
          preferences.availability
        );

        const matchScore = 
          weights.distance * distanceScore +
          weights.experience * experienceScore +
          weights.rating * ((childminder.averageRating || 0) / 5) +
          weights.personality * personalityScore;

        return {
          ...childminder,
          distance,
          matchScore,
        };
      })
    );

    // Sort by match score and filter out non-matches
    return scoredMatches
      .filter(match => match.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  async getRecommendedChildminders(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        preferences: true,
      }
    });

    if (!user?.preferences) {
      throw new Error('User preferences not found');
    }

    const matchPreferences = JSON.parse(user.preferences);
    return this.findMatches(matchPreferences);
  }
} 