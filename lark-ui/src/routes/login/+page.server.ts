import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { env } from '$env/dynamic/private';

const apiUrl = env.PUBLIC_API_URL || "";

async function verifyOtp(email: string, otp: string) {
  return await fetch(`${apiUrl}/api/user/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, otp })
  });
}

export const actions = {
    verify_otp: async ({ cookies, request, url }) => {
        const data = await request.formData();
        const email = data.get('email');
        const otp = data.get('otp');

        const response = await verifyOtp(email as string, otp as string)
        
        if (!response || !response.ok) {
            return fail(500, { message: 'Failed to verify OTP' })
        }

        const responseData = await response.json();

        if (responseData.sessionId) {
            cookies.set('sessionId', responseData.sessionId, { path: '/' });
            cookies.set('email', email as string, { path: '/', expires: new Date(Date.now() + 600000) }); // 10 min

            if (responseData.isNewUser) {
                return redirect(302, '/onboarding');

                // --> step 4
            } else {
                return redirect(302, '/home');
            }

        } else {
            return fail(500, { message: 'Failed to verify OTP' })
        }
    }
} satisfies Actions;
