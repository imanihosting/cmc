import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userId = session.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    // Verify user is part of the conversation
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: parseInt(conversationId),
      },
      include: {
        parent: true,
        childminder: true,
      },
    });

    if (!conversation || (conversation.parent.clerkId !== userId && conversation.childminder.clerkId !== userId)) {
      return NextResponse.json({ error: 'Unauthorized access to conversation' }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: parseInt(conversationId),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            clerkId: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            clerkId: true,
          },
        },
      },
      orderBy: {
        sentAt: 'asc',
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error in GET /api/messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Verify user is part of the conversation
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: body.conversationId,
      },
      include: {
        parent: true,
        childminder: true,
      },
    });

    if (!conversation || (conversation.parent.clerkId !== userId && conversation.childminder.clerkId !== userId)) {
      return NextResponse.json({ error: 'Unauthorized access to conversation' }, { status: 403 });
    }

    // Get the user record
    const user = await prisma.user.findFirst({
      where: {
        clerkId: userId,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Determine receiver based on sender
    const receiverId = user.id === conversation.parentId 
      ? conversation.childminderId 
      : conversation.parentId;

    const message = await prisma.message.create({
      data: {
        conversationId: body.conversationId,
        senderId: user.id,
        receiverId: receiverId,
        content: body.content,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            clerkId: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            clerkId: true,
          },
        },
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error in POST /api/messages:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
} 