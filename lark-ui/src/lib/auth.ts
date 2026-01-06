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
  isLocked: boolean;
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

export async function deleteProject(projectId: string, fetchFn: FetchFunction = fetch) {
  const response = await fetchFn(`${apiUrl}/api/projects/auth/${projectId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  if (response.ok) {
    return { success: true };
  } else {
    const error = await response.json().catch(() => ({ message: 'Failed to delete project' }));
    return { success: false, error: error.message || 'Failed to delete project' };
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

//recalculate hour counts
export async function recalculateHourCounts(fetchFn: FetchFunction = fetch) {
  const response = await fetchFn(`${apiUrl}/api/user/projects/now-hackatime-hours/recalculate`, {
    method: 'POST',
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

export type ApprovedProject = {
  projectId: number;
  projectTitle: string;
  description: string;
  screenshotUrl: string | null;
  playableUrl: string | null;
  repoUrl: string | null;
  approvedHours: number | null;
  createdAt: string;
  updatedAt: string;
};

export async function getApprovedProjects(fetchFn: FetchFunction = fetch): Promise<ApprovedProject[]> {
  if (!apiUrl) {
    throw new Error('API URL is not configured');
  }

  const response = await fetchFn(`${apiUrl}/api/projects/approved`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (response.ok) {
    const projects = await response.json();
    return projects as ApprovedProject[];
  } else {
    const errorText = await response.text();
    throw new Error(`Failed to fetch approved projects: ${response.status} ${response.statusText} - ${errorText}`);
  }
}

export type LeaderboardEntry = {
  firstName: string;
  hours: number;
  approved: number;
};

export async function getLeaderboard(sortBy: 'hours' | 'approved' = 'hours', fetchFn: FetchFunction = fetch): Promise<LeaderboardEntry[]> {
  if (!apiUrl) {
    throw new Error('API URL is not configured');
  }

  const response = await fetchFn(`${apiUrl}/api/projects/leaderboard?sortBy=${sortBy}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (response.ok) {
    const leaderboard = await response.json();
    return leaderboard as LeaderboardEntry[];
  } else {
    const errorText = await response.text();
    throw new Error(`Failed to fetch leaderboard: ${response.status} ${response.statusText} - ${errorText}`);
  }
}

export type ShopItemVariant = {
  variantId: number;
  itemId: number;
  name: string;
  cost: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ShopItem = {
  itemId: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  cost: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  variants?: ShopItemVariant[];
};

export type ShopBalance = {
  totalApprovedHours: number;
  totalSpent: number;
  balance: number;
};

export type ShopTransaction = {
  transactionId: number;
  userId: number;
  itemId: number;
  variantId: number | null;
  itemDescription: string;
  cost: number;
  createdAt: string;
  item: {
    itemId: number;
    name: string;
    imageUrl: string | null;
  };
  variant?: {
    variantId: number;
    name: string;
  } | null;
};

export async function getShopItems(fetchFn: FetchFunction = fetch): Promise<ShopItem[]> {
  const response = await fetchFn(`${apiUrl}/api/shop/items`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (response.ok) {
    return await response.json();
  }
  return [];
}

export async function getShopItem(itemId: number, fetchFn: FetchFunction = fetch): Promise<ShopItem | null> {
  const response = await fetchFn(`${apiUrl}/api/shop/items/${itemId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (response.ok) {
    return await response.json();
  }
  return null;
}

export async function getShopBalance(fetchFn: FetchFunction = fetch): Promise<ShopBalance | null> {
  const response = await fetchFn(`${apiUrl}/api/shop/auth/balance`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (response.ok) {
    return await response.json();
  }
  return null;
}

export async function checkVerificationStatus(email: string, fetchFn: FetchFunction = fetch): Promise<{ isVerified: boolean; error?: string }> {
  const externalApiUrl = 'https://identity.hackclub.com/api/external/check';
  const checkUrl = `${externalApiUrl}?email=${encodeURIComponent(email)}`;
  
  try {
    const response = await fetchFn(checkUrl);
    
    if (!response.ok) {
      return { isVerified: false, error: 'Failed to check verification status' };
    }
    
    const data = await response.json();
    const isVerified = data.result === 'verified_eligible';
    
    return { isVerified };
  } catch (error) {
    return { isVerified: false, error: 'Failed to check verification status' };
  }
}

export async function purchaseShopItem(itemId: number, variantId?: number, fetchFn: FetchFunction = fetch): Promise<{ success: boolean; error?: string; transaction?: ShopTransaction; newBalance?: ShopBalance; specialAction?: string | null }> {
  const body: { itemId: number; variantId?: number } = { itemId };
  if (variantId) {
    body.variantId = variantId;
  }

  const response = await fetchFn(`${apiUrl}/api/shop/auth/purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  const data = await response.json();
  
  if (response.ok) {
    return { success: true, transaction: data.transaction, newBalance: data.newBalance, specialAction: data.specialAction };
  }
  return { success: false, error: data.error || data.message || 'Purchase failed' };
}

export async function getShopTransactions(fetchFn: FetchFunction = fetch): Promise<ShopTransaction[]> {
  const response = await fetchFn(`${apiUrl}/api/shop/auth/transactions`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (response.ok) {
    return await response.json();
  }
  return [];
}

export async function getAdminShopItems(fetchFn: FetchFunction = fetch): Promise<ShopItem[]> {
  const response = await fetchFn(`${apiUrl}/api/shop/admin/items`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (response.ok) {
    return await response.json();
  }
  return [];
}

export async function createShopItem(item: { name: string; description?: string; imageUrl?: string; cost: number }, fetchFn: FetchFunction = fetch): Promise<{ success: boolean; item?: ShopItem; error?: string }> {
  const response = await fetchFn(`${apiUrl}/api/shop/admin/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(item),
  });

  const data = await response.json();
  
  if (response.ok) {
    return { success: true, item: data };
  }
  return { success: false, error: data.message || 'Failed to create item' };
}

export async function updateShopItem(itemId: number, item: { name?: string; description?: string; imageUrl?: string; cost?: number; isActive?: boolean }, fetchFn: FetchFunction = fetch): Promise<{ success: boolean; item?: ShopItem; error?: string }> {
  const response = await fetchFn(`${apiUrl}/api/shop/admin/items/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(item),
  });

  const data = await response.json();
  
  if (response.ok) {
    return { success: true, item: data };
  }
  return { success: false, error: data.message || 'Failed to update item' };
}

export async function deleteShopItem(itemId: number, fetchFn: FetchFunction = fetch): Promise<{ success: boolean; error?: string }> {
  const response = await fetchFn(`${apiUrl}/api/shop/admin/items/${itemId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (response.ok) {
    return { success: true };
  }
  const data = await response.json();
  return { success: false, error: data.message || 'Failed to delete item' };
}

export type AdminTransaction = {
  transactionId: number;
  userId: number;
  itemId: number;
  variantId: number | null;
  itemDescription: string;
  cost: number;
  createdAt: string;
  user: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  item: {
    itemId: number;
    name: string;
  };
  variant?: {
    variantId: number;
    name: string;
  } | null;
};

export async function getAdminTransactions(fetchFn: FetchFunction = fetch): Promise<AdminTransaction[]> {
  const response = await fetchFn(`${apiUrl}/api/shop/admin/transactions`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (response.ok) {
    return await response.json();
  }
  return [];
}

export async function refundTransaction(transactionId: number, fetchFn: FetchFunction = fetch): Promise<{ success: boolean; error?: string; refundedAmount?: number }> {
  const response = await fetchFn(`${apiUrl}/api/shop/admin/transactions/${transactionId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (response.ok) {
    const data = await response.json();
    return { success: true, refundedAmount: data.refundedAmount };
  }
  const data = await response.json().catch(() => ({}));
  return { success: false, error: data.message || 'Failed to refund transaction' };
}

export async function createShopVariant(itemId: number, variant: { name: string; cost: number }, fetchFn: FetchFunction = fetch): Promise<{ success: boolean; variant?: ShopItemVariant; error?: string }> {
  const response = await fetchFn(`${apiUrl}/api/shop/admin/items/${itemId}/variants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(variant),
  });

  const data = await response.json();
  
  if (response.ok) {
    return { success: true, variant: data };
  }
  return { success: false, error: data.message || 'Failed to create variant' };
}

export async function updateShopVariant(variantId: number, variant: { name?: string; cost?: number; isActive?: boolean }, fetchFn: FetchFunction = fetch): Promise<{ success: boolean; variant?: ShopItemVariant; error?: string }> {
  const response = await fetchFn(`${apiUrl}/api/shop/admin/variants/${variantId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(variant),
  });

  const data = await response.json();
  
  if (response.ok) {
    return { success: true, variant: data };
  }
  return { success: false, error: data.message || 'Failed to update variant' };
}

export async function deleteShopVariant(variantId: number, fetchFn: FetchFunction = fetch): Promise<{ success: boolean; error?: string }> {
  const response = await fetchFn(`${apiUrl}/api/shop/admin/variants/${variantId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (response.ok) {
    return { success: true };
  }
  const data = await response.json();
  return { success: false, error: data.message || 'Failed to delete variant' };
}

// Game API

export type GameResult = {
  won: boolean;
  wager: number;
  payout: number;
  newBalance: number;
  message: string;
};

export type GameStats = {
  totalGames: number;
  wins: number;
  losses: number;
  netHours: number;
};

/**
 * Play buckshot roulette - wagers ALL unspent hours automatically.
 * 50/50 odds, 2x payout on win.
 */
export async function playBuckshotRoulette(fetchFn: FetchFunction = fetch): Promise<{ success: boolean; result?: GameResult; error?: string }> {
  const response = await fetchFn(`${apiUrl}/api/game/buckshot-roulette`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (response.ok) {
    const result = await response.json();
    return { success: true, result };
  }
  
  const data = await response.json().catch(() => ({}));
  return { success: false, error: data.message || 'Failed to play game' };
}

/**
 * Get buckshot roulette statistics for the current user.
 */
export async function getGameStats(fetchFn: FetchFunction = fetch): Promise<GameStats | null> {
  const response = await fetchFn(`${apiUrl}/api/game/buckshot-roulette/stats`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (response.ok) {
    return await response.json();
  }
  return null;
}
