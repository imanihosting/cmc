import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers
  const headersList = await headers();
  const svix_id = headersList.get('svix-id');
  const svix_timestamp = headersList.get('svix-timestamp');
  const svix_signature = headersList.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await request.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, username, first_name, last_name, image_url } = evt.data;

    const primaryEmail = email_addresses[0]?.email_address;

    if (!primaryEmail) {
      return new Response('No email address found', { status: 400 });
    }

    try {
      const user = await prisma.user.create({
        data: {
          clerkId: id,
          email: primaryEmail,
          name: first_name && last_name 
            ? `${first_name} ${last_name}`
            : username || primaryEmail.split('@')[0],
          password: '', // We don't need password as Clerk handles auth
          role: 'parent', // Default role, user can change this later
          profilePicture: image_url || null,
        },
      });

      return NextResponse.json({ user }, { status: 201 });
    } catch (error) {
      console.error('Error creating user:', error);
      return NextResponse.json(
        { error: 'Error creating user in database' },
        { status: 500 }
      );
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, username, first_name, last_name, image_url } = evt.data;

    const primaryEmail = email_addresses[0]?.email_address;

    if (!primaryEmail) {
      return new Response('No email address found', { status: 400 });
    }

    try {
      const user = await prisma.user.update({
        where: { clerkId: id },
        data: {
          email: primaryEmail,
          name: first_name && last_name 
            ? `${first_name} ${last_name}`
            : username || primaryEmail.split('@')[0],
          profilePicture: image_url || null,
        },
      });

      return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
      console.error('Error updating user:', error);
      return NextResponse.json(
        { error: 'Error updating user in database' },
        { status: 500 }
      );
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      await prisma.user.delete({
        where: { clerkId: id },
      });

      return NextResponse.json(
        { message: 'User deleted successfully' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json(
        { error: 'Error deleting user from database' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ message: 'Webhook received' }, { status: 200 });
} 