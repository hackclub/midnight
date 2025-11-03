<script lang="ts">
  import BottomNavigation from '$lib/BottomNavigation.svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { checkAuthStatus, getProject } from '$lib/auth';
  import type { Project, User } from '$lib/auth';
  import Button from '$lib/Button.svelte';
  import HackatimeAccountModal from '$lib/hackatime/HackatimeAccountModal.svelte';
  import HackatimeProjectModal from '$lib/hackatime/HackatimeProjectModal.svelte';
    import BaseCard from '$lib/cards/BaseCard.svelte';
    import ProjectCard from '$lib/cards/ProjectCard.svelte';
    import ProjectCardPreview from '$lib/cards/ProjectCardPreview.svelte';

  let loading = $state(true);
  let error = $state<string | null>(null);
  let locked = $state(true);

  let user = $state<User | null>(null);
  let project = $state<Project | null>(null);

  let openHackatimeAccountModal = $state(false);
  let openHackatimeProjectModal = $state(false);
  
  const projectId = $derived(page.params.id);
  
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
        <ProjectCardPreview title={project.projectTitle} href="#" color="#081832" />
      </div>
      
      <div class="project-content">
        <div class="project-details">
          <div class="project-heading">
            <h1 class="project-title">{project.projectTitle}</h1>
            {#if project.nowHackatimeHours}
              <h2 class="project-time">2 hours</h2>
            {/if}
          </div>

          <div class="project-tags">
            <span class="project-tag type">{project.projectType}</span>
            {#each project.nowHackatimeProjects as hackatimeProjectName}
              <span class="project-tag">linked to <i>{hackatimeProjectName}</i></span>
            {/each}
          </div>
          
          <p class="project-description">
            {project.description}
          </p>          
        </div>

        {#if user && user.hackatimeAccount}
          {#if project.nowHackatimeProjects && project.nowHackatimeProjects.length > 0}
            <div class="submit-section">
              <Button label="EDIT" icon="edit" color="blue" onclick={() => openHackatimeProjectModal = true}/>
            </div>
          {:else}
            <div class="submit-section">
              <Button label="LINK HACKATIME Project" icon="link" color="blue" onclick={() => openHackatimeProjectModal = true}/>
            </div>
          {/if}
        {:else}
          <div class="submit-section">
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
      currentHackatimeProjects={project.nowHackatimeProjects}
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
  }

  .submit-section {
    position: relative;
    
    display: flex;
    flex-direction: row;
    align-items: end;
    gap: 4px;
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
