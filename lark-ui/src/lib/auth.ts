import { env } from "$env/dynamic/public";

const apiUrl = env.PUBLIC_API_URL || '';

//auth

export type User = {
      userId: string;
      email: string;
      firstName: string;
      lastName: string;
      birthday: string;
      role: string;
      onboardComplete: boolean;
      createdAt: string;
      updatedAt: string;
};

export async function checkAuthStatus() {
  const response = await fetch(`${apiUrl}/api/user/auth/me`, {
    credentials: 'include'
  });

  if (response.ok) {
    const userData = await response.json();
    return userData as User;
  } else {
    return null;
  }
}

export async function updateUser(data: {
  firstName: string;
  lastName: string;
  birthday: string;
}) {
  return await fetch(`${apiUrl}/api/user`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      firstName: data.firstName,
      lastName: data.lastName,
      birthday: data.birthday,
    })
  });
}

// projects

export type Project = {
  projectId: string;
  userId: string;
  projectTitle: string;
  projectType: 'personal_website' | 'platformer_game' | 'wildcard';
  description: string;
  createdAt: Date;
  updatedAt: Date;
  nowHackatimeHours: number | null;
  nowHackatimeProjects: string[] | null;
};

export async function createProject(data: {
  projectTitle: string;
  projectType: string;
  projectDescription: string;
}) {
  const response = await fetch(`${apiUrl}/api/projects/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });

  if (response.ok) {
    const project = await response.json();
    return project as Project;
  } else {
    return null;
  }
}

export async function getProjects() {
  const response = await fetch(`${apiUrl}/api/projects/auth`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  if (response.ok) {
    const projects = await response.json();
    return projects as Project[];
  } else {
    return [];
  }
}

export async function getProject(id: string) {
  const response = await fetch(`${apiUrl}/api/projects/auth/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  if (response.ok) {
    const project = await response.json();
    return project as Project;
  } else {
    return null;
  }
}

//hackatime

export type HackatimeProject = {
  name: string
}

export async function checkHackatimeAccount() {
  const response = await fetch(`${apiUrl}/api/user/hackatime-account`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    return null;
  }
}

export async function getHackatimeProjects() {
  const response = await fetch(`${apiUrl}/api/user/hackatime-projects`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  if (response.ok) {
    const data = await response.json();
    return data as {
      projects: HackatimeProject[]
    };
  } else {
    return null;
  }
}

export async function linkHackatimeProject(projectId: string, projectNames: string[]) {
  const response = await fetch(`${apiUrl}/api/projects/auth/${projectId}/hackatime-projects`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ projectNames })
  });

  if (response.ok) {
    return true;
  } else {
    return false;
  }
}

// hackatime setup

export async function sendHackatimeOtp(email: string) {
  const response = await fetch(`${apiUrl}/api/user/auth/hackatime-link/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email })
  });

  return response.ok; 
}

export async function verifyHackatimeOtp(otp: string) {
  const response = await fetch(`${apiUrl}/api/user/auth/hackatime-link/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ otp })
  });

  return response.ok;
}