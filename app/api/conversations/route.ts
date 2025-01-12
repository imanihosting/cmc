import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        childminder: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          select: {
            id: true,
            content: true,
            sentAt: true,
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            sentAt: 'desc',
          },
          take: 10, // Get last 10 messages
        },
      },
    });
    return NextResponse.json(conversations);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const conversation = await prisma.conversation.create({
      data: {
        parentId: body.parentId,
        childminderId: body.childminderId,
      },
      include: {
        parent: {
          select: {
            name: true,
            email: true,
          },
        },
        childminder: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    return NextResponse.json(conversation);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
} 