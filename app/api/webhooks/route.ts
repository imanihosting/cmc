import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function POST(req: Request) {
  console.log('Webhook received');
  
  const SIGNING_SECRET = process.env.SIGNING_SECRET;
  
  if (!SIGNING_SECRET) {
    throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local')
  }

  try {
    // Get the headers
    const headerPayload = headers();
    
    // Get all required headers
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    console.log('Received headers:', {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature?.substring(0, 20) + '...' // Log only part of the signature for security
    });

    // If there are missing headers, return 400
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response('Error: Missing Svix headers', {
        status: 400
      });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);
    
    console.log('Webhook body:', body);

    // Create new Svix instance with secret
    const wh = new Webhook(SIGNING_SECRET);

    let evt: WebhookEvent;
    
    try {
      // Verify the webhook payload
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error: Could not verify webhook:', err);
      return new Response('Error: Verification error', {
        status: 400
      });
    }

    const eventType = evt.type;
    console.log(`Received webhook event type: ${eventType}`);
    
    if (eventType === 'user.created') {
      const { id: clerkId, email_addresses, first_name, last_name } = evt.data;
      
      // Get the primary email
      const primaryEmail = email_addresses.find(email => email.id === evt.data.primary_email_address_id);
      
      if (!primaryEmail) {
        throw new Error('No primary email found for user');
      }

      // Create the user in your database
      const user = await prisma.user.create({
        data: {
          clerkId,
          email: primaryEmail.email_address,
          name: `${first_name || ''} ${last_name || ''}`.trim() || 'New User',
          role: 'parent' as Role, // Default role as parent
          password: '', // Since Clerk handles authentication
        },
      });

      console.log('User created in database:', user);
    }
    
    else if (eventType === 'user.updated') {
      const { id: clerkId, email_addresses, first_name, last_name } = evt.data;
      
      // Get the primary email
      const primaryEmail = email_addresses.find(email => email.id === evt.data.primary_email_address_id);
      
      if (!primaryEmail) {
        throw new Error('No primary email found for user');
      }

      // Update the user in your database
      const user = await prisma.user.update({
        where: { clerkId },
        data: {
          email: primaryEmail.email_address,
          name: `${first_name || ''} ${last_name || ''}`.trim(),
        },
      });

      console.log('User updated in database:', user);
    }
    
    else if (eventType === 'user.deleted') {
      const { id: clerkId } = evt.data;

      // Delete the user from your database
      const user = await prisma.user.delete({
        where: { clerkId },
      });

      console.log('User deleted from database:', user);
    }

    return new Response('Webhook received', { 
      status: 200 
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}