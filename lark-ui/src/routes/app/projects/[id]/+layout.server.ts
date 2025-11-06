import { redirect } from '@sveltejs/kit';
import { checkAuthStatus, getProject } from '$lib/auth';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, fetch }) => {
  const user = await checkAuthStatus(fetch);

  if (!user) {
    throw redirect(302, '/');
  }

  const project = await getProject(params.id, fetch);

  if (!project) {
    throw new Error('Project not found');
  }

  return {
    user,
    project
  };
};
