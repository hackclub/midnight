<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  let email = '';
  let otp = '';
  let username = '';
  let name = '';
  let birthday = '';
  let projectName = '';
  let projectType = '';
  // Removed manual submission fields - they are now copied from project automatically
  
  // New fields for user creation and editing
  let createUserEmail = '';
  let createUserFirstName = '';
  let createUserLastName = '';
  let updateUserFirstName = '';
  let updateUserLastName = '';
  let updateUserBirthday = '';
  let updateUserAddressLine1 = '';
  let updateUserAddressLine2 = '';
  let updateUserCity = '';
  let updateUserState = '';
  let updateUserCountry = '';
  let updateUserZipCode = '';
  
  // New fields for project editing (removed approvedHours and nowHackatimeHours - not user editable)
  let editProjectId = '';
  let editProjectTitle = '';
  let editProjectDescription = '';
  // hoursJustification is not user-editable
  let editProjectPlayableUrl = '';
  let editProjectRepoUrl = '';
  let editProjectScreenshotUrl = '';
  
  let step = 'login'; // login, otp, profile, dashboard, admin
  let user: any = null;
  let projects: any[] = [];
  let selectedProjectId = '';
  let submissions: any[] = [];
  let editRequests: any[] = [];
  
  let loading = false;
  let message = '';
  let error = '';

  const API_BASE = 'http://localhost:3000';

  onMount(async () => {
    if (browser) {
      await checkAuthStatus();
    }
  });

  async function checkAuthStatus() {
    if (!browser) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/user/auth/me`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        user = userData;
        step = 'dashboard';
        showMainSections();
        updateStatus(true, user);
      } else {
        updateStatus(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      updateStatus(false);
    }
  }

  async function sendOtp() {
    if (!email) return;
    
    loading = true;
    error = '';
    message = '';
    
    try {
      const response = await fetch(`${API_BASE}/api/user/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        step = 'otp';
        message = 'OTP sent to your email';
      } else {
        error = data.message || 'Failed to send OTP';
      }
    } catch (err) {
      error = 'Network error';
    } finally {
      loading = false;
    }
  }

  async function verifyOtp() {
    if (!otp) return;
    
    loading = true;
    error = '';
    message = '';
    
    try {
      const response = await fetch(`${API_BASE}/api/user/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ email, otp })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.user) {
          user = data.user;
          step = 'dashboard';
          await loadProjects();
        } else if (data.isNewUser) {
          step = 'profile';
          message = 'Please complete your profile';
        }
      } else {
        error = data.message || 'Invalid OTP';
      }
    } catch (err) {
      error = 'Network error';
    } finally {
      loading = false;
    }
  }

  async function completeProfile() {
    if (!username || !name || !birthday) return;
    
    loading = true;
    error = '';
    message = '';
    
    try {
      const response = await fetch(`${API_BASE}/api/user/auth/complete-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ username, name, birthday })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        user = data.user;
        step = 'dashboard';
        message = 'Profile completed successfully';
        await loadProjects();
      } else {
        error = data.message || 'Failed to complete profile';
      }
    } catch (err) {
      error = 'Network error';
    } finally {
      loading = false;
    }
  }

  async function createProject() {
    if (!projectName || !projectType) return;
    
    loading = true;
    error = '';
    message = '';
    
    try {
      const response = await fetch(`${API_BASE}/api/projects/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ projectTitle: projectName, projectType })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        projects.push(data);
        projectName = '';
        projectType = '';
        message = 'Project created successfully';
      } else {
        error = data.message || 'Failed to create project';
      }
    } catch (err) {
      error = 'Network error';
    } finally {
      loading = false;
    }
  }

  async function createSubmission() {
    if (!selectedProjectId) return;
    
    loading = true;
    error = '';
    message = '';
    
    try {
      const response = await fetch(`${API_BASE}/api/projects/auth/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ 
          projectId: selectedProjectId
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        message = 'Submission created successfully! Data copied from project.';
        await loadSubmissions();
      } else {
        error = data.message || 'Failed to create submission';
      }
    } catch (err) {
      error = 'Network error';
    } finally {
      loading = false;
    }
  }

  async function loadProjects() {
    try {
      const response = await fetch(`${API_BASE}/api/projects/auth`, {
        credentials: 'include' // Include cookies
      });
      
      if (response.ok) {
        projects = await response.json();
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  }

  async function loadSubmissions() {
    if (!selectedProjectId) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/projects/auth/${selectedProjectId}/submissions`, {
        credentials: 'include' // Include cookies
      });
      
      if (response.ok) {
        submissions = await response.json();
      }
    } catch (err) {
      console.error('Error loading submissions:', err);
    }
  }

  async function logout() {
    try {
      await fetch(`${API_BASE}/api/user/auth/logout`, {
        method: 'POST',
        credentials: 'include' // Include cookies
      });
    } catch (err) {
      console.error('Error logging out:', err);
    }
    
    step = 'login';
    user = null;
    projects = [];
    submissions = [];
    email = '';
    otp = '';
    username = '';
    name = '';
    birthday = '';
    projectName = '';
    projectType = '';
    // Removed manual submission fields - they are now copied from project automatically
    selectedProjectId = '';
    message = '';
    error = '';
  }

  // Onboarding test functions
  async function testCompleteOnboarding() {
    loading = true;
    error = '';
    message = '';
    
    try {
      const response = await fetch(`${API_BASE}/api/user/auth/complete-onboarding`, {
        method: 'POST',
        credentials: 'include' // Include cookies
      });
      
      const data = await response.json();
      
      if (response.ok) {
        message = `Onboarding completed! Status: ${data.user.onboardComplete}`;
      } else {
        error = data.message || 'Failed to complete onboarding';
      }
    } catch (err) {
      error = 'Network error';
    } finally {
      loading = false;
    }
  }

  async function testGetOnboardingStatus() {
    loading = true;
    error = '';
    message = '';
    
    try {
      const response = await fetch(`${API_BASE}/api/user/auth/onboarding-status`, {
        credentials: 'include' // Include cookies
      });
      
      const data = await response.json();
      
      if (response.ok) {
        message = `Onboarding status: ${data.onboardComplete ? 'Completed' : 'Not completed'}`;
      } else {
        error = data.message || 'Failed to get onboarding status';
      }
    } catch (err) {
      error = 'Network error';
    } finally {
      loading = false;
    }
  }

  // New API test functions
  async function createUser() {
    if (!createUserEmail || !createUserFirstName || !createUserLastName) return;
    
    loading = true;
    error = '';
    message = '';
    
    try {
      const response = await fetch(`${API_BASE}/api/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: createUserEmail,
          firstName: createUserFirstName,
          lastName: createUserLastName
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        message = `User created successfully: ${data.firstName} ${data.lastName} (${data.email})`;
        createUserEmail = '';
        createUserFirstName = '';
        createUserLastName = '';
      } else {
        error = data.message || 'Failed to create user';
      }
    } catch (err) {
      error = 'Network error';
    } finally {
      loading = false;
    }
  }

  async function updateUser() {
    loading = true;
    error = '';
    message = '';
    
    try {
      const updateData: any = {};
      if (updateUserFirstName) updateData.firstName = updateUserFirstName;
      if (updateUserLastName) updateData.lastName = updateUserLastName;
      if (updateUserBirthday) updateData.birthday = updateUserBirthday;
      if (updateUserAddressLine1) updateData.addressLine1 = updateUserAddressLine1;
      if (updateUserAddressLine2) updateData.addressLine2 = updateUserAddressLine2;
      if (updateUserCity) updateData.city = updateUserCity;
      if (updateUserState) updateData.state = updateUserState;
      if (updateUserCountry) updateData.country = updateUserCountry;
      if (updateUserZipCode) updateData.zipCode = updateUserZipCode;

      const response = await fetch(`${API_BASE}/api/user`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        message = `User updated successfully: ${data.firstName} ${data.lastName}`;
        // Clear form fields
        updateUserFirstName = '';
        updateUserLastName = '';
        updateUserBirthday = '';
        updateUserAddressLine1 = '';
        updateUserAddressLine2 = '';
        updateUserCity = '';
        updateUserState = '';
        updateUserCountry = '';
        updateUserZipCode = '';
      } else {
        error = data.message || 'Failed to update user';
      }
    } catch (err) {
      error = 'Network error';
    } finally {
      loading = false;
    }
  }

  async function updateProject() {
    if (!editProjectId) return;
    
    loading = true;
    error = '';
    message = '';
    
    try {
      const updateData: any = {};
      if (editProjectTitle) updateData.projectTitle = editProjectTitle;
      if (editProjectDescription) updateData.description = editProjectDescription;
      // hoursJustification is not user-editable
      if (editProjectPlayableUrl) updateData.playableUrl = editProjectPlayableUrl;
      if (editProjectRepoUrl) updateData.repoUrl = editProjectRepoUrl;
      if (editProjectScreenshotUrl) updateData.screenshotUrl = editProjectScreenshotUrl;

      const response = await fetch(`${API_BASE}/api/projects/auth/${editProjectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        message = data.message || `Edit request created successfully. Waiting for admin approval.`;
        // Clear form fields
        editProjectId = '';
        editProjectTitle = '';
        editProjectDescription = '';
        // hoursJustification is not user-editable
        editProjectPlayableUrl = '';
        editProjectRepoUrl = '';
        editProjectScreenshotUrl = '';
        // Reload projects and edit requests
        await loadProjects();
        await loadEditRequests();
      } else {
        error = data.message || 'Failed to create edit request';
      }
    } catch (err) {
      error = 'Network error';
    } finally {
      loading = false;
    }
  }


  // Edit request functions
  async function loadEditRequests() {
    try {
      const response = await fetch(`${API_BASE}/api/edit-requests`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        editRequests = await response.json();
      } else {
        error = 'Failed to load edit requests';
      }
    } catch (err) {
      error = 'Network error';
    }
  }


  function displayProjects() {
    if (!browser) return;
    
    const projectsList = document.getElementById('projectsList');
    if (!projectsList) return;
    
    projectsList.innerHTML = '<h3>Your Projects:</h3>';
    
    if (projects.length === 0) {
      projectsList.innerHTML += '<p>No projects yet. Create one above!</p>';
      return;
    }
    
    projects.forEach(project => {
      const projectDiv = document.createElement('div');
      projectDiv.innerHTML = `
        <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px;">
          <h4>${project.projectTitle}</h4>
          <p><strong>Type:</strong> ${project.projectType}</p>
          <p><strong>Created:</strong> ${new Date(project.createdAt).toLocaleDateString()}</p>
          <p><strong>Submissions:</strong> ${project.submissions?.length || 0}</p>
        </div>
      `;
      projectsList.appendChild(projectDiv);
    });
  }

  function updateSubmissionProjectSelect() {
    if (!browser) return;
    
    const select = document.getElementById('submissionProjectId');
    if (!select) return;
    
    select.innerHTML = '<option value="">Select Project</option>';
    
    projects.forEach(project => {
      const option = document.createElement('option');
      option.value = project.projectId;
      option.textContent = project.projectTitle;
      select.appendChild(option);
    });
  }

  function updateStatus(loggedIn: boolean, user: any = null) {
    if (!browser) return;
    
    const statusEl = document.getElementById('status');
    if (!statusEl) return;
    
    if (loggedIn && user) {
      statusEl.textContent = `Logged in as ${user.name} (${user.email})`;
      statusEl.className = 'status logged-in';
    } else {
      statusEl.textContent = 'Not logged in';
      statusEl.className = 'status logged-out';
    }
  }

  function showMainSections() {
    if (!browser) return;
    
    const projectsSection = document.getElementById('projectsSection');
    const submissionsSection = document.getElementById('submissionsSection');
    
    if (projectsSection) projectsSection.classList.remove('hidden');
    if (submissionsSection) submissionsSection.classList.remove('hidden');
    
    loadProjects();
  }

  function showResponse(element: any, data: any, type: any) {
    if (!element) return;
    
    element.textContent = JSON.stringify(data, null, 2);
    element.className = `response ${type}`;
    element.classList.remove('hidden');
  }

  // Initialize
  updateStatus(false);
</script>

<div class="container">
  <h1>API Test Frontend</h1>
  
  {#if user}
    <div class="status logged-in">
      Logged in as {user.name} ({user.email})
      <div>
        {#if user.role === 'admin'}
          <a href="/login/admin" class="admin-btn">Admin Dashboard</a>
        {/if}
        <button on:click={logout} class="logout-btn">Logout</button>
      </div>
    </div>
  {:else}
    <div class="status logged-out">Not logged in</div>
  {/if}

  {#if message}
    <div class="message success">{message}</div>
  {/if}
  
  {#if error}
    <div class="message error">{error}</div>
  {/if}

  {#if step === 'login'}
    <div class="section">
      <h2>Authentication</h2>
      <form on:submit|preventDefault={sendOtp}>
        <input 
          type="email" 
          bind:value={email} 
          placeholder="Email" 
          required 
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send OTP'}
        </button>
      </form>
    </div>
  {/if}

  {#if step === 'otp'}
    <div class="section">
      <h2>Verify OTP</h2>
      <form on:submit|preventDefault={verifyOtp}>
        <input 
          type="text" 
          bind:value={otp} 
          placeholder="Enter OTP" 
          maxlength="6" 
          required 
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>
    </div>
  {/if}

  {#if step === 'profile'}
    <div class="section">
      <h2>Complete Profile</h2>
      <form on:submit|preventDefault={completeProfile}>
        <input 
          type="text" 
          bind:value={username} 
          placeholder="Username" 
          required 
          disabled={loading}
        />
        <input 
          type="text" 
          bind:value={name} 
          placeholder="Full Name" 
          required 
          disabled={loading}
        />
        <input 
          type="date" 
          bind:value={birthday} 
          required 
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Complete Profile'}
        </button>
      </form>
    </div>
  {/if}

  {#if step === 'dashboard'}
    <div class="section">
      <h2>Create Project</h2>
      <form on:submit|preventDefault={createProject}>
        <input 
          type="text" 
          bind:value={projectName} 
          placeholder="Project Name" 
          required 
          disabled={loading}
        />
        <select bind:value={projectType} required disabled={loading}>
          <option value="">Select Project Type</option>
          <option value="personal_website">Personal Website</option>
          <option value="platformer_game">Platformer Game</option>
          <option value="wildcard">Wildcard</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Project'}
        </button>
      </form>
    </div>

    <div class="section">
      <h2>Onboarding Tests</h2>
      <div style="display: flex; gap: 10px; margin-bottom: 20px;">
        <button on:click={testCompleteOnboarding} disabled={loading}>
          {loading ? 'Testing...' : 'Complete Onboarding'}
        </button>
        <button on:click={testGetOnboardingStatus} disabled={loading}>
          {loading ? 'Testing...' : 'Check Status'}
        </button>
      </div>
    </div>

    <div class="section">
      <h2>Create User (No Auth Required)</h2>
      <form on:submit|preventDefault={createUser}>
        <input 
          type="email" 
          bind:value={createUserEmail} 
          placeholder="Email" 
          required 
          disabled={loading}
        />
        <input 
          type="text" 
          bind:value={createUserFirstName} 
          placeholder="First Name" 
          required 
          disabled={loading}
        />
        <input 
          type="text" 
          bind:value={createUserLastName} 
          placeholder="Last Name" 
          required 
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>

    <div class="section">
      <h2>Update User (Auth Required)</h2>
      <form on:submit|preventDefault={updateUser}>
        <input 
          type="text" 
          bind:value={updateUserFirstName} 
          placeholder="First Name (optional)" 
          disabled={loading}
        />
        <input 
          type="text" 
          bind:value={updateUserLastName} 
          placeholder="Last Name (optional)" 
          disabled={loading}
        />
        <input 
          type="date" 
          bind:value={updateUserBirthday} 
          placeholder="Birthday (optional)" 
          disabled={loading}
        />
        <input 
          type="text" 
          bind:value={updateUserAddressLine1} 
          placeholder="Address Line 1 (optional)" 
          disabled={loading}
        />
        <input 
          type="text" 
          bind:value={updateUserAddressLine2} 
          placeholder="Address Line 2 (optional)" 
          disabled={loading}
        />
        <input 
          type="text" 
          bind:value={updateUserCity} 
          placeholder="City (optional)" 
          disabled={loading}
        />
        <input 
          type="text" 
          bind:value={updateUserState} 
          placeholder="State (optional)" 
          disabled={loading}
        />
        <input 
          type="text" 
          bind:value={updateUserCountry} 
          placeholder="Country (optional)" 
          disabled={loading}
        />
        <input 
          type="text" 
          bind:value={updateUserZipCode} 
          placeholder="Zip Code (optional)" 
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update User'}
        </button>
      </form>
    </div>

    <div class="section">
      <h2>Update Project (Auth Required)</h2>
      <p><strong>Note:</strong> You can only request edits for projects that have at least one submission.</p>
      <form on:submit|preventDefault={updateProject}>
        <select bind:value={editProjectId} required disabled={loading}>
          <option value="">Select Project to Edit</option>
          {#each projects as project}
            {#if (project.submissions?.length || 0) > 0}
              <option value={project.projectId}>{project.projectTitle} (✅ Has submissions)</option>
            {:else}
              <option value={project.projectId} disabled>{project.projectTitle} (⚠️ No submissions yet)</option>
            {/if}
          {/each}
        </select>
        <input 
          type="text" 
          bind:value={editProjectTitle} 
          placeholder="Project Title (optional)" 
          disabled={loading}
        />
        <textarea 
          bind:value={editProjectDescription} 
          placeholder="Description (optional)" 
          disabled={loading}
        ></textarea>
        <input 
          type="url" 
          bind:value={editProjectPlayableUrl} 
          placeholder="Playable URL (optional)" 
          disabled={loading}
        />
        <input 
          type="url" 
          bind:value={editProjectRepoUrl} 
          placeholder="Repository URL (optional)" 
          disabled={loading}
        />
        <input 
          type="url" 
          bind:value={editProjectScreenshotUrl} 
          placeholder="Screenshot URL (optional)" 
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Project'}
        </button>
      </form>
    </div>

    <div class="section">
      <h2>Your Projects</h2>
      {#if projects.length === 0}
        <p>No projects yet. Create one above!</p>
      {:else}
        {#each projects as project}
          <div class="project-card">
            <h3>{project.projectTitle}</h3>
            <p><strong>Type:</strong> {project.projectType}</p>
            <p><strong>Created:</strong> {new Date(project.createdAt).toLocaleDateString()}</p>
            <p><strong>Submissions:</strong> {project.submissions?.length || 0}</p>
            {#if project.isLocked}
              <p><strong>Status:</strong> <span style="color: red;">🔒 Locked</span></p>
            {:else}
              <p><strong>Status:</strong> <span style="color: green;">🔓 Unlocked</span></p>
            {/if}
            {#if (project.submissions?.length || 0) === 0}
              <p><strong>Edit Requests:</strong> <span style="color: orange;">⚠️ Submit first to enable edits</span></p>
            {:else}
              <p><strong>Edit Requests:</strong> <span style="color: green;">✅ Available</span></p>
            {/if}
          </div>
        {/each}
      {/if}
    </div>

    <div class="section">
      <h2>Create Submission</h2>
      <p><strong>Note:</strong> Submission data will be automatically copied from your project. Make sure your project is complete first.</p>
      <form on:submit|preventDefault={createSubmission}>
        <select bind:value={selectedProjectId} required disabled={loading}>
          <option value="">Select Project</option>
          {#each projects as project}
            <option value={project.projectId}>{project.projectTitle}</option>
          {/each}
        </select>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Submit Project'}
        </button>
      </form>
    </div>

    <div class="section">
      <h2>My Edit Requests</h2>
      <button on:click={loadEditRequests} disabled={loading}>
        {loading ? 'Loading...' : 'Load Edit Requests'}
      </button>
      
      {#if editRequests.length > 0}
        <div class="edit-requests-list">
          {#each editRequests as request}
            <div class="edit-request-card">
              <h4>Edit Request #{request.requestId}</h4>
              <p><strong>Type:</strong> {request.requestType}</p>
              <p><strong>Project:</strong> {request.project?.projectTitle}</p>
              <p><strong>Status:</strong> 
                {#if request.status === 'approved'}
                  <span style="color: green;">✅ Approved</span>
                {:else if request.status === 'rejected'}
                  <span style="color: red;">❌ Rejected</span>
                {:else}
                  <span style="color: orange;">⏳ Pending</span>
                {/if}
              </p>
              {#if request.reason}
                <p><strong>Reason:</strong> {request.reason}</p>
              {/if}
              <p><strong>Created:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
            </div>
          {/each}
        </div>
      {:else}
        <p>No edit requests yet.</p>
      {/if}
    </div>

    {#if selectedProjectId}
      <div class="section">
        <h2>Submissions for Selected Project</h2>
        {#if submissions.length === 0}
          <p>No submissions yet.</p>
        {:else}
          {#each submissions as submission}
            <div class="submission-card">
              <h3>Submission #{submission.submissionId}</h3>
              <p><strong>Status:</strong> 
                {#if submission.approvalStatus === 'approved'}
                  <span style="color: green;">✅ Approved</span>
                {:else if submission.approvalStatus === 'rejected'}
                  <span style="color: red;">❌ Rejected</span>
                {:else}
                  <span style="color: orange;">⏳ Pending</span>
                {/if}
              </p>
              {#if submission.approvedHours}
                <p><strong>Approved Hours:</strong> {submission.approvedHours}</p>
              {/if}
              {#if submission.playableUrl}
                <p><strong>Playable URL:</strong> <a href={submission.playableUrl} target="_blank">{submission.playableUrl}</a></p>
              {/if}
              {#if submission.screenshotUrl}
                <p><strong>Screenshot URL:</strong> <a href={submission.screenshotUrl} target="_blank">{submission.screenshotUrl}</a></p>
              {/if}
              {#if submission.description}
                <p><strong>Description:</strong> {submission.description}</p>
              {/if}
              {#if submission.repoUrl}
                <p><strong>Repository:</strong> <a href={submission.repoUrl} target="_blank">{submission.repoUrl}</a></p>
              {/if}
              <p><strong>Created:</strong> {new Date(submission.createdAt).toLocaleDateString()}</p>
            </div>
          {/each}
        {/if}
      </div>

    {/if}
  {/if}
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
  }

  h1 {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
  }

  .status {
    padding: 10px;
    margin: 10px 0;
    border-radius: 5px;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .status.logged-in {
    background-color: #d4edda;
    color: #155724;
  }

  .status.logged-out {
    background-color: #f8d7da;
    color: #721c24;
  }

  .logout-btn {
    background: #dc3545;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 3px;
    cursor: pointer;
  }

  .admin-btn {
    background: #007bff;
    color: white;
    padding: 5px 10px;
    text-decoration: none;
    border-radius: 3px;
    font-size: 14px;
    margin-right: 10px;
    display: inline-block;
  }

  .admin-btn:hover {
    background: #0056b3;
  }

  .message {
    padding: 15px;
    margin: 15px 0;
    border-radius: 5px;
    font-weight: bold;
  }

  .message.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  .message.error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }

  .section {
    margin-bottom: 30px;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #fafafa;
  }

  .section h2 {
    margin-top: 0;
    color: #555;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  input, textarea, select {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
  }

  button {
    padding: 12px 24px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
  }

  button:hover:not(:disabled) {
    background-color: #0056b3;
  }

  button:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }

  .project-card, .submission-card {
    border: 1px solid #ddd;
    padding: 15px;
    margin: 10px 0;
    border-radius: 5px;
    background-color: white;
  }

  .project-card h3, .submission-card h3 {
    margin-top: 0;
    color: #333;
  }

  a {
    color: #007bff;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
</style>