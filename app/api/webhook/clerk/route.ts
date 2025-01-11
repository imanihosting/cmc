import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';

const WH_SECRET = process.env.SIGNING_SECRET!;

export async function POST(req: NextRequest) {
  const headersList = await headers();

  const svix_id = await headersList.get('svix-id');
  const svix_timestamp = await headersList.get('svix-timestamp');
  const svix_signature = await headersList.get('svix-signature');

  console.log('Received headers:', {
    'svix-id': svix_id,
    'svix-timestamp': svix_timestamp,
    'svix-signature': svix_signature,
  });

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { success: false, status: 400, response: 'Missing required headers' },
      { status: 400 }
    );
  }

  const body = await req.text();
  const wh = new Webhook(WH_SECRET);

  try {
    const evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });

    console.log('Webhook verified successfully:', evt);

    return NextResponse.json({ success: true, status: 200, response: evt });
  } catch (err) {
    console.error('Webhook verification failed:', err);

    return NextResponse.json(
      { success: false, status: 400, response: { error: 'Webhook verification failed' } },
      { status: 400 }
    );
  }
}
