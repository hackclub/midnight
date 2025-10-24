import { redirect, type Handle } from "@sveltejs/kit";
import { env } from '$env/dynamic/private';

const apiUrl = env.PUBLIC_API_URL || "";

async function checkAuthStatus() {
  return await fetch(`${apiUrl}/api/user/auth/me`, {
    credentials: 'include'
  });
}

export const handle: Handle = async ({ event, resolve }) => {
  const authStatus = await checkAuthStatus();

  if (authStatus.ok) {
    return resolve(event);
  } else {
    return redirect(302, '/login');
  }
}
