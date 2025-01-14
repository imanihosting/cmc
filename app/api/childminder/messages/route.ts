import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the childminder's ID
    const user = await prisma.user.findFirst({
      where: {
        clerkId: userId,
        role: Role.childminder,
      },
    });

    if (!user) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Get all conversations with messages and parent details
    const conversations = await prisma.conversation.findMany({
      where: {
        childminderId: user.id,
      },
      include: {
        parent: {
          select: {
            name: true,
            profilePicture: true,
          },
        },
        messages: {
          orderBy: {
            sentAt: 'asc',
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("[CHILDMINDER_MESSAGES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const values = await req.json();
    const { conversationId, content, receiverId } = values;

    if (!conversationId || !content || !receiverId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get the childminder's ID
    const user = await prisma.user.findFirst({
      where: {
        clerkId: userId,
        role: Role.childminder,
      },
    });

    if (!user) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Verify the conversation belongs to this childminder
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        childminderId: user.id,
      },
    });

    if (!conversation) {
      return new NextResponse("Conversation not found", { status: 404 });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        receiverId,
        content,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("[CHILDMINDER_MESSAGES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 