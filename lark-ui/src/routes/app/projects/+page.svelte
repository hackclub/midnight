<script lang="ts">
  import BottomNavigation from '$lib/BottomNavigation.svelte';
  import ProjectCard from '$lib/cards/ProjectCard.svelte';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { env } from '$env/dynamic/public';
  import { checkAuthStatus, getProjects, type Project, type User } from '$lib/auth';
    import BaseCard from '$lib/cards/BaseCard.svelte';
    import NewProjectCard from '$lib/cards/NewProjectCard.svelte';

  let projects: Project[] = [];
  let loading = true;
  let error: string | null = null;
  let user: User | null = null;

  onMount(async () => {
    try {
      user = await checkAuthStatus();
      
      if (!user) {
        await goto('/');
      }

      projects = await getProjects();

      console.log('projects', projects);
    } catch (err) {
      error = err as string;
    } finally {
      loading = false;
    }
  });
</script>

<div class="projects-page">
  <h1 class="page-title">YouR PROJECTS</h1>
  
  {#if loading}
    <div class="loading">Loading projects...</div>
  {:else if error}
    <div class="error">Error: {error}</div>
  {:else}
    <div class="projects-grid">
      {#each projects as project (project.projectId)}
        <div>
          <ProjectCard
            color="#FFBB31"
            title={project.projectTitle}
            href={'/app/projects/' + project.projectId}
          />
          {#if !user?.onboardComplete}
            <img alt="this is your project!" src="/your_project.png" style="width: 140px; margin-top: 0px" />
          {/if}
        </div>
      {/each}
      <NewProjectCard />
      </div>  
  {/if}
  
  <BottomNavigation />
</div>

<style>
  .projects-page {
    position: relative;
    min-height: 100vh;
    background: #453b61;
    padding: 32px 66px 200px;
  }

  .page-title {
    font-family: 'Moga', sans-serif;
    font-size: 90px;
    color: white;
    letter-spacing: -0.99px;
    margin: 0 0 16px 0;
    line-height: 1.5;
  }

  .projects-grid {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    margin-bottom: 60px;
  }

  .card-wrapper {
    cursor: pointer;
    transition: transform 0.2s;
  }

  .card-wrapper:hover {
    transform: translateY(-5px);
  }

  .loading,
  .error,
  .empty {
    font-family: 'PT Sans', sans-serif;
    font-size: 24px;
    color: white;
    text-align: center;
    padding: 60px 20px;
  }

  .error {
    color: #f24b4b;
  }

  @media (max-width: 1200px) {
    .projects-page {
      padding: 32px 40px 200px;
    }
  }

  @media (max-width: 768px) {
    .page-title {
      font-size: 60px;
      margin-bottom: 40px;
    }

    .projects-grid {
      gap: 20px;
      justify-content: center;
    }

    .projects-page {
      padding: 32px 20px 200px;
    }
  }

  @media (max-width: 480px) {
    .page-title {
      font-size: 40px;
      margin-bottom: 30px;
    }

    .projects-grid {
      flex-direction: column;
      align-items: center;
      gap: 15px;
    }
  }
</style>
