import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    // First check if we can connect to the database
    await prisma.$connect();

    const users = await prisma.user.findMany({
      select: {
        id: true,
        clerkId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profilePicture: true,
        experience: true,
        qualifications: true,
        serviceArea: true,
        hourlyRate: true,
        gardaVetted: true,
        tuslaRegistered: true,
      },
    });

    if (!users) {
      console.error('No users found or database error');
      return NextResponse.json({ error: 'No users found' }, { status: 404 });
    }

    // Transform the data to match the expected format
    const transformedUsers = users.map(user => ({
      id: user.id.toString(),
      name: user.name || '',
      email: user.email || '',
      role: (user.role || 'user').toLowerCase(),
      createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
      profilePicture: user.profilePicture || null,
      experience: user.experience || null,
      qualifications: user.qualifications || null,
      serviceArea: user.serviceArea || null,
      hourlyRate: user.hourlyRate ? Number(user.hourlyRate) : null,
      gardaVetted: user.gardaVetted || false,
      tuslaRegistered: user.tuslaRegistered || false,
    }));

    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error('Error in users GET endpoint:', error);

    // Handle specific Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 400 }
      );
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { error: 'Failed to connect to database' },
        { status: 503 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Internal server error while fetching users' },
      { status: 500 }
    );
  } finally {
    // Always disconnect from the database
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: body.password,
        role: body.role,
        profilePicture: body.profilePicture,
        experience: body.experience,
        qualifications: body.qualifications,
        serviceArea: body.serviceArea,
        hourlyRate: body.hourlyRate ? parseFloat(body.hourlyRate) : null,
        gardaVetted: body.gardaVetted,
        tuslaRegistered: body.tuslaRegistered,
      },
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
} 