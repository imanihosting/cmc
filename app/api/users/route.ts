import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
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
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: body.password,
        role: body.role,
        profilePicture: body.profilePicture,
        experience: body.experience,
        qualifications: body.qualifications,
        serviceArea: body.serviceArea,
        hourlyRate: body.hourlyRate ? parseFloat(body.hourlyRate) : null,
        gardaVetted: body.gardaVetted,
        tuslaRegistered: body.tuslaRegistered,
      },
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
} 