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
  coordinates?: {
    latitude: number;
    longitude: number;
  } | null;
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

    // Use coordinates from request if available, otherwise use parent's stored coordinates
    const searchCoordinates = query.coordinates || {
      latitude: parent.latitude ? Number(parent.latitude) : null,
      longitude: parent.longitude ? Number(parent.longitude) : null
    };
    
    console.log('Search coordinates:', searchCoordinates);

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
        let preferences;
        
        try {
          preferences = parent.matchPreferences ? 
            (typeof parent.matchPreferences === 'string' ? 
              JSON.parse(parent.matchPreferences) : 
              parent.matchPreferences) : null;
        } catch (e) {
          console.error('Error parsing match preferences:', e);
          preferences = null;
        }

        // Default weights if preferences are not set or invalid
        const weights = preferences?.weights || {
          distance: 0.3,
          experience: 0.2,
          rating: 0.2,
          personality: 0.3
        };

        // Distance score - only if maxDistance is specified and coordinates exist
        const distance = calculateDistance(
          searchCoordinates.latitude,
          searchCoordinates.longitude,
          childminder.latitude ? Number(childminder.latitude) : null,
          childminder.longitude ? Number(childminder.longitude) : null
        );
        if (query.maxDistance && distance !== Infinity) {
          score += (1 - distance / query.maxDistance) * weights.distance;
        }

        // Experience score
        if (childminder.experience) {
          const yearsExp = childminder.experience.length / 100; // Simple proxy for experience
          score += Math.min(yearsExp / 10, 1) * weights.experience;
        }

        // Rating score
        if (childminder.childminderReviews.length > 0) {
          const avgRating = childminder.childminderReviews.reduce((acc: number, rev) => acc + rev.rating, 0) / childminder.childminderReviews.length;
          score += (avgRating / 5) * weights.rating;
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
              score += (matchingTraits / query.personalityTraits.length) * weights.personality;
            }
          } catch (e) {
            console.error('Error parsing personality traits:', e);
          }
        }

        // Specialized care match
        if (query.specializedCare?.length && childminder.specializedCare) {
          try {
            const childminderCare = Array.isArray(childminder.specializedCare) 
              ? childminder.specializedCare 
              : JSON.parse(childminder.specializedCare as string);
            
            const matchingCare = query.specializedCare.filter(care => 
              childminderCare.includes(care)
            ).length;
            
            if (matchingCare > 0) {
              score += (matchingCare / query.specializedCare.length) * 0.2; // 20% weight for specialized care
            }
          } catch (e) {
            console.error('Error parsing specialized care:', e);
          }
        }

        // Last minute availability match
        if (query.lastMinute && childminder.lastMinuteAvailability) {
          score += 0.1; // 10% boost for last minute availability match
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
          personalityTraits: childminder.personalityTraits ? 
            (Array.isArray(childminder.personalityTraits) ? 
              childminder.personalityTraits : 
              JSON.parse(childminder.personalityTraits as string)
            ) : [],
          specializedCare: childminder.specializedCare ?
            (Array.isArray(childminder.specializedCare) ?
              childminder.specializedCare :
              JSON.parse(childminder.specializedCare as string)
            ) : [],
          score,
          distance: distance === Infinity ? null : distance
        };
      })
      .filter((cm): cm is NonNullable<typeof cm> => cm !== null)
      .sort((a, b) => b.score - a.score);

    console.log('Scored childminders:', scoredChildminders.length);
    
    // Map the response to ensure proper JSON serialization
    const response = scoredChildminders.map(cm => ({
      ...cm,
      hourlyRate: cm.hourlyRate ? Number(cm.hourlyRate) : null,
      distance: cm.distance ? Number(cm.distance) : null
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in smart matching:', error);
    return NextResponse.json({ error: 'Failed to perform smart matching' }, { status: 500 });
  }
} 