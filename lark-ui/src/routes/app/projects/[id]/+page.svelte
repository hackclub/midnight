<script lang="ts">
  import type { Project, User } from '$lib/auth';
  import Button from '$lib/Button.svelte';
  import ProjectCardPreview from '$lib/cards/ProjectCardPreview.svelte';
  import { getContext } from 'svelte';
  import { goto } from '$app/navigation';
  import { projectPageState } from './state.svelte';

  const project = projectPageState.project;

  projectPageState.backpage = '/app/projects';
  
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

  function openHackatimeProjectModal() {
    projectPageState.openHackatimeProjectModal = true;
  }
  function openHackatimeAccountModal() {
    projectPageState.openHackatimeAccountModal = true;
  }
</script>

<div class="project-details">
      <div class="project-heading">
        <h1 class="project-title">{projectPageState.project?.projectTitle}</h1>

        {#if projectPageState.project?.nowHackatimeHours}
          <h2 class="project-time">{projectPageState.project.nowHackatimeHours} hours</h2>
        {/if}
      </div>

      <div class="project-tags">
        <span class="project-tag type">{friendlyProjectType}</span>
        {#each projectPageState.linkedHackatimeProjects as hackatimeProject}
          <span class="project-tag">linked to <i>{hackatimeProject.name} - {(hackatimeProject.total_duration / 3600).toFixed(1)} hours</i></span>
        {/each}
      </div>

      <p class="project-description">
        {projectPageState.project?.description}
      </p>

      {#if projectPageState.project?.submissions && projectPageState.project.submissions.length > 0}
        <div class="submission-progress">
          <p>Approval Status: {projectPageState.project.submissions[0].approvalStatus}</p>
          <p>Submitted at {new Date(projectPageState.project.submissions[0].createdAt).toLocaleString()}</p>
        </div>
      {/if}
</div>

{#if projectPageState.user && projectPageState.user.hackatimeAccount}
      {#if projectPageState.project?.submissions && projectPageState.project.submissions.length > 0}
        <div class="submit-section">
          <Button
            label="Submiited"
            disabled
          />
        </div>
      {:else if projectPageState.project?.nowHackatimeProjects && projectPageState.project.nowHackatimeProjects.length > 0}
        <div class="submit-section">
          <Button label="EDIT" icon="edit" color="blue" onclick={() => goto(`/app/projects/${projectPageState.project?.projectId}/edit`)}/>
          <Button label="Submit" onclick={() => goto(`/app/projects/${projectPageState.project?.projectId}/submit`)}/>
        </div>
      {:else}
        <div class="submit-section-inital">
          <Button label="LINK HACKATIME Project" icon="link" color="blue" onclick={openHackatimeProjectModal}/>
          <img alt="required!" src="/handdrawn_text/required.png" style="width: 140px;" />
        </div>
      {/if}
{:else}
  <div class="submit-section-inital">
    <Button label="LINK HACKATIME Account" icon="link" onclick={openHackatimeAccountModal}/>
    <img alt="required!" src="/handdrawn_text/required.png" style="width: 140px;" />
  </div>
{/if}

<style>
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

  .submission-progress {
    padding: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border-radius: 4px;
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
