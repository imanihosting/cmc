import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';

type BaseUser = Prisma.UserGetPayload<{}>;

interface ExtendedUser extends Omit<BaseUser, 'matchPreferences'> {
  phoneNumber?: string | null;
  address?: string | null;
  city?: string | null;
  postcode?: string | null;
  bio?: string | null;
  matchPreferences?: any;
}

interface MatchPreferences {
  maxDistance: number;
  flexibleHours: boolean;
  emergencyBookings: boolean;
  specialNeeds: boolean;
  languagePreference: string[];
  ageGroupPreference: string[];
}

export async function GET() {
  try {
    const session = await auth();
    const userId = session.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = (await prisma.user.findFirst({
      where: {
        clerkId: userId,
      },
    })) as ExtendedUser;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse the JSON matchPreferences
    const preferences = user.matchPreferences ? 
      (typeof user.matchPreferences === 'string' ? 
        JSON.parse(user.matchPreferences) : user.matchPreferences) as MatchPreferences : 
      {
        maxDistance: 10,
        flexibleHours: false,
        emergencyBookings: false,
        specialNeeds: false,
        languagePreference: [],
        ageGroupPreference: [],
      };

    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      address: user.address || '',
      city: user.city || '',
      postcode: user.postcode || '',
      bio: user.bio || '',
      preferences,
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error in GET /api/parent/profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    const userId = session.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        clerkId: userId,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    try {
      const updateData = {
        name: body.name,
        email: body.email,
        phoneNumber: body.phoneNumber || null,
        address: body.address || null,
        city: body.city || null,
        postcode: body.postcode || null,
        bio: body.bio || null,
        matchPreferences: body.preferences,
      } as Prisma.UserUpdateInput;

      const updatedUser = (await prisma.user.update({
        where: {
          id: user.id,
        },
        data: updateData,
      })) as ExtendedUser;

      // Transform the response to match the expected format
      const response = {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber || '',
        address: updatedUser.address || '',
        city: updatedUser.city || '',
        postcode: updatedUser.postcode || '',
        bio: updatedUser.bio || '',
        preferences: updatedUser.matchPreferences,
      };

      return NextResponse.json(response);
    } catch (prismaError) {
      console.error('Prisma error:', prismaError);
      if (prismaError instanceof Prisma.PrismaClientKnownRequestError) {
        if (prismaError.code === 'P2002') {
          return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }
      }
      throw prismaError;
    }
  } catch (error) {
    console.error('Error in PUT /api/parent/profile:', error);
    return NextResponse.json({ 
      error: 'Failed to update profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 