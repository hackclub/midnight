import { env } from "$env/dynamic/public";

const apiUrl = env.PUBLIC_API_URL || '';

type FetchFunction = typeof fetch;

//auth

export type User = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  country: string,
  state: string,
  zipCode: string;
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

export async function updateUser(user: Partial<User>, fetchFn: FetchFunction = fetch) {
  return await fetchFn(`${apiUrl}/api/user`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(user)
  }).then(response => response.json());
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
  submissions: {
    submissionId: number;
    approvedHours: number | null;
    hoursJustification: string | null;
    approvalStatus: string;
    reviewedBy: string | null;
    reviewedAt: string | null;
    createdAt: string;
    updatedAt: string;
  }[]
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

  const updatedProject = await response.json();
  return updatedProject as { 
    project?: Project,
    error?: string 
  };
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

// cdn
export async function uploadFileCDN(file: File, fetchFn: FetchFunction = fetch) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetchFn(`${apiUrl}/api/uploads`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  if (!res.ok) {
    return {
      error: 'File upload failed: ' + await res.text()
    }
  } else {
    return await res.json();
  }
}

// create submission
export async function createSubmission(projectId: number, fetchFn: FetchFunction = fetch) {
  const response = await fetchFn(`${apiUrl}/api/projects/auth/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ projectId })
  });

  const data = await response.json();
  return data as {
    success: boolean;
    error?: string;
  };
}

// get hour counts
export async function getHourCounts(fetchFn: FetchFunction = fetch) {
//api/user/projects/now-hackatime-hours/total
// api/user/projects/approved-hours/total

  const hackatimeHoursResponse = await fetchFn(`${apiUrl}/api/user/projects/now-hackatime-hours/total`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  const approvedHoursResponse = await fetchFn(`${apiUrl}/api/user/projects/approved-hours/total`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  const hackatimeHours = (await hackatimeHoursResponse.json()).totalNowHackatimeHours || 0;
  const approvedHours = (await approvedHoursResponse.json()).totalApprovedHours || 0;

  console.log('hackatimeHours', hackatimeHours);
  console.log('approvedHours', approvedHours);

  return {
    hackatimeHours,
    approvedHours
  };
}
