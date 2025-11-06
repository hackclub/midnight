<script lang="ts">
  import BottomNavigation from '$lib/BottomNavigation.svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { checkAuthStatus, getProject, updateProject } from '$lib/auth';
  import type { Project, User } from '$lib/auth';
  import Button from '$lib/Button.svelte';
  import HackatimeAccountModal from '$lib/hackatime/HackatimeAccountModal.svelte';
  import HackatimeProjectModal from '$lib/hackatime/HackatimeProjectModal.svelte';
  import ProjectCardPreview from '$lib/cards/ProjectCardPreview.svelte';

  let loading = $state(true);
  let error = $state<string | null>(null);
  let locked = $state(true);

  let user = $state<User | null>(null);

  let project = $state<Project | null>(null);
  
  let projectTitle = $derived(project?.projectTitle || '');
  let projectDesc = $derived(project?.description || '');
  let projectRepoURL = $derived(project?.repoUrl || '');
  let projectPlayableURL = $derived(project?.playableUrl || '');

  let openHackatimeAccountModal = $state(false);
  let openHackatimeProjectModal = $state(false);

  const TITLE_MAX_LENGTH = 30;
  const DESC_MAX_LENGTH = 300;

  let editing = $state(false);
  let incompleteEdits = $state(true);
  let submittingEdits = $state(false);

  const projectId = $derived(page.params.id);
  
  let friendlyProjectType = $derived.by(() => {
    if (!project) return '';
    switch (project.projectType) {
      case 'personal_website':
        return 'Personal Website';
      case 'terminal_cli':
        return 'Terminal CLI';
      case 'desktop_app':
        return 'Desktop App';
      case 'platformer_game':
        return 'Platformer Game';
      case 'game':
        return 'Game';
      case 'mobile_app':
        return 'Mobile App';
      case 'wildcard':
        return 'Wildcard';
      case 'website':
        return 'Website';    
    }
  });

  async function loadProject() {
    if (!projectId) return;
    
    try {
      const data = await getProject(projectId);
      if (data) {
        project = data;
        // TODO: Determine if project is locked based on submissions
        locked = true;
      } else {
        error = 'Project not found';
      }
      loading = false;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      loading = false;
    }
  }
  
  function goBack() {
    goto('/app/projects');
  }

  async function submitEdits() {
    if (!projectId) return;
    submittingEdits = true; 
    const updatedProject = {
      projectTitle: projectTitle,
      description: projectDesc,
      repoUrl: projectRepoURL == '' ? null : projectRepoURL,
      playableUrl: projectPlayableURL == '' ? null : projectPlayableURL,
    };
    await updateProject(projectId, updatedProject);
    submittingEdits = false;
    editing = false;
  }

  $effect(() => {
    incompleteEdits = projectTitle.length === 0 || projectDesc.length === 0;
  })
  
  onMount(async () => {
    user = await checkAuthStatus();

    if (!user) {
      goto('/');
      return;
    }

    await loadProject();
  });
</script>

