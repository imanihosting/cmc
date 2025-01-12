import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature found' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        
        console.log('Webhook received checkout.session.completed:', {
          userId,
          sessionId: session.id,
          paymentStatus: session.payment_status,
          status: session.status
        });
        
        if (userId) {
          await prisma.$transaction(async (prisma) => {
            const subscription = await prisma.subscription.findFirst({
              where: {
                userId: parseInt(userId),
                status: 'inactive',
              },
            });

            console.log('Found subscription:', subscription);

            if (subscription) {
              const updated = await prisma.subscription.update({
                where: { id: subscription.id },
                data: { status: 'active' },
              });
              console.log('Updated subscription:', updated);
            }
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const metadata = subscription.metadata;
        
        if (metadata && metadata.userId) {
          await prisma.$transaction(async (prisma) => {
            const dbSubscription = await prisma.subscription.findFirst({
              where: {
                userId: parseInt(metadata.userId),
                status: 'active',
              },
            });

            if (dbSubscription) {
              await prisma.subscription.update({
                where: { id: dbSubscription.id },
                data: { status: 'cancelled' },
              });
            }
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
} 