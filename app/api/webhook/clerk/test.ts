import crypto from 'crypto';

function generateSignature(signingSecret: string, body: string, timestamp: string): string[] {
  const toSign = `${timestamp}.${body}`;
  const hmac = crypto.createHmac('sha256', signingSecret);
  const signature = hmac.update(toSign).digest('hex');
  return [`v1,${signature}`];  // Clerk expects an array of signatures
}

// Function to generate test webhook headers
function generateTestHeaders(signingSecret: string, payload: any) {
  try {
    const currentTimestamp = Math.floor(Date.now() / 1000).toString();
    const body = JSON.stringify(payload);
    
    // Generate a random svix ID
    const svixId = 'test_' + Math.random().toString(36).substr(2, 9);
    
    // Generate signatures
    const signatures = generateSignature(signingSecret, body, currentTimestamp);
    
    // Create headers object
    const headers = {
      'svix-id': svixId,
      'svix-timestamp': currentTimestamp,
      'svix-signature': signatures.join(' '),
      'Content-Type': 'application/json'
    };

    return { headers, body };
  } catch (error) {
    console.error('Error generating headers:', error);
    throw error;
  }
}

// Test payload for user creation that matches Clerk's webhook format
const testUserPayload = {
  "data": {
    "id": "user_" + Math.random().toString(36).substr(2, 9),
    "object": "user",
    "email_addresses": [{
      "id": "idn_" + Math.random().toString(36).substr(2, 9),
      "email_address": "test@example.com",
      "object": "email_address",
      "verification": {
        "status": "verified",
        "strategy": "from_oauth_google"
      }
    }],
    "primary_email_address_id": null,
    "first_name": "Test",
    "last_name": "User",
    "created_at": Math.floor(Date.now() / 1000),
    "updated_at": Math.floor(Date.now() / 1000),
    "image_url": "https://example.com/test.jpg",
    "external_id": null,
    "username": null,
    "password_enabled": false,
    "two_factor_enabled": false,
    "public_metadata": {},
    "private_metadata": {},
    "unsafe_metadata": {}
  },
  "object": "event",
  "type": "user.created"
};

// Test function
export async function testWebhook() {
  try {
    const signingSecret = process.env.SIGNING_SECRET;
    if (!signingSecret) {
      throw new Error('Error: SIGNING_SECRET is not set in environment variables');
    }

    console.log('Using signing secret:', signingSecret.substring(0, 10) + '...');

    // Set the primary email ID
    testUserPayload.data.primary_email_address_id = testUserPayload.data.email_addresses[0].id;

    // Generate headers and get the exact body we'll send
    const { headers, body } = generateTestHeaders(signingSecret, testUserPayload);
    
    console.log('Making webhook test request...');
    console.log('Headers:', {
      ...headers,
      'svix-signature': headers['svix-signature'].substring(0, 20) + '...'
    });
    console.log('Body:', body.substring(0, 100) + '...');

    // Make the request to the webhook endpoint
    const response = await fetch('http://localhost:3000/api/webhook/clerk', {
      method: 'POST',
      headers: headers,
      body: body  // Use the exact same body string we signed
    });

    // Get the response
    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response body:', responseText);

    if (!response.ok) {
      throw new Error(`Webhook test failed with status ${response.status}: ${responseText}`);
    }

    return {
      success: true,
      status: response.status,
      body: responseText,
      testUser: testUserPayload.data
    };

  } catch (error) {
    console.error('Test failed:', error);
    return {
      success: false,
      error: 'Test failed',
      details: error.message
    };
  }
}