import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the user with childminder role
    const user = await prisma.user.findFirst({
      where: {
        clerkId: userId,
        role: 'childminder',
      },
    });

    if (!user) {
      return new NextResponse("Childminder not found", { status: 404 });
    }

    // Get all bookings for the childminder
    const bookings = await prisma.booking.findMany({
      where: {
        childminderId: user.id,
      },
      include: {
        child: {
          select: {
            name: true,
            parent: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Format the bookings data
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      child: booking.child.name,
      parent: booking.child.parent.name,
      date: booking.startTime.toISOString().split('T')[0],
      time: booking.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: booking.status,
    }));

    return NextResponse.json(formattedBookings);
  } catch (error) {
    console.error("[CHILDMINDER_BOOKINGS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 