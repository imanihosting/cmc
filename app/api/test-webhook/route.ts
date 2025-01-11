import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
    try {
        const SIGNING_SECRET = process.env.SIGNING_SECRET;
        if (!SIGNING_SECRET) {
            throw new Error('Missing SIGNING_SECRET');
        }

        // Create webhook payload
        const webhookEvent = {
            data: {
                id: "user_" + Math.random().toString(36).substring(2, 9),
                object: "user",
                email_addresses: [{
                    id: "idn_" + Math.random().toString(36).substring(2, 9),
                    email_address: "test@example.com",
                    object: "email_address",
                    verification: {
                        status: "verified",
                        strategy: "from_oauth_google"
                    }
                }],
                primary_email_address_id: null,
                first_name: "Test",
                last_name: "User",
                created_at: Math.floor(Date.now() / 1000),
                updated_at: Math.floor(Date.now() / 1000),
                image_url: "https://example.com/test.jpg",
                external_id: null,
                username: null,
                password_enabled: false,
                two_factor_enabled: false,
                public_metadata: {},
                private_metadata: {},
                unsafe_metadata: {}
            },
            object: "event",
            type: "user.created"
        };

        // Set primary email ID
        webhookEvent.data.primary_email_address_id = webhookEvent.data.email_addresses[0].id;

        // Generate headers and signature
        const body = JSON.stringify(webhookEvent);
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const svixId = 'test_' + Math.random().toString(36).substring(2, 9);

        // Generate signature using the provided method
        const payload = `${timestamp}.${body}`;
        const hmac = crypto.createHmac('sha256', SIGNING_SECRET);
        hmac.update(payload);
        const signature = `v1,${hmac.digest('hex')}`;

        console.log('Test request details:', {
            body: body.substring(0, 100) + '...',
            headers: {
                'svix-id': svixId,
                'svix-timestamp': timestamp,
                'svix-signature': signature.substring(0, 20) + '...'
            }
        });

        // Make test request
        const response = await fetch('http://localhost:3000/api/webhook/clerk', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'svix-id': svixId,
                'svix-timestamp': timestamp,
                'svix-signature': signature
            },
            body: body
        });

        const data = await response.text();
        return NextResponse.json({
            success: response.ok,
            status: response.status,
            response: data
        });
    } catch (error) {
        console.error('Test failed:', error);
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
}
