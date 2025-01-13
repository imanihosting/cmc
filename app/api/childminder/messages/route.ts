import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { formatDistanceToNow } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

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

    // Get recent messages
    const messages = await prisma.message.findMany({
      where: {
        receiverId: dbUser.id
      },
      include: {
        sender: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        sentAt: 'desc'
      },
      take: 5
    });

    // Format messages for response
    const formattedMessages = messages.map(message => ({
      id: message.id,
      sender: message.sender.name,
      message: message.content,
      time: formatDistanceToNow(message.sentAt, { addSuffix: true })
    }));

    return NextResponse.json(formattedMessages);

  } catch (error) {
    console.error('[CHILDMINDER_MESSAGES]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 