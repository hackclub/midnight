# Login Page API Documentation

This document describes how the `/login` page interacts with the backend API endpoints, including the data it sends and receives.

## Overview

The login page (`/Users/leafd/HackClub/midnight/lark-ui/src/routes/login/+page.svelte`) is a comprehensive authentication and project management interface that handles:

1. **Authentication Flow**: Email-based OTP authentication
2. **Profile Management**: User profile completion for new users
3. **Project Management**: Creating and managing projects
4. **Submission Management**: Creating submissions for projects
5. **Onboarding**: Testing onboarding completion status

## API Base Configuration

```typescript
const API_BASE = 'http://localhost:3002';
```

All API calls include `credentials: 'include'` to maintain session cookies.

## Authentication Endpoints

### 1. Check Authentication Status

**Endpoint**: `GET /api/user/auth/me`

**Purpose**: Check if user is currently authenticated

**Request**:
- Method: GET
- Headers: `credentials: 'include'`
- No body required

**Response**:
```typescript
// Success (200)
{
  userId: string;
  email: string;
  username: string;
  name: string;
  birthday: Date;
  role: string;
  onboardComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Error (401)
{
  message: string;
}
```

**Frontend Usage**:
```typescript
async function checkAuthStatus() {
  const response = await fetch(`${API_BASE}/api/user/auth/me`, {
    credentials: 'include'
  });
  
  if (response.ok) {
    const userData = await response.json();
    user = userData;
    step = 'dashboard';
  }
}
```

### 2. Request OTP

**Endpoint**: `POST /api/user/auth/login`

**Purpose**: Send OTP to user's email for authentication

**Request**:
```typescript
{
  email: string; // Valid email address
}
```

**Response**:
```typescript
// Success (200)
{
  message: "OTP sent to your email";
  sessionId: string;
}

// Error (400/500)
{
  message: string;
}
```

**Frontend Usage**:
```typescript
async function sendOtp() {
  const response = await fetch(`${API_BASE}/api/user/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email })
  });
}
```

### 3. Verify OTP

**Endpoint**: `POST /api/user/auth/verify-otp`

**Purpose**: Verify the OTP code and complete authentication

**Request**:
```typescript
{
  email: string;    // Same email used in login
  otp: string;      // 6-digit OTP code
}
```

**Response**:
```typescript
// Success - Existing User (200)
{
  message: "OTP verified successfully";
  user: {
    userId: string;
    email: string;
    username: string;
    name: string;
  };
  sessionId: string;
}

// Success - New User (200)
{
  message: "OTP verified. Please complete your profile.";
  sessionId: string;
  isNewUser: true;
  email: string;
}

