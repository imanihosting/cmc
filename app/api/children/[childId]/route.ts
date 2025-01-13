import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { childId: string } }
) {
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

    const childId = parseInt(params.childId);
    if (isNaN(childId)) {
      return NextResponse.json({ error: 'Invalid child ID' }, { status: 400 });
    }

    // Verify the child belongs to the parent
    const existingChild = await prisma.child.findFirst({
      where: {
        id: childId,
        parentId: user.id
      }
    });

    if (!existingChild) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    const body = await request.json();
    const updatedChild = await prisma.child.update({
      where: {
        id: childId
      },
      data: {
        name: body.name,
        dateOfBirth: new Date(body.dateOfBirth),
        additionalInfo: body.additionalInfo || undefined,
        allergies: body.allergies ? JSON.stringify(body.allergies) : undefined,
        preferences: body.interests ? JSON.stringify(body.interests) : undefined,
        specialNeeds: body.specialNeeds ? JSON.stringify(body.specialNeeds) : undefined
      }
    });

    return NextResponse.json(updatedChild);
  } catch (error) {
    console.error('Error updating child:', error);
    return NextResponse.json({ error: 'Failed to update child' }, { status: 500 });
  }
} 