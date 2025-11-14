import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

async function verifyOtp(email: string, otp: string, fetchFn: typeof fetch, apiUrl: string) {
  const fullUrl = `${apiUrl}/api/user/auth/verify-otp`;
  
  console.log('Calling API at:', fullUrl);
  
  return await fetchFn(fullUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, otp })
  });
}

export const actions = {
    verify_otp: async ({ cookies, request, url, fetch: fetchFn }) => {
        const data = await request.formData();

        console.log('data', data);

        const email = data.get('email');
        const otp = data.get('otp');

        console.log('email', email);
        console.log('otp', otp);

        const apiUrl = process.env.PUBLIC_API_URL || 'http://localhost:3000';
        console.log('Using API URL:', apiUrl);

        const response = await verifyOtp(email as string, otp as string, fetchFn, apiUrl)

        const responseData = await response.json();

        if (!response || !response.ok) {
            const urlParams = new URLSearchParams();
            urlParams.set("error", responseData.message);
            return redirect(302, `/login?${urlParams.toString()}`);
        }

        if (responseData.sessionId) {
            cookies.set('sessionId', responseData.sessionId, { path: '/' });
            cookies.set('email', email as string, { path: '/', expires: new Date(Date.now() + 600000) }); // 10 min

            if (responseData.isNewUser) {
                return redirect(302, '/app/onboarding');

                // --> step 4
            } else {
                return redirect(302, '/app/projects');
            }

        } else {
            return fail(500, { message: 'Failed to verify OTP', email: email as string })
        }
    }
} satisfies Actions;
