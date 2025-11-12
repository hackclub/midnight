<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { getProject, checkAuthStatus, getLinkedHackatimeProjects } from '$lib/auth';
  import Button from '$lib/Button.svelte';
  import ProjectCardPreview from '$lib/cards/ProjectCardPreview.svelte';
  import HackatimeAccountModal from '$lib/hackatime/HackatimeAccountModal.svelte';
  import HackatimeProjectModal from '$lib/hackatime/HackatimeProjectModal.svelte';
  import { projectPageState } from './state.svelte';

  let { children, data } = $props();

  const projectId = parseInt(page.params.id!);

  // Initialize state if not done already
  if (!projectPageState.user) {
    projectPageState.user = data.user;
  }
  if (!projectPageState.project) {
    projectPageState.project = data.project;
  }
  if (projectPageState.linkedHackatimeProjects.length === 0) {
    projectPageState.linkedHackatimeProjects = data.linkedHackatimeProjects;
  }
  if (projectPageState.projectId === -1 || projectPageState.projectId !== projectId) {
    projectPageState.projectId = projectId;
    projectPageState.user = data.user;
    projectPageState.project = data.project;
    projectPageState.linkedHackatimeProjects = data.linkedHackatimeProjects;
  }

  async function loadProject() {
    const projectData = await getProject(projectPageState.project?.projectId || '');
    if (projectData) {
      projectPageState.project = projectData;
    }
    projectPageState.linkedHackatimeProjects = await getLinkedHackatimeProjects(projectPageState.project?.projectId || '').then(data => data?.projects) || [];
  }
  
  function goBack() {
    goto(projectPageState.backpage);
  }
</script>

<div class="project-page">
  <div class="back-button">
    <Button label={projectPageState.backpage === '/app/projects' ? '← Back to Projects' : '← Back'} onclick={goBack} color='black' />
  </div>
  
  <div class="project-overview">
    <div class="project-card-preview">
      <ProjectCardPreview title={projectPageState.project?.projectTitle || ''} href="#" type={projectPageState.project?.projectType || 'website'} />
    </div>
    
    <div class="project-content">
      {@render children()}
    </div>
  </div>

  {#if projectPageState.openHackatimeAccountModal}
    <HackatimeAccountModal onClose={async () => {
      const updatedUser = await checkAuthStatus();
      if (updatedUser) projectPageState.user = updatedUser;
      projectPageState.openHackatimeAccountModal = false;
    }} />
  {/if}

  {#if projectPageState.openHackatimeProjectModal}
    <HackatimeProjectModal 
      onClose={async () => {
        await loadProject();
        projectPageState.openHackatimeProjectModal = false;
      }} 
      projectId={projectPageState.project?.projectId || ''} 
    />
  {/if}
</div>

<style>
  .project-page {
    position: relative;
    background: #453b61;
    padding: 57px 50px 200px;
    height: max-content;

    scroll-behavior: smooth;
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

    position: sticky;
    top: 142px;
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

      position: initial;
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
