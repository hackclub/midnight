<script lang="ts">
  import BottomNavigation from '$lib/BottomNavigation.svelte';
  import { onMount, setContext } from 'svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { checkAuthStatus, getProject } from '$lib/auth';
  import type { Project, User } from '$lib/auth';
  import Button from '$lib/Button.svelte';
  import HackatimeAccountModal from '$lib/hackatime/HackatimeAccountModal.svelte';
  import HackatimeProjectModal from '$lib/hackatime/HackatimeProjectModal.svelte';

  let { children } = $props();

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
  
  {#if loading}
    <div class="loading">
      <img src="/loading/crow_fly.gif" alt="Loading..." />
    </div>
  {:else if error}
    <div class="error">Error: {error}</div>
  {:else if project && user}
    {@render children()}
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
