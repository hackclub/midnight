<script lang="ts">
  import BottomNavigation from '$lib/BottomNavigation.svelte';
  import { setContext } from 'svelte';
  import { goto } from '$app/navigation';
  import { getProject, checkAuthStatus } from '$lib/auth';
  import type { Project, User } from '$lib/auth';
  import Button from '$lib/Button.svelte';
  import ProjectCardPreview from '$lib/cards/ProjectCardPreview.svelte';
  import HackatimeAccountModal from '$lib/hackatime/HackatimeAccountModal.svelte';
  import HackatimeProjectModal from '$lib/hackatime/HackatimeProjectModal.svelte';

  let { children, data } = $props();

  let user = $state<User>(data.user);
  let project = $state<Project>(data.project);
  let locked = $state(true);

  let openHackatimeAccountModal = $state(false);
  let openHackatimeProjectModal = $state(false);

  async function loadProject() {
    const data = await getProject(project.projectId);
    if (data) {
      project = data;
    }
  }
  
  function goBack() {
    goto('/app/projects');
  }

  const context = {
    get project() { return project; },
    get user() { return user; },
    get locked() { return locked; },
    get openHackatimeAccountModal() { return openHackatimeAccountModal; },
    set openHackatimeAccountModal(value) { openHackatimeAccountModal = value; },
    get openHackatimeProjectModal() { return openHackatimeProjectModal; },
    set openHackatimeProjectModal(value) { openHackatimeProjectModal = value; }
  };
  
  setContext('parent', context);
</script>

<div class="project-page">
  <div class="back-button">
    <Button label="← Back to Projects" onclick={goBack} color='black' />
  </div>
  
  <div class="project-overview">
    <div class="project-card-preview">
      <ProjectCardPreview title={project?.projectTitle || ''} href="#" type={project?.projectType} />
    </div>
    
    <div class="project-content">
      {@render children()}
    </div>
  </div>

  {#if openHackatimeAccountModal}
    <HackatimeAccountModal onClose={async () => {
      const updatedUser = await checkAuthStatus();
      if (updatedUser) user = updatedUser;
      openHackatimeAccountModal = false;
    }} />
  {/if}

  {#if openHackatimeProjectModal}
    <HackatimeProjectModal 
      onClose={async () => {
        await loadProject();
        openHackatimeProjectModal = false;
      }} 
      projectId={project.projectId} 
    />
  {/if}
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
  }
</style>
