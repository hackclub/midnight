import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { env } from '$env/dynamic/public';

const apiUrl = env.PUBLIC_API_URL || "";

async function verifyOtp(email: string, otp: string, fetchFn: typeof fetch) {
  const fullUrl = apiUrl ? `${apiUrl}/api/user/auth/verify-otp` : 'http://localhost:3000/api/user/auth/verify-otp';
  return await fetchFn(fullUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, otp })
  });
}

export const actions = {
    verify_otp: async ({ cookies, request, url, fetch: fetchFn }) => {
        console.log(env);

        const data = await request.formData();

        const email = data.get('email');
        const otp = data.get('otp');

        console.log('email', email);
        console.log('otp', otp);

        const response = await verifyOtp(email as string, otp as string, fetchFn)
        
        if (!response || !response.ok) {
            return fail(500, { message: 'Failed to verify OTP', email: email as string })
        }

        const responseData = await response.json();

        if (responseData.sessionId) {
            cookies.set('sessionId', responseData.sessionId, { path: '/' });
            cookies.set('email', email as string, { path: '/', expires: new Date(Date.now() + 600000) }); // 10 min

            if (responseData.isNewUser) {
                return redirect(302, '/app/onboarding');

                // --> step 4
            } else {
                return redirect(302, '/app/home');
            }

        } else {
            return fail(500, { message: 'Failed to verify OTP', email: email as string })
        }
    }
} satisfies Actions;
