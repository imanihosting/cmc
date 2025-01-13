import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { childId: string } }
) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const childId = parseInt(params.childId);
    if (isNaN(childId)) {
      return new NextResponse('Invalid child ID', { status: 400 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        role: true,
        children: {
          where: {
            id: childId
          }
        }
      }
    });

    if (!dbUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    if (dbUser.role !== 'parent') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    if (dbUser.children.length === 0) {
      return new NextResponse('Child not found', { status: 404 });
    }

    return NextResponse.json(dbUser.children[0]);

  } catch (error) {
    console.error('[CHILD_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { childId: string } }
) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const childId = parseInt(params.childId);
    if (isNaN(childId)) {
      return new NextResponse('Invalid child ID', { status: 400 });
    }

    const body = await req.json();
    const {
      name,
      dateOfBirth,
      gender,
      additionalInfo,
      allergies,
      preferences,
      routines,
      specialNeeds
    } = body;

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        role: true,
        children: {
          where: {
            id: childId
          }
        }
      }
    });

    if (!dbUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    if (dbUser.role !== 'parent') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    if (dbUser.children.length === 0) {
      return new NextResponse('Child not found', { status: 404 });
    }

    // Update child profile
    const updatedChild = await prisma.child.update({
      where: {
        id: childId
      },
      data: {
        name,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        additionalInfo,
        allergies: allergies ? JSON.stringify(allergies) : undefined,
        preferences: preferences ? JSON.stringify(preferences) : undefined,
        routines: routines ? JSON.stringify(routines) : undefined,
        specialNeeds: specialNeeds ? JSON.stringify(specialNeeds) : undefined
      }
    });

    return NextResponse.json(updatedChild);

  } catch (error) {
    console.error('[CHILD_UPDATE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 