// Error (401)
{
  message: "Invalid or expired OTP";
}
```

**Cookies Set**:
- `sessionId`: HTTP-only cookie for session management
- `email`: HTTP-only cookie for new users (10 minutes expiry)

**Frontend Usage**:
```typescript
async function verifyOtp() {
  const response = await fetch(`${API_BASE}/api/user/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, otp })
  });
  
  if (response.ok) {
    if (data.user) {
      user = data.user;
      step = 'dashboard';
    } else if (data.isNewUser) {
      step = 'profile';
    }
  }
}
```

### 4. Complete Profile

**Endpoint**: `POST /api/user/auth/complete-profile`

**Purpose**: Complete user profile for new users

**Request**:
```typescript
{
  username: string;  // Minimum 3 characters
  name: string;      // Full name
  birthday: string;  // ISO date string (YYYY-MM-DD)
}
```

**Response**:
```typescript
// Success (200)
{
  message: "Profile completed successfully";
  user: {
    userId: string;
    email: string;
    username: string;
    name: string;
  };
}

// Error (400/401)
{
  message: string;
}
```

**Frontend Usage**:
```typescript
async function completeProfile() {
  const response = await fetch(`${API_BASE}/api/user/auth/complete-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, name, birthday })
  });
}
```

### 5. Logout

**Endpoint**: `POST /api/user/auth/logout`

**Purpose**: End user session

**Request**:
- Method: POST
- Headers: `credentials: 'include'`
- No body required

**Response**:
```typescript
{
  message: "Logged out successfully";
}
```

**Cookies Cleared**:
- `sessionId`
- `email`

**Frontend Usage**:
```typescript
async function logout() {
  await fetch(`${API_BASE}/api/user/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  });
  
  // Reset all state
  step = 'login';
  user = null;
  // ... clear all form fields
}
```

## Onboarding Endpoints

### 6. Complete Onboarding

**Endpoint**: `POST /api/user/auth/complete-onboarding`

**Purpose**: Mark user onboarding as complete

**Request**:
- Method: POST
- Headers: `credentials: 'include'`
- No body required

**Response**:
```typescript
// Success (200)
{
  message: "Onboarding completed successfully";
  user: {
    userId: string;
    email: string;
    username: string;
    name: string;
    onboardComplete: boolean;
  };
}
```

### 7. Get Onboarding Status

**Endpoint**: `GET /api/user/auth/onboarding-status`

**Purpose**: Check if user has completed onboarding

**Request**:
- Method: GET
- Headers: `credentials: 'include'`
- No body required

**Response**:
```typescript
// Success (200)
{
  onboardComplete: boolean;
}
```

## User Management Endpoints

### 8. Create User

**Endpoint**: `POST /api/user`

**Purpose**: Create a new user with basic information

**Request**:
```typescript
{
  email: string;        // Required - Valid email address
  firstName: string;    // Required - User's first name
  lastName: string;     // Required - User's last name
}
```

**Response**:
```typescript
// Success (201)
{
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
}

// Error (409)
{
  message: "User with this email already exists";
}
```

**Frontend Usage**:
```typescript
async function createUser() {
  const response = await fetch(`${API_BASE}/api/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe'
    })
  });
}
```

### 9. Update User

**Endpoint**: `PUT /api/user`

**Purpose**: Update user information (requires authentication)

**Request**:
```typescript
{
  firstName?: string;           // Optional - User's first name
  lastName?: string;           // Optional - User's last name
  birthday?: string;           // Optional - ISO date string (YYYY-MM-DD)
  addressLine1?: string;      // Optional - Address line 1
  addressLine2?: string;       // Optional - Address line 2
  city?: string;               // Optional - City
  state?: string;              // Optional - State
  country?: string;            // Optional - Country
  zipCode?: string;            // Optional - Zip code
  airtableRecId?: string;      // Optional - Airtable record ID
}
```

**Response**:
```typescript
// Success (200)
{
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  birthday: Date;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  airtableRecId: string | null;
  updatedAt: Date;
}
```

**Frontend Usage**:
```typescript
async function updateUser() {
  const response = await fetch(`${API_BASE}/api/user`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      firstName: 'Jane',
      lastName: 'Smith',
      birthday: '1995-06-15',
      city: 'San Francisco'
    })
  });
}
```

## Project Management Endpoints

### Project Type Enum

The `projectType` field must be one of the following enum values:

- `personal_website` - For personal website projects
- `platformer_game` - For platformer game projects  
- `wildcard` - For any other type of project

### 10. Create Project

**Endpoint**: `POST /api/projects/auth`

**Purpose**: Create a new project for the authenticated user

**Request**:
```typescript
{
  projectName: string;  // Required
  projectType: 'personal_website' | 'platformer_game' | 'wildcard'; // Required - enum value
}
```

**Response**:
```typescript
// Success (200)
{
  projectId: string;
  userId: string;
  projectName: string;
  projectType: 'personal_website' | 'platformer_game' | 'wildcard';
  createdAt: Date;
  updatedAt: Date;
  user: {
    userId: string;
    username: string;
    name: string;
  };
}
```

**Frontend Usage**:
```typescript
async function createProject() {
  const response = await fetch(`${API_BASE}/api/projects/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ projectName, projectType })
  });
}
```

### 11. Get User Projects

**Endpoint**: `GET /api/projects/auth`

**Purpose**: Retrieve all projects for the authenticated user

**Request**:
- Method: GET
- Headers: `credentials: 'include'`
- No body required

**Response**:
```typescript
// Success (200)
[
  {
    projectId: string;
    userId: string;
    projectName: string;
    projectType: 'personal_website' | 'platformer_game' | 'wildcard';
    createdAt: Date;
    updatedAt: Date;
    submissions: [
      {
        submissionId: string;
        projectId: string;
        playableUrl: string | null;
        imageUrl: string | null;
        description: string | null;
        repoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
      }
    ];
  }
]
```

### 12. Update Project

**Endpoint**: `PUT /api/projects/auth/:id`

**Purpose**: Create an edit request for project information (requires authentication and at least one submission)

**Request**:
```typescript
{
  projectTitle?: string;           // Optional - Project title (max 30 chars)
  description?: string;            // Optional - Project description (max 500 chars)
  playableUrl?: string;           // Optional - Playable URL
  repoUrl?: string;               // Optional - Repository URL
  screenshotUrl?: string;         // Optional - Screenshot URL
  airtableRecId?: string;         // Optional - Airtable record ID
}
```

**Note**: `approvedHours`, `nowHackatimeHours`, and `hoursJustification` are not user-editable and are managed by the system.

**Response**:
```typescript
// Success (200)
{
  message: string;
  editRequest: {
    requestId: number;
    userId: number;
    projectId: number;
    requestType: 'project_update';
    currentData: Record<string, any>;
    requestedData: Record<string, any>;
    status: 'pending';
    reason: string | null;
    reviewedBy: number | null;
    reviewedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    user: {
      userId: number;
      firstName: string;
      lastName: string;
      email: string;
    };
    project: {
      projectId: number;
      projectTitle: string;
      projectType: string;
    };
  };
}

// Error (403) - No submissions
{
  message: "You must submit at least one submission before requesting project edits.";
}
```

**Frontend Usage**:
```typescript
async function updateProject() {
  const response = await fetch(`${API_BASE}/api/projects/auth/${projectId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      projectTitle: 'Updated Project Name',
      description: 'Updated project description',
      playableUrl: 'https://example.com/play'
    })
  });
}
```

### 13. Get Project Details

**Endpoint**: `GET /api/projects/auth/:id`

**Purpose**: Get specific project details

**Request**:
- Method: GET
- Headers: `credentials: 'include'`
- URL Parameter: `id` (projectId)

**Response**:
```typescript
// Success (200)
{
  projectId: string;
  userId: string;
  projectName: string;
  projectType: 'personal_website' | 'platformer_game' | 'wildcard';
  createdAt: Date;
  updatedAt: Date;
  user: {
    userId: string;
    username: string;
    name: string;
  };
  submissions: [
    {
      submissionId: string;
      projectId: string;
      playableUrl: string | null;
      imageUrl: string | null;
      description: string | null;
      repoUrl: string | null;
      createdAt: Date;
      updatedAt: Date;
    }
  ];
}
```

## Submission Management Endpoints

### 14. Create Submission

**Endpoint**: `POST /api/projects/auth/submissions`

**Purpose**: Create a submission for a project. **Important**: This endpoint validates that both user and project are complete, then automatically copies data from the project to create the submission.

**Prerequisites**:
- User must have complete profile: firstName, lastName, email, birthday, addressLine1, city, state, country, zipCode
- Project must have complete data: projectTitle, description, nowHackatimeHours, playableUrl, repoUrl, screenshotUrl

**Request**:
```typescript
{
  projectId: number;        // Required - ID of the project to submit
}
```

**Response**:
```typescript
// Success (200)
{
  submissionId: number;
  projectId: number;
  playableUrl: string;      // Copied from project
  screenshotUrl: string;    // Copied from project
  description: string;      // Copied from project
  repoUrl: string;         // Copied from project
  createdAt: Date;
  updatedAt: Date;
}

// Error (403) - Validation failures
{
  message: "User profile incomplete. Please complete your profile first.";
  // OR
  message: "User address incomplete. Please complete your address information first.";
  // OR
  message: "Project incomplete. Please complete all required project fields first.";
}
```

**Automatic Data Copying**:
- `playableUrl` is automatically copied from project
- `screenshotUrl` is automatically copied from project  
- `description` is automatically copied from project
- `repoUrl` is automatically copied from project
- Users cannot manually specify these fields - they are always copied from the project

**Project Locking**:
- After creating a submission, the project is automatically locked
- Locked projects cannot be edited by users
- Only admins can unlock projects

**Edit Request System**:
- Users can request edits to projects and user profiles
- **Project edit requests require at least one submission** before they can be made
- Edit requests require admin approval before changes are applied
- All edit requests are tracked with status (pending/approved/rejected)
- Admins can approve or reject edit requests with reasons

## Admin Management Endpoints

### 15. Get All Submissions (Admin Only)

**Endpoint**: `GET /api/admin/submissions`

**Purpose**: Get all submissions across all users (admin only)

**Response**:
```typescript
// Success (200)
[
  {
    submissionId: number;
    projectId: number;
    playableUrl: string;
    screenshotUrl: string;
    description: string;
    repoUrl: string;
    approvedHours: number | null;
    hoursJustification: string | null;
    approvalStatus: 'pending' | 'approved' | 'rejected';
    reviewedBy: string | null;
    reviewedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    project: {
      projectId: number;
      projectTitle: string;
      projectType: string;
      isLocked: boolean;
      user: {
        userId: number;
        firstName: string;
        lastName: string;
        email: string;
      };
    };
  }
]
```

### 16. Update Submission (Admin Only)

**Endpoint**: `PUT /api/admin/submissions/:id`

**Purpose**: Update submission approval status, hours, and justification (admin only)

**Request**:
```typescript
{
  approvedHours?: number;           // Optional - Approved hours
  hoursJustification?: string;     // Optional - Hours justification (max 500 chars)
  approvalStatus?: 'pending' | 'approved' | 'rejected';  // Optional - Approval status
}
```

**Response**:
```typescript
// Success (200)
{
  submissionId: number;
  projectId: number;
  playableUrl: string;
  screenshotUrl: string;
  description: string;
  repoUrl: string;
  approvedHours: number | null;
  hoursJustification: string | null;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  reviewedBy: string;
  reviewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  project: {
    projectId: number;
    projectTitle: string;
    projectType: string;
    isLocked: boolean;
    user: {
      userId: number;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}
```

### 17. Unlock Project (Admin Only)

**Endpoint**: `PUT /api/admin/projects/:id/unlock`

**Purpose**: Unlock a project to allow user editing (admin only)

**Response**:
```typescript
// Success (200)
{
  projectId: number;
  projectTitle: string;
  projectType: string;
  isLocked: false;
  user: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  submissions: Submission[];
}
```

## Edit Request Management Endpoints

### 18. Create Edit Request

**Endpoint**: `POST /api/edit-requests`

**Purpose**: Create an edit request for project or user data (requires authentication)

**Request**:
```typescript
{
  projectId: number;                    // Required - Project ID
  requestType: 'project_update' | 'user_update';  // Required - Type of edit request
  currentData: Record<string, any>;    // Required - Current data state
  requestedData: Record<string, any>;  // Required - Requested changes
  reason?: string;                     // Optional - Reason for the request (max 500 chars)
}
```

**Response**:
```typescript
// Success (201)
{
  message: string;
  editRequest: {
    requestId: number;
    userId: number;
    projectId: number;
    requestType: 'project_update' | 'user_update';
    currentData: Record<string, any>;
    requestedData: Record<string, any>;
    status: 'pending';
    reason: string | null;
    reviewedBy: number | null;
    reviewedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    user: {
      userId: number;
      firstName: string;
      lastName: string;
      email: string;
    };
    project: {
      projectId: number;
      projectTitle: string;
      projectType: string;
    };
  };
}
```

### 19. Get User Edit Requests

**Endpoint**: `GET /api/edit-requests`

**Purpose**: Get edit requests for the authenticated user

**Response**:
```typescript
// Success (200)
[
  {
    requestId: number;
    userId: number;
    projectId: number;
    requestType: 'project_update' | 'user_update';
    currentData: Record<string, any>;
    requestedData: Record<string, any>;
    status: 'pending' | 'approved' | 'rejected';
    reason: string | null;
    reviewedBy: number | null;
    reviewedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    project: {
      projectId: number;
      projectTitle: string;
      projectType: string;
    };
    reviewer: {
      userId: number;
      firstName: string;
      lastName: string;
      email: string;
    } | null;
  }
]
```

### 20. Get All Edit Requests (Admin Only)

**Endpoint**: `GET /api/edit-requests/admin`

**Purpose**: Get all edit requests across all users (admin only)

**Response**:
```typescript
// Success (200)
[
  {
    requestId: number;
    userId: number;
    projectId: number;
    requestType: 'project_update' | 'user_update';
    currentData: Record<string, any>;
    requestedData: Record<string, any>;
    status: 'pending' | 'approved' | 'rejected';
    reason: string | null;
    reviewedBy: number | null;
    reviewedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    user: {
      userId: number;
      firstName: string;
      lastName: string;
      email: string;
    };
    project: {
      projectId: number;
      projectTitle: string;
      projectType: string;
    };
    reviewer: {
      userId: number;
      firstName: string;
      lastName: string;
      email: string;
    } | null;
  }
]
```

### 21. Update Edit Request (Admin Only)

**Endpoint**: `PUT /api/edit-requests/:id`

**Purpose**: Approve or reject an edit request (admin only)

**Request**:
```typescript
{
  status?: 'pending' | 'approved' | 'rejected';  // Optional - New status
  reason?: string;                               // Optional - Reason for decision (max 500 chars)
}
```

**Response**:
```typescript
// Success (200)
{
  requestId: number;
  userId: number;
  projectId: number;
  requestType: 'project_update' | 'user_update';
  currentData: Record<string, any>;
  requestedData: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  reason: string | null;
  reviewedBy: number;
  reviewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  user: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  project: {
    projectId: number;
    projectTitle: string;
    projectType: string;
  };
  reviewer: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}
```

**Note**: When an edit request is approved, the changes are automatically applied to the database.

**Frontend Usage**:
```typescript
async function createSubmission() {
  const response = await fetch(`${API_BASE}/api/projects/auth/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ 
      projectId: selectedProjectId,
      playableUrl: playableUrl || undefined,
      imageUrl: imageUrl || undefined,
      description: description || undefined,
      repoUrl: repoUrl || undefined
    })
  });
}
```

### 15. Get Project Submissions

**Endpoint**: `GET /api/projects/auth/:id/submissions`

**Purpose**: Get all submissions for a specific project

**Request**:
- Method: GET
- Headers: `credentials: 'include'`
- URL Parameter: `id` (projectId)

**Response**:
```typescript
// Success (200)
[
  {
    submissionId: string;
    projectId: string;
    playableUrl: string | null;
    imageUrl: string | null;
    description: string | null;
    repoUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  }
]
```

## Authentication Flow

The login page implements a multi-step authentication flow:

1. **Initial State**: User enters email
2. **OTP Request**: System sends OTP to email
3. **OTP Verification**: User enters OTP code
4. **Profile Completion** (New Users): User completes profile with username, name, birthday
5. **Dashboard**: User can create projects and submissions

## Session Management

- **Session Cookies**: HTTP-only cookies maintain authentication state
- **Session Expiry**: 24 hours for main session, 10 minutes for email cookie
- **Security**: Cookies are secure in production, sameSite: 'lax' for cross-origin support

## Error Handling

All endpoints return consistent error responses:
```typescript
{
  message: string; // Human-readable error message
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid session/OTP)
- `403`: Forbidden (access denied)
- `404`: Not Found
- `500`: Internal Server Error

## Frontend State Management

The login page maintains the following state variables:

```typescript
// Form data
let email = '';
let otp = '';
let username = '';
let name = '';
let birthday = '';
let projectName = '';
let projectType = '';
let playableUrl = '';
let imageUrl = '';
let description = '';
let repoUrl = '';

// Application state
let step = 'login'; // login, otp, profile, dashboard
let user = null;
let projects = [];
let selectedProjectId = '';
let submissions = [];

// UI state
let loading = false;
let message = '';
let error = '';
```

## Security Considerations

1. **OTP Expiry**: OTP codes expire after 10 minutes
2. **Session Management**: HTTP-only cookies prevent XSS attacks
3. **Input Validation**: All inputs are validated on both client and server
4. **CORS**: Credentials are included for cross-origin requests
5. **Temporary Users**: New users are created with temporary data until profile completion
