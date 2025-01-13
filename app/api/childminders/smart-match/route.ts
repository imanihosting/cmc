import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { Prisma, User, Review } from '@prisma/client';

type ExtendedUser = User & {
  childminderReviews: Review[];
  matchPreferences: Prisma.JsonValue | null;
  latitude: Prisma.Decimal | null;
  longitude: Prisma.Decimal | null;
  personalityTraits: Prisma.JsonValue | null;
  lastMinuteAvailability: boolean;
};

interface SmartMatchQuery {
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

function calculateDistance(lat1: number | Prisma.Decimal | null, lon1: number | Prisma.Decimal | null, lat2: number | Prisma.Decimal | null, lon2: number | Prisma.Decimal | null): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  
  const R = 6371; // Earth's radius in km
  const lat1Num = Number(lat1);
  const lon1Num = Number(lon1);
  const lat2Num = Number(lat2);
  const lon2Num = Number(lon2);
  
  const dLat = (lat2Num - lat1Num) * Math.PI / 180;
  const dLon = (lon2Num - lon1Num) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1Num * Math.PI / 180) * Math.cos(lat2Num * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get parent with all fields
    const parent = await prisma.user.findUnique({
      where: { clerkId: session.userId }
    }) as ExtendedUser;

    if (!parent || parent.role !== 'parent') {
      return NextResponse.json({ error: 'Only parents can use smart matching' }, { status: 403 });
    }

    const query: SmartMatchQuery = await request.json();
    console.log('Search query:', query);
    console.log('Parent coordinates:', { lat: parent.latitude, lon: parent.longitude }); // Debug parent coordinates

    // Base query for childminders
    const childminders = await prisma.user.findMany({
      where: {
        role: 'childminder',
        gardaVetted: true,
        tuslaRegistered: true
      },
      include: {
        childminderReviews: true
      }
    }) as ExtendedUser[];

    console.log('Found childminders:', childminders.length);
    
    // Debug first childminder's coordinates
    if (childminders.length > 0) {
      console.log('First childminder coordinates:', {
        lat: childminders[0].latitude,
        lon: childminders[0].longitude
      });
    }

    // Calculate scores and filter based on criteria
    const scoredChildminders = childminders
      .map(childminder => {
        let score = 0;
        const preferences = parent.matchPreferences ? 
          JSON.parse(parent.matchPreferences as string) : {
            weights: {
              distance: 0.3,
              experience: 0.2,
              rating: 0.2,
              personality: 0.3
            }
          };

        // Distance score - only if maxDistance is specified and coordinates exist
        const distance = calculateDistance(parent.latitude, parent.longitude, childminder.latitude, childminder.longitude);
        if (query.maxDistance) {
          // Only apply distance filtering if both parent and childminder have coordinates
          if (parent.latitude && parent.longitude && childminder.latitude && childminder.longitude) {
            if (distance > query.maxDistance) {
              return null; // Filter out if too far
            }
            score += (1 - distance / query.maxDistance) * preferences.weights.distance;
          }
          // If coordinates are missing, don't filter out but don't add distance score
        }

        // Experience score
        if (childminder.experience) {
          const yearsExp = childminder.experience.length / 100; // Simple proxy for experience
          score += Math.min(yearsExp / 10, 1) * preferences.weights.experience;
        }

        // Rating score
        if (childminder.childminderReviews.length > 0) {
          const avgRating = childminder.childminderReviews.reduce((acc: number, rev) => acc + rev.rating, 0) / childminder.childminderReviews.length;
          score += (avgRating / 5) * preferences.weights.rating;
        }

        // Personality match score - only if personalityTraits are specified
        if (query.personalityTraits?.length && childminder.personalityTraits) {
          try {
            const childminderTraits = Array.isArray(childminder.personalityTraits) 
              ? childminder.personalityTraits 
              : JSON.parse(childminder.personalityTraits as string);
            
            const matchingTraits = query.personalityTraits.filter(trait => 
              childminderTraits.includes(trait)
            ).length;
            
            if (matchingTraits > 0) {
              score += (matchingTraits / query.personalityTraits.length) * preferences.weights.personality;
            }
          } catch (e) {
            console.error('Error parsing personality traits:', e);
          }
        }

        // If no specific criteria were provided or no scores were added, give a base score
        if (score === 0) {
          score = 0.5; // Base score for all childminders
        }

        return {
          id: childminder.id,
          name: childminder.name,
          profilePicture: childminder.profilePicture,
          hourlyRate: childminder.hourlyRate,
          experience: childminder.experience,
          qualifications: childminder.qualifications,
          personalityTraits: childminder.personalityTraits,
          score,
          distance: distance === Infinity ? null : distance
        };
      })
      .filter((cm): cm is NonNullable<typeof cm> => cm !== null)
      .sort((a, b) => b.score - a.score);

    console.log('Scored childminders:', scoredChildminders.length); // Debug log
    return NextResponse.json(scoredChildminders);
  } catch (error) {
    console.error('Error in smart matching:', error);
    return NextResponse.json({ error: 'Failed to perform smart matching' }, { status: 500 });
  }
} 