<div class="project-page">
  <div class="back-button">
    <Button label="← Back to Projects" onclick={goBack} color='black' />
  </div>
  
  {#if loading}
    <div class="loading">
      <img src="/loading/crow_fly.gif" alt="Loading..." />
    </div>
  {:else if error}
    <div class="error">Error: {error}</div>
  {:else if project}
    <div class="project-overview">
      <div class="project-card-preview">
        <ProjectCardPreview title={projectTitle} href="#" type={project.projectType} />
      </div>
      
      <div class="project-content">
        <div class="project-details">
          <div class="project-heading">
            {#if editing}
              <div class="edit-field-wrapper">
                <input
                  class="edit project-title"
                  bind:value={projectTitle}
                  placeholder="Project Title"
                  maxlength={TITLE_MAX_LENGTH}
                  required
                />
                <div class="char-counter" class:max-reached={projectTitle.length >= TITLE_MAX_LENGTH}>{projectTitle.length}/{TITLE_MAX_LENGTH}</div>
              </div>
            {:else}
              <h1 class="project-title">{projectTitle}</h1>
            {/if}

            {#if project.nowHackatimeHours}
              <h2 class="project-time">{project.nowHackatimeHours} hours</h2>
            {/if}
          </div>

          <div class="project-tags">
            <span class="project-tag type">{friendlyProjectType}</span>
            {#each project.nowHackatimeProjects as hackatimeProjectName}
              <span class="project-tag">linked to <i>{hackatimeProjectName}</i></span>
            {/each}
          </div>

          {#if editing}
            <div class="edit-field-wrapper">
              <textarea
                class="edit project-description"
                bind:value={projectDesc}
                placeholder="Project Description"
                maxlength={DESC_MAX_LENGTH}
                required
              ></textarea>
              <div class="char-counter" class:max-reached={projectDesc.length >= DESC_MAX_LENGTH}>{projectDesc.length}/{DESC_MAX_LENGTH}</div>
            </div>
            <div class="edit-field-wrapper">
              <input
                class="edit project-url"
                bind:value={projectRepoURL}
                placeholder="Project Repo URL"
                maxlength={DESC_MAX_LENGTH}
              />
              <div class="char-counter" class:max-reached={projectRepoURL.length >= DESC_MAX_LENGTH}>{projectRepoURL.length}/{DESC_MAX_LENGTH}</div>
            </div>
            <div class="edit-field-wrapper">
              <input
                class="edit project-url"
                bind:value={projectPlayableURL}
                placeholder="Project Playable URL"
                maxlength={DESC_MAX_LENGTH}
              />
              <div class="char-counter" class:max-reached={projectPlayableURL.length >= DESC_MAX_LENGTH}>{projectPlayableURL.length}/{DESC_MAX_LENGTH}</div>
            </div>
          {:else}
            <p class="project-description">
              {projectDesc}
            </p>          
          {/if}
        </div>

        {#if user && user.hackatimeAccount}
          {#if editing}
            <div class="submit-section">
              <Button label="UPDATE HACKATIME PROEJCTS" icon="edit" color="blue" onclick={() => openHackatimeProjectModal = true}/>
              <Button label={submittingEdits ? 'updating...' : incompleteEdits ? "Missing Fields" :  "FINISH"} disabled={incompleteEdits || submittingEdits} onclick={submitEdits}/>
            </div>
          {:else if project.nowHackatimeProjects && project.nowHackatimeProjects.length > 0}
            <div class="submit-section">
              <Button label="EDIT" icon="edit" color="blue" onclick={() => editing = true}/>
            </div>
          {:else}
            <div class="submit-section-inital">
              <Button label="LINK HACKATIME Project" icon="link" color="blue" onclick={() => openHackatimeProjectModal = true}/>
              <img alt="required!" src="/handdrawn_text/required.png" style="width: 140px;" />
            </div>
          {/if}
        {:else}
          <div class="submit-section-inital">
            <Button label="LINK HACKATIME Account" icon="link" onclick={() => openHackatimeAccountModal = true}/>
            <img alt="required!" src="/handdrawn_text/required.png" style="width: 140px;" />
          </div>
        {/if}
      </div>
    </div>
  {/if}

  {#if openHackatimeAccountModal}
    <HackatimeAccountModal onClose={async () => {
      user = await checkAuthStatus();
      openHackatimeAccountModal = false;
    }} />
  {/if}

  {#if openHackatimeProjectModal && project}
    <HackatimeProjectModal 
      onClose={async () => {
        await loadProject();
        openHackatimeProjectModal = false;
      }} 
      projectId={project.projectId} 
    />
  {/if}

  <BottomNavigation />
</div>

<style>
  .project-page {
    position: relative;
    min-height: 100vh;
    background: #453b61;
    padding: 57px 50px 200px;
  }

  .back-button {
    margin-bottom: 30px;
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
  }

  .loading img {
    image-rendering: pixelated;
    width: 250px;
    height: auto;
  }

  .error {
    font-family: 'PT Sans', sans-serif;
    font-size: 24px;
    color: #f24b4b;
    text-align: center;
    padding: 60px 20px;
  }

  .project-overview {
    display: flex;
    gap: 48px;
  }

  .project-card-preview {
    width: 367px;
    height: 546px;
    flex-shrink: 0;
  }

  .project-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .project-details {
    flex: 1;
  }

  .project-tags {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
  }

  .project-tag {
    font-family: 'PT Sans', sans-serif;
    font-size: 16px;
    color: white;
    letter-spacing: -0.176px;
    line-height: 1.5;
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  .project-heading {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    gap: 8px;
  }

  .project-title {
    font-family: 'Moga', sans-serif;
    font-size: 90px;
    color: white;
    letter-spacing: -0.99px;
    margin: 0;
    line-height: 1;
  }

  .project-time {
    font-family: 'Moga', serif;
    font-size: 40px;
    color: white;
    letter-spacing: -0.352px;
    margin: 0;
    line-height: 1;
    padding-bottom: 2px;
  }

  .project-description {
    font-family: 'PT Sans', sans-serif;
    font-size: 20px;
    color: white;
    letter-spacing: -0.176px;
    line-height: 1.5;
    margin: 0 0 50px 0;
    max-width: 646px;
    max-height: 160px;
  }

  .project-url {
    font-family: 'PT Sans', sans-serif;
    font-size: 20px;
    color: white;
    letter-spacing: -0.2px;
    line-height: 1.5;

    width: 646px;
  }

  .submit-section {
    position: relative;
    
    display: flex;
    flex-direction: row;
    align-items: end;
    gap: 20px;
  }

  .submit-section-inital {
    position: relative;
    
    display: flex;
    flex-direction: row;
    align-items: end;
    gap: 4px;
  }

  .edit {
    background-color: #3B3153;
    border-radius: 8px;

    padding: 8px;
  }

  .project-title.edit {
    margin-bottom: 12px;
    width: 646px;
  } 

  .project-description.edit {
    width: 646px;
    height: 160px;
    resize: none;
    margin-bottom: 8px;
  }

  .edit-field-wrapper {
    position: relative;
    width: fit-content;
    margin-bottom: 12px;
  }

  .edit-field-wrapper input.edit {
    margin-bottom: 0;
  }

  .edit-field-wrapper :not(p) {
    display: block;
  }

  .char-counter {
    position: absolute;
    bottom: 8px;
    right: 8px;
    font-family: 'PT Sans', sans-serif;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    pointer-events: none;
  }

  .char-counter.max-reached {
    color: #f24b4b;
  }

  @media (max-width: 1024px) {
    .project-overview {
      flex-direction: column;
    }

    .project-card-preview {
      width: 100%;
      max-width: 367px;
      height: auto;
      aspect-ratio: 367 / 546;
    }
  }

  @media (max-width: 768px) {
    .project-page {
      padding: 30px 20px 200px;
    }

    .back-button {
      font-size: 16px;
      padding: 8px 16px;
    }

    .project-title {
      font-size: 60px;
    }

    .project-time {
      font-size: 24px;
    }

    .project-description {
      font-size: 14px;
    }
  }

  @media (max-width: 480px) {
    .project-title {
      font-size: 40px;
    }

    .project-time {
      font-size: 20px;
    }
  }
</style>
