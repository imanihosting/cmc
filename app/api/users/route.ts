import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs'

// GET all users (with role-based filtering)
export async function GET(request: Request) {
  try {
    const { userId } = auth()
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const users = await prisma.user.findMany({
      where: role ? { role: role as any } : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profilePicture: true,
        experience: true,
        qualifications: true,
        serviceArea: true,
        hourlyRate: true,
        gardaVetted: true,
        tuslaRegistered: true,
        createdAt: true,
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('[USERS_GET]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// POST create new user
export async function POST(request: Request) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { 
      name, 
      email, 
      role, 
      profilePicture,
      experience,
      qualifications,
      serviceArea,
      hourlyRate,
      gardaVetted,
      tuslaRegistered 
    } = body

    if (!name || !email || !role) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const user = await prisma.user.create({
      data: {
        clerkId: userId,
        name,
        email,
        role,
        profilePicture,
        experience,
        qualifications,
        serviceArea,
        hourlyRate,
        gardaVetted,
        tuslaRegistered,
        password: "" // Since we're using Clerk for auth
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('[USERS_POST]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 