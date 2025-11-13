import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
  const apiUrl = process.env.PUBLIC_API_URL || 'http://localhost:3000';

  const userResponse = await fetch(`${apiUrl}/api/user/auth/me`, {
    credentials: 'include',
  });

  if (userResponse.status === 401) {
    throw redirect(302, '/login');
  }

  if (!userResponse.ok) {
    throw error(500, 'Failed to verify session');
  }

  const user = await userResponse.json();

  if (user.role !== 'admin') {
    throw redirect(302, '/app/projects');
  }

  const [submissionsResponse, projectsResponse, usersResponse, metricsResponse] = await Promise.all([
    fetch(`${apiUrl}/api/admin/submissions`, { credentials: 'include' }),
    fetch(`${apiUrl}/api/admin/projects`, { credentials: 'include' }),
    fetch(`${apiUrl}/api/admin/users`, { credentials: 'include' }),
    fetch(`${apiUrl}/api/admin/metrics`, { credentials: 'include' }),
  ]);

  if (!submissionsResponse.ok || !projectsResponse.ok || !usersResponse.ok || !metricsResponse.ok) {
    throw error(500, 'Failed to load admin resources');
  }

  const submissions = await submissionsResponse.json();
  const projects = await projectsResponse.json();
  const users = await usersResponse.json();
  const metrics = await metricsResponse.json();

  return {
    user,
    submissions,
    projects,
    users,
    metrics: metrics.totals ?? metrics,
    apiUrl,
  };
};

