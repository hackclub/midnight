<script lang="ts">
  import BottomNavigation from '$lib/BottomNavigation.svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getProject } from '$lib/auth';
  import type { Project } from '$lib/auth';
    import Button from '$lib/Button.svelte';
  
  let project = $state<Project | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let locked = $state(true);
  
  const projectId = $derived($page.params.id);
  
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
  
  onMount(() => {
    loadProject();
  });
</script>

<div class="project-page">
  <button class="back-button" onclick={goBack}>
    ← Back to Projects
  </button>
  
  {#if loading}
    <div class="loading">Loading project...</div>
  {:else if error}
    <div class="error">Error: {error}</div>
  {:else if project}
    <div class="project-overview">
      <div class="project-card-preview">
        <img src="/card-blah.svg" alt={project.projectTitle} />
      </div>
      
      <div class="project-content">
        <div class="project-details">
          <div class="project-heading">
            <h1 class="project-title">{project.projectTitle}</h1>
            {#if project.nowHackatimeHours}
              <h2 class="project-time">2 hours</h2>
            {/if}
          </div>
          
          <p class="project-description">
            {project.description}
          </p>          
        </div>

          <div class="submit-section">
            <Button label="LINK HACKATIME" disabled={false} icon="link" />
            <img alt="required!" src="/handdrawn_text/required.png" style="width: 140px;" />
          </div>       
      </div>
    </div>
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
    font-family: 'PT Sans', sans-serif;
    font-size: 18px;
    color: white;
    background: transparent;
    border: 2px solid white;
    border-radius: 8px;
    padding: 10px 20px;
    margin-bottom: 30px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .back-button:hover {
    background: white;
    color: #453b61;
  }

  .loading,
  .error {
    font-family: 'PT Sans', sans-serif;
    font-size: 24px;
    color: white;
    text-align: center;
    padding: 60px 20px;
  }

  .error {
    color: #f24b4b;
  }

  .project-overview {
    display: flex;
    gap: 47px;
  }

  .project-card-preview {
    width: 367px;
    height: 546px;
    flex-shrink: 0;
  }

  .project-card-preview img {
    width: 100%;
    height: 100%;
  }

  .project-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .project-details {
    flex: 1;
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
    font-size: 16px;
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
