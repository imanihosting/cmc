import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Role, Prisma } from '@prisma/client';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: {
        clerkId: userId,
        role: Role.childminder,
      },
    });

    if (!user) {
      return new NextResponse('Not found', { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.log('[CHILDMINDER_PROFILE_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const values = await req.json();

    // Find the user first
    const existingUser = await prisma.user.findFirst({
      where: {
        clerkId: userId,
        role: Role.childminder,
      },
    });

    if (!existingUser) {
      return new NextResponse('Not found', { status: 404 });
    }

    // Convert decimal values
    const hourlyRate = values.hourlyRate ? new Prisma.Decimal(values.hourlyRate) : undefined;
    const latitude = values.latitude ? new Prisma.Decimal(values.latitude) : undefined;
    const longitude = values.longitude ? new Prisma.Decimal(values.longitude) : undefined;

    // Convert boolean values
    const gardaVetted = typeof values.gardaVetted === 'boolean' ? values.gardaVetted : undefined;
    const tuslaRegistered = typeof values.tuslaRegistered === 'boolean' ? values.tuslaRegistered : undefined;
    const lastMinuteAvailability = typeof values.lastMinuteAvailability === 'boolean' ? values.lastMinuteAvailability : undefined;
    const emergencyBookings = typeof values.emergencyBookings === 'boolean' ? values.emergencyBookings : undefined;

    // Convert number values
    const availabilityRadius = typeof values.availabilityRadius === 'number' ? values.availabilityRadius : undefined;

    // Update the user with all fields
    const updatedUser = await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        // Basic info
        name: values.name || undefined,
        profilePicture: values.profilePicture || undefined,
        bio: values.bio || undefined,

        // Contact info
        phoneNumber: values.phoneNumber || undefined,
        address: values.address || undefined,
        city: values.city || undefined,
        postcode: values.postcode || undefined,

        // Professional info
        experience: values.experience || undefined,
        qualifications: values.qualifications || undefined,
        hourlyRate,
        serviceArea: values.serviceArea || undefined,
        latitude,
        longitude,

        // JSON fields
        availability: values.availability || undefined,
        personalityTraits: values.personalityTraits || undefined,
        matchPreferences: values.matchPreferences || undefined,
        languagesSpoken: values.languagesSpoken || undefined,
        specializedCare: values.specializedCare || undefined,

        // Boolean fields
        gardaVetted,
        tuslaRegistered,
        lastMinuteAvailability,
        emergencyBookings,

        // Number fields
        availabilityRadius,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('[CHILDMINDER_PROFILE_PUT]', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new NextResponse(
        `Database error: ${error.message}`,
        { status: 400 }
      );
    }
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal error',
      { status: 500 }
    );
  }
} 