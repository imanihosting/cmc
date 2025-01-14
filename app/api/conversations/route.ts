import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const session = await auth();
    const userId = session.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's database ID
    const user = await prisma.user.findFirst({
      where: {
        clerkId: userId,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find all conversations where the user is either parent or childminder
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { parentId: user.id },
          { childminderId: user.id },
        ],
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            clerkId: true,
          },
        },
        childminder: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            clerkId: true,
          },
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                clerkId: true,
              },
            },
          },
          orderBy: {
            sentAt: 'desc',
          },
        },
      },
    });

    // Transform the conversations to include the correct participant and unread count
    const formattedConversations = conversations.map(conv => {
      const isParent = conv.parentId === user.id;
      const participant = isParent ? conv.childminder : conv.parent;
      const lastMessage = conv.messages[0];
      const unreadCount = conv.messages.filter(msg => 
        msg.sender.id !== user.id && // Message is from the other person
        new Date(msg.sentAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Message is from last 24 hours
      ).length;

      return {
        id: conv.id,
        participant: {
          id: participant.id,
          name: participant.name,
          profilePicture: participant.profilePicture,
          clerkId: participant.clerkId,
        },
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          content: lastMessage.content,
          sentAt: lastMessage.sentAt,
          sender: lastMessage.sender,
        } : null,
        unreadCount,
      };
    });

    // Sort conversations by most recent message
    formattedConversations.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.sentAt).getTime() - new Date(a.lastMessage.sentAt).getTime();
    });

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error('Error in GET /api/conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
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

    // Get the user's database ID
    const user = await prisma.user.findFirst({
      where: {
        clerkId: userId,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify the other participant exists
    const otherUser = await prisma.user.findFirst({
      where: {
        id: body.participantId,
      },
    });

    if (!otherUser) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    // Check if a conversation already exists between these users
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            AND: [
              { parentId: user.id },
              { childminderId: body.participantId },
            ],
          },
          {
            AND: [
              { parentId: body.participantId },
              { childminderId: user.id },
            ],
          },
        ],
      },
    });

    if (existingConversation) {
      return NextResponse.json({ error: 'Conversation already exists' }, { status: 400 });
    }

    // Create the conversation with the correct roles
    const isUserParent = user.role === 'parent';
    const conversation = await prisma.conversation.create({
      data: {
        parentId: isUserParent ? user.id : body.participantId,
        childminderId: isUserParent ? body.participantId : user.id,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            clerkId: true,
          },
        },
        childminder: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            clerkId: true,
          },
        },
      },
    });

    // Format the response
    const participant = isUserParent ? conversation.childminder : conversation.parent;
    const formattedConversation = {
      id: conversation.id,
      participant: {
        id: participant.id,
        name: participant.name,
        profilePicture: participant.profilePicture,
        clerkId: participant.clerkId,
      },
      lastMessage: null,
      unreadCount: 0,
    };

    return NextResponse.json(formattedConversation);
  } catch (error) {
    console.error('Error in POST /api/conversations:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
} 