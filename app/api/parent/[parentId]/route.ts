import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { parentId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify the requester is a childminder
    const requester = await prisma.user.findFirst({
      where: {
        clerkId: userId,
        role: Role.childminder,
      },
    });

    if (!requester) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get parent profile with their children
    const parent = await prisma.user.findFirst({
      where: {
        id: parseInt(params.parentId),
        role: Role.parent,
      },
      select: {
        id: true,
        name: true,
        profilePicture: true,
        children: {
          select: {
            name: true,
            dateOfBirth: true,
          },
        },
      },
    });

    if (!parent) {
      return new NextResponse('Parent not found', { status: 404 });
    }

    return NextResponse.json(parent);
  } catch (error) {
    console.error('[PARENT_PROFILE_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 