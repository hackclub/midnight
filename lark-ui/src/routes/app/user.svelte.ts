import { checkAuthStatus, type User } from '$lib/auth';

let user = $state<User | null>(null);

export function getUser() {
  if (!user) {
    updateUser();
  }

  return user;
}

export async function updateUser() {
  user = await checkAuthStatus();
}