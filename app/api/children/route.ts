import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const children = await prisma.child.findMany({
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return NextResponse.json(children);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch children' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const child = await prisma.child.create({
      data: {
        parentId: body.parentId,
        name: body.name,
        dateOfBirth: new Date(body.dateOfBirth),
        gender: body.gender,
        additionalInfo: body.additionalInfo,
      },
      include: {
        parent: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    return NextResponse.json(child);
  } catch (error) {
    console.error('Error creating child:', error);
    return NextResponse.json({ error: 'Failed to create child' }, { status: 500 });
  }
} 