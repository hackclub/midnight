<script lang="ts">
  import { setContext } from 'svelte';
  import { goto } from '$app/navigation';
  import { getProject, checkAuthStatus } from '$lib/auth';
  import type { Project, User } from '$lib/auth';
  import Button from '$lib/Button.svelte';
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
  
  {@render children()}

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
