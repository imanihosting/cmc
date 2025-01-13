import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: session.userId },
      select: { id: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const where = {
      userId: dbUser.id,
      ...(unreadOnly ? { isRead: false } : {}),
    };

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error in notifications GET endpoint:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate notification type
    if (!Object.values(NotificationType).includes(body.type)) {
      return NextResponse.json(
        { error: `Invalid notification type. Must be one of: ${Object.values(NotificationType).join(', ')}` },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId: body.userId,
        title: body.title,
        message: body.message,
        type: body.type as NotificationType,
        isRead: false,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    const notification = await prisma.notification.update({
      where: {
        id: parseInt(id),
      },
      data: {
        isRead: true,
      },
    });
    return NextResponse.json(notification);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
} 