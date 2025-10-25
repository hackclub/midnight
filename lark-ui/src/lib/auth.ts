import { env } from "$env/dynamic/public";

const apiUrl = env.PUBLIC_API_URL || '';

export async function checkAuthStatus() {
  const response = await fetch(`${apiUrl}/api/user/auth/me`, {
    credentials: 'include'
  });
  
  if (response.ok) {
    const userData = await response.json();
    return userData as {
        userId: string;
        email: string;
        firstName: string;
        lastName: string;
        birthday: Date;
        role: string;
        onboardComplete: boolean;
        createdAt: Date;
        updatedAt: Date;
    };
  } else {
    return null;
  }
}
