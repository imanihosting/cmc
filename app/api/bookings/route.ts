import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs'

// GET bookings (filtered by user role and status)
export async function GET(request: Request) {
  try {
    const { userId } = auth()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get user to determine role
    const user = await prisma.user.findFirst({
      where: { clerkId: userId }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Filter bookings based on user role
    const bookings = await prisma.booking.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(user.role === 'parent' ? { parentId: user.id } : {}),
        ...(user.role === 'childminder' ? { childminderId: user.id } : {})
      },
      include: {
        parent: {
          select: {
            name: true,
            email: true,
            profilePicture: true
          }
        },
        childminder: {
          select: {
            name: true,
            email: true,
            profilePicture: true,
            hourlyRate: true
          }
        },
        child: {
          select: {
            name: true,
            dateOfBirth: true,
            gender: true
          }
        }
      }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('[BOOKINGS_GET]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// POST create new booking
export async function POST(request: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { 
      childminderId,
      childId,
      startTime,
      endTime,
      additionalInfo
    } = body

    // Get parent user
    const parent = await prisma.user.findFirst({
      where: { clerkId: userId }
    })

    if (!parent || parent.role !== 'parent') {
      return new NextResponse("Unauthorized - Only parents can create bookings", { status: 403 })
    }

    if (!childminderId || !childId || !startTime || !endTime) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const booking = await prisma.booking.create({
      data: {
        parentId: parent.id,
        childminderId,
        childId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        additionalInfo,
        status: 'pending'
      },
      include: {
        parent: true,
        childminder: true,
        child: true
      }
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error('[BOOKINGS_POST]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// PATCH update booking status
export async function PATCH(request: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { bookingId, status } = body

    if (!bookingId || !status) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Get user to verify role
    const user = await prisma.user.findFirst({
      where: { clerkId: userId }
    })

    if (!user || user.role !== 'childminder') {
      return new NextResponse("Unauthorized - Only childminders can update booking status", { status: 403 })
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        parent: true,
        childminder: true,
        child: true
      }
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error('[BOOKINGS_PATCH]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 