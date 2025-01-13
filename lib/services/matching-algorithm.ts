import { prisma } from '@/lib/prisma';

interface MatchingWeights {
  distance: number;
  experience: number;
  rating: number;
  personality: number;
}

interface MatchingPreferences {
  maxDistance: number;
  personalityTraits: string[];
  availability: {
    flexible: boolean;
    immediate: boolean;
  };
  experience: number;
  specialNeeds: boolean;
}

export class MatchingAlgorithm {
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private calculatePersonalityMatch(desired: string[], actual: string[]): number {
    if (!desired.length || !actual.length) return 0;
    const matches = desired.filter(trait => actual.includes(trait));
    return matches.length / desired.length;
  }

  private normalizeScore(score: number, min: number, max: number): number {
    return (score - min) / (max - min);
  }

  async findMatches(
    userId: string,
    userLocation: { latitude: number; longitude: number },
    preferences: MatchingPreferences,
    weights: MatchingWeights
  ) {
    // Get all potential childminders
    const childminders = await prisma.user.findMany({
      where: {
        role: 'childminder',
        latitude: { not: null },
        longitude: { not: null },
        ...(preferences.specialNeeds && {
          personalityTraits: {
            path: '$.specialNeedsSupport',
            equals: true
          }
        }),
        ...(preferences.experience > 0 && {
          experience: {
            gte: preferences.experience
          }
        })
      },
      include: {
        childminderReviews: true
      }
    });

    // Calculate scores for each childminder
    const scoredChildminders = await Promise.all(
      childminders.map(async (childminder) => {
        // Distance score
        const distance = this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          childminder.latitude!,
          childminder.longitude!
        );
        const distanceScore = distance <= preferences.maxDistance
          ? this.normalizeScore(distance, 0, preferences.maxDistance)
          : 0;

        // Experience score
        const experienceYears = parseInt(childminder.experience || '0');
        const experienceScore = this.normalizeScore(
          experienceYears,
          0,
          Math.max(preferences.experience, 10)
        );

        // Rating score
        const averageRating = childminder.childminderReviews.reduce(
          (acc, review) => acc + review.rating,
          0
        ) / (childminder.childminderReviews.length || 1);
        const ratingScore = this.normalizeScore(averageRating, 0, 5);

        // Personality match score
        const personalityScore = this.calculatePersonalityMatch(
          preferences.personalityTraits,
          JSON.parse(childminder.personalityTraits?.toString() || '[]')
        );

        // Calculate weighted score
        const totalScore =
          distanceScore * weights.distance +
          experienceScore * weights.experience +
          ratingScore * weights.rating +
          personalityScore * weights.personality;

        return {
          childminder,
          scores: {
            total: totalScore,
            distance: distanceScore,
            experience: experienceScore,
            rating: ratingScore,
            personality: personalityScore
          },
          distance,
          averageRating
        };
      })
    );

    // Sort by total score and return top matches
    return scoredChildminders
      .filter(match => match.scores.total > 0)
      .sort((a, b) => b.scores.total - a.scores.total);
  }

  async findByAvailability(
    schedule: {
      startTime: Date;
      endTime: Date;
      recurring?: boolean;
    }
  ) {
    return await prisma.user.findMany({
      where: {
        role: 'childminder',
        availability: {
          path: '$',
          array_contains: {
            startTime: { lte: schedule.startTime },
            endTime: { gte: schedule.endTime },
            recurring: schedule.recurring
          }
        }
      },
      include: {
        childminderReviews: true
      }
    });
  }
} 