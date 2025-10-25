<script lang="ts">
  import BottomNavigation from '$lib/BottomNavigation.svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getProject } from '$lib/auth';
  import type { Project } from '$lib/auth';
  
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

<svelte:head>
  <style>
    @font-face {
      font-family: 'Moga';
      src: url('/font/Moga.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    @font-face {
      font-family: 'PT Sans';
      src: url('/font/PTSans-Regular.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    @font-face {
      font-family: 'PT Serif';
      src: url('/font/PTSerif-Regular.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
  </style>
</svelte:head>

<div class="project-page">
  <button class="back-button" onclick={goBack}>
    ← Back to Projects
  </button>
  
  {#if loading}
    <div class="loading">Loading project...</div>
  {:else if error}
    <div class="error">Error: {error}</div>
  {:else if project}
    <div class="project-content">
      <div class="project-card-preview">
        <img src="/card-blah.svg" alt={project.projectTitle} />
      </div>
      
      <div class="project-details">
        <h1 class="project-title">{project.projectTitle}</h1>
        
        <p class="project-time">time spent: 2 hours</p>
        
        <p class="project-description">
          {project.projectDescription}
        </p>
        
        <div class="submit-section">
          <button class="submit-button" disabled={locked}>
            SUBMIT →
            {#if locked}
              <div class="lock-indicator">
                <img src="/lock-circle.svg" alt="Locked" class="lock-circle" />
                <img src="/lock-icon.svg" alt="Locked" class="lock-icon" />
              </div>
            {/if}
          </button>
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

  .project-content {
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

  .project-details {
    flex: 1;
    padding-top: 33px;
  }

  .project-title {
    font-family: 'Moga', sans-serif;
    font-size: 90px;
    color: white;
    letter-spacing: -0.99px;
    margin: 0 0 10px 0;
    line-height: 1.5;
  }

  .project-time {
    font-family: 'PT Serif', serif;
    font-size: 32px;
    color: white;
    letter-spacing: -0.352px;
    margin: 0 0 16px 0;
    line-height: 1.5;
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
  }

  .submit-button {
    position: relative;
    font-family: 'Moga', sans-serif;
    font-size: 48px;
    color: white;
    background: #9a9a9a;
    border: none;
    padding: 0;
    width: 227px;
    height: 67px;
    display: flex;
    align-items: center;
    justify-content: center;
    letter-spacing: -0.528px;
    line-height: 1.5;
    cursor: pointer;
    transition: background 0.2s;
  }

  .submit-button:not(:disabled):hover {
    background: #b0b0b0;
  }

  .submit-button:disabled {
    cursor: not-allowed;
  }

  .lock-indicator {
    position: absolute;
    top: -12px;
    right: -12px;
    width: 48px;
    height: 48px;
    z-index: 1;
  }

  .lock-circle {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .lock-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 24px;
    height: 24px;
  }

  @media (max-width: 1024px) {
    .project-content {
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

    .submit-button {
      font-size: 36px;
      width: 180px;
      height: 56px;
    }
  }

  @media (max-width: 480px) {
    .project-title {
      font-size: 40px;
    }

    .project-time {
      font-size: 20px;
    }

    .submit-button {
      font-size: 28px;
      width: 150px;
      height: 48px;
    }
  }
</style>
