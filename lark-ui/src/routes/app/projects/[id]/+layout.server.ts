import { redirect } from '@sveltejs/kit';
import { checkAuthStatus, getLinkedHackatimeProjects, getProject } from '$lib/auth';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, fetch }) => {
  const user = await checkAuthStatus(fetch);

  if (!user) {
    throw redirect(302, '/');
  }

  if (!/^\d+$/.test(params.id)) {
    throw new Error('Invalid project ID');
  }

  const project = await getProject(params.id, fetch);

  if (!project) {
    throw new Error('Project not found');
  }

  const linkedHackatimeProjects = (await getLinkedHackatimeProjects(params.id, fetch))?.projects || [];

  return {
    user,
    project,
    linkedHackatimeProjects
  };
};
