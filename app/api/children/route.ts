import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the parent's database ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const children = await prisma.child.findMany({
      where: {
        parentId: user.id
      }
    });
    return NextResponse.json(children);
  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json({ error: 'Failed to fetch children' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the parent's database ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const child = await prisma.child.create({
      data: {
        parentId: user.id,
        name: body.name,
        dateOfBirth: new Date(body.dateOfBirth),
        gender: 'other', // Default value since it's required by the schema
        additionalInfo: body.additionalInfo || undefined,
        allergies: body.allergies ? JSON.stringify(body.allergies) : undefined,
        preferences: body.interests ? JSON.stringify(body.interests) : undefined,
        specialNeeds: body.specialNeeds ? JSON.stringify(body.specialNeeds) : undefined
      }
    });
    return NextResponse.json(child);
  } catch (error) {
    console.error('Error creating child:', error);
    return NextResponse.json({ error: 'Failed to create child' }, { status: 500 });
  }
} 