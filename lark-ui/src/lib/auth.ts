import { env } from "$env/dynamic/public";

const apiUrl = env.PUBLIC_API_URL || '';

type FetchFunction = typeof fetch;

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
  hackatimeAccount: string | null;
};

export async function checkAuthStatus(fetchFn: FetchFunction = fetch) {
  const response = await fetchFn(`${apiUrl}/api/user/auth/me`, {
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
}, fetchFn: FetchFunction = fetch) {
  return await fetchFn(`${apiUrl}/api/user`, {
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

export async function completeOnboarding(fetchFn: FetchFunction = fetch) {
  return await fetchFn(`${apiUrl}/api/user/auth/complete-onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
}

export async function logout(fetchFn: FetchFunction = fetch) {
  return await fetchFn(`${apiUrl}/api/user/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
}


// projects
export type ProjectType = 'personal_website' | 'platformer_game' | 'website' | 'game' | 'terminal_cli' | 'desktop_app' | 'mobile_app' | 'wildcard';
export type Project = {
  projectId: string;
  userId: string;
  projectTitle: string;
  projectType: ProjectType;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  nowHackatimeHours: number | null;
  nowHackatimeProjects: string[] | null;
  repoUrl: string | null;
  playableUrl: string | null;
  screenshotUrl: string | null;
};

export async function createProject(data: {
  projectTitle: string;
  projectType: string;
  projectDescription: string;
}, fetchFn: FetchFunction = fetch) {
  const response = await fetchFn(`${apiUrl}/api/projects/auth`, {
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

export async function getProjects(fetchFn: FetchFunction = fetch) {
  const response = await fetchFn(`${apiUrl}/api/projects/auth`, {
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

export async function getProject(id: string, fetchFn: FetchFunction = fetch) {
  const response = await fetchFn(`${apiUrl}/api/projects/auth/${id}`, {
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

export async function updateProject(projectId: string, project: Partial<Project>, fetchFn: FetchFunction = fetch) {
  const response = await fetchFn(`${apiUrl}/api/projects/auth/${projectId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(project)
  });

  if (response.ok) {
    const updatedProject = await response.json();
    return updatedProject.project as Project;
  } else {
    return null;
  }
}

//hackatime

export type HackatimeProject = {
  name: string,
  repo: string,
  total_duration: number
}

export async function checkHackatimeAccount(fetchFn: FetchFunction = fetch) {
  const response = await fetchFn(`${apiUrl}/api/user/hackatime-account`, {
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

export async function getAllHackatimeProjects(fetchFn: FetchFunction = fetch) {
  const response = await fetchFn(`${apiUrl}/api/user/hackatime-projects/all`, {
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

export async function getLinkedHackatimeProjects(projectId: string, fetchFn: FetchFunction = fetch) {
  const response = await fetchFn(`${apiUrl}/api/user/hackatime-projects/linked/${projectId}`, {
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

export async function getUnlinkedHackatimeProjects(fetchFn: FetchFunction = fetch) {
  const response = await fetchFn(`${apiUrl}/api/user/hackatime-projects/unlinked`, {
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

export async function linkHackatimeProjects(projectId: string, projectNames: string[], fetchFn: FetchFunction = fetch) {
  return await fetchFn(`${apiUrl}/api/projects/auth/${projectId}/hackatime-projects`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ projectNames })
  });
}

// hackatime setup

export async function sendHackatimeOtp(email: string, fetchFn: FetchFunction = fetch) {
  const response = await fetchFn(`${apiUrl}/api/user/auth/hackatime-link/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email })
  });

  return response;
}

export async function verifyHackatimeOtp(otp: string, fetchFn: FetchFunction = fetch) {
  const response = await fetchFn(`${apiUrl}/api/user/auth/hackatime-link/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ otp })
  });

  return response;
}

// referral code
export async function getReferralCode(fetchFn: FetchFunction = fetch) {
  const response = await fetchFn(`${apiUrl}/api/user/auth/raffle-pos`, {
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

// OTP auth
export async function requestOTP(email: string, referralCode?: string, fetchFn: FetchFunction = fetch) {
  return await fetchFn(`${apiUrl}/api/user/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, referralCode }),
  });
}

export async function uploadFileCDN(file: File, fetchFn: FetchFunction = fetch) {

}
