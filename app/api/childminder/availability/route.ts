import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { addDays } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const lastMinute = searchParams.get('lastMinute') === 'true';
    const spotlight = searchParams.get('spotlight') === 'true';
    const latitude = parseFloat(searchParams.get('latitude') || '0');
    const longitude = parseFloat(searchParams.get('longitude') || '0');
    const maxDistance = parseInt(searchParams.get('maxDistance') || '10');

    // Build where clause
    const where: any = {
      role: 'childminder',
      gardaVetted: true,
      tuslaRegistered: true
    };

    if (lastMinute) {
      where.lastMinuteAvailability = true;
      where.emergencyBookings = true;
    }

    if (spotlight) {
      where.spotlightUntil = {
        gte: new Date()
      };
    }

    // Get available childminders
    const childminders = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        profilePicture: true,
        hourlyRate: true,
        experience: true,
        qualifications: true,
        averageRating: true,
        latitude: true,
        longitude: true,
        availabilityRadius: true,
        languagesSpoken: true,
        specializedCare: true,
        lastMinuteAvailability: true,
        emergencyBookings: true
      }
    });

    // Filter by distance if coordinates provided
    const filteredChildminders = latitude && longitude 
      ? childminders.filter(cm => {
          if (!cm.latitude || !cm.longitude) return false;
          const distance = calculateDistance(
            latitude,
            longitude,
            Number(cm.latitude),
            Number(cm.longitude)
          );
          return distance <= maxDistance && distance <= cm.availabilityRadius;
        })
      : childminders;

    return NextResponse.json(filteredChildminders);

  } catch (error) {
    console.error('[CHILDMINDER_AVAILABILITY]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const {
      lastMinuteAvailability,
      emergencyBookings,
      availabilityRadius,
      languagesSpoken,
      specializedCare
    } = body;

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        role: true
      }
    });

    if (!dbUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    if (dbUser.role !== 'childminder') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Update availability settings
    const updatedUser = await prisma.user.update({
      where: {
        id: dbUser.id
      },
      data: {
        lastMinuteAvailability,
        emergencyBookings,
        availabilityRadius,
        languagesSpoken: languagesSpoken ? JSON.stringify(languagesSpoken) : undefined,
        specializedCare: specializedCare ? JSON.stringify(specializedCare) : undefined
      }
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('[CHILDMINDER_AVAILABILITY_UPDATE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
} 