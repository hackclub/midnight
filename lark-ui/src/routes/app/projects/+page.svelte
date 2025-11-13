<script lang="ts">
  import ProjectCard from '$lib/cards/ProjectCard.svelte';
  import Button from '$lib/Button.svelte';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { env } from '$env/dynamic/public';
  import { checkAuthStatus, getProjects, logout, type Project, type User } from '$lib/auth';
  import BaseCard from '$lib/cards/BaseCard.svelte';
  import NewProjectCard from '$lib/cards/NewProjectCard.svelte';
    import ProgressBar from '$lib/ProgressBar.svelte';

  let projects: Project[] = [];
  let loading = true;
  let error: string | null = null;
  let user: User | null = null;

  async function handleLogout() {
    await logout();
    await goto('/');
  }

  onMount(async () => {
    try {
      user = await checkAuthStatus();
      
      if (!user) {
        await goto('/');
        return;
      }

      projects = await getProjects();

      console.log('projects', projects);

      if (projects.length === 0) {
        await goto('/app/onboarding?from=create');
        return;
      }
    } catch (err) {
      error = err as string;
    } finally {
      loading = false;
    }
  });
</script>

<div class="projects-page">
  <div class="header">
    <h1 class="page-title">YouR PROJECTS</h1>
    <Button label="Logout" onclick={handleLogout} color="red" />
  </div>
  
  <ProgressBar />

  {#if loading}
    <div class="loading">
      <img src="/loading/crow_fly.gif" alt="Loading..." />
    </div>
    {:else if error}
    <div class="error">Error: {error}</div>
    {:else if projects.length === 0}
      <div class="no-projects">
        <h2 class="font-bold">You have no projects yet...</h2>
        <h3 class=""> Create one and it will appear here!</h3>
          <button on:click={() => goto("/app/projects/create")} class="pushable-blue mt-[2vh]">
            <span
              class="front-blue font-['Moga',_sans-serif] text-[#fee1c0] text-[4vh] py-[1vh] text-center text-nowrap tracking-[3.84px] whitespace-pre"
            >
              Create a Project
            </span>
          </button>
      </div>
    {:else}
    <div class="projects-grid">
      {#each projects as project (project.projectId)}
        <div>
          <ProjectCard
            title={project.projectTitle}
            type={project.projectType}
            href={'/app/projects/' + project.projectId}
          />
          {#if !user?.onboardComplete}
            <img alt="this is your project!" src="/handdrawn_text/your_project.png" style="width: 140px; margin-top: 0px" />
          {/if}
        </div>
      {/each}
      <NewProjectCard />
      </div>  
  {/if}
</div>

<style>
  .projects-page {
    position: relative;
    min-height: 100vh;
    background: #453b61;
    padding: 32px 66px 200px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .page-title {
    font-family: 'Moga', sans-serif;
    font-size: 90px;
    color: white;
    letter-spacing: -0.99px;
    margin: 0;
    line-height: 1.5;
  }

  .projects-grid {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    margin-bottom: 60px;
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

  .error {
    color: #f24b4b;
  }

.no-projects {
    font-family: 'PT Sans', sans-serif;
    font-size: 24px;
    color: white;
    text-align: center;
    padding: 60px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .no-projects h2 {
    font-family: 'PT_Serif', serif;
    margin: 0;
    font-size: 7vh;
  }

  .pushable-blue {
    background: #000000;
    border: none;
    border-radius: 18px;
    padding: 0;
    cursor: pointer;
    transform: translateY(8px) translateX(-8px);
    width: fit-content;
  }

  .front-blue {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60px;
    padding: 0 30px;
    border-radius: 18px;
    background: #4b9bf2;
    color: #fee1c0;
    transform: translateY(-8px) translateX(8px);
    transition: transform 600ms cubic-bezier(0.3, 0.7, 0.4, 1);
    width: fit-content;
  }

  @media (max-width: 1200px) {
    .projects-page {
      padding: 32px 40px 200px;
    }
  }

  @media (max-width: 768px) {
    .page-title {
      font-size: 60px;
    }

    .header {
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
    }

    .header {
      margin-bottom: 30px;
    }

    .projects-grid {
      flex-direction: column;
      align-items: center;
      gap: 15px;
    }
  }
</style>
