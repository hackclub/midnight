import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const BASE_ID = 'appumOs6hlFGhbv7c';
const TABLE_NAME = 'RSVP';

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  const AIRTABLE_API_KEY = env.AIRTABLE_API_KEY || '';
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (!AIRTABLE_API_KEY) {
      console.error('AIRTABLE_API_KEY is not set');
      return json({ error: 'Server configuration error' }, { status: 500 });
    }

    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIP = forwardedFor ? forwardedFor.split(',')[0].trim() : getClientAddress();

    const response = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                Email: email,
                IP: clientIP,
              },
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Airtable API error:', errorData);
      return json(
        { error: 'Failed to submit RSVP' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Error submitting RSVP:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

