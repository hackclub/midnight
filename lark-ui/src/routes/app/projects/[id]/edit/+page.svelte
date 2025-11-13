<script lang="ts">
  import { getProject, updateProject } from '$lib/auth';
  import Button from '$lib/Button.svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { projectPageState } from '../state.svelte';

  const project = projectPageState.project;

  const TITLE_MAX_LENGTH = 30;
  const DESC_MAX_LENGTH = 300;

  let projectTitle = $state('');
  let projectDesc = $state('');
  let projectRepoURL = $state('');
  let projectPlayableURL = $state('');

  $effect(() => {
    if (project) {
      projectTitle = project.projectTitle || '';
      projectDesc = project.description || '';
      projectRepoURL = project.repoUrl || '';
      projectPlayableURL = project.playableUrl || '';
    }
  });

  let incompleteEdits = $state(true);
  let submittingEdits = $state(false);

  const projectId = $derived(page.params.id);

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

  async function submitEdits() {
    if (!projectId) return;
    submittingEdits = true; 
    const updatedProject = {
      projectTitle: projectTitle,
      description: projectDesc,
      repoUrl: projectRepoURL == '' ? null : projectRepoURL,
      playableUrl: projectPlayableURL == '' ? null : projectPlayableURL,
    };

    const result = await updateProject(projectId, updatedProject);
    if (result) {
      projectPageState.project = await getProject(projectId);
      submittingEdits = false;
      goto(`/app/projects/${projectId}`);
    } else {
      submittingEdits = false;
      alert('Error updating project');
    }
  }

  $effect(() => {
    incompleteEdits = projectTitle.length === 0 || projectDesc.length === 0;
  });

  function openHackatimeProjectModal() {
    projectPageState.openHackatimeProjectModal = true;
  }
</script>

<div class="project-details">
  <div class="project-heading">
    <div class="edit-field-wrapper">
      <input
        class="edit project-title"
        bind:value={projectTitle}
        placeholder="Project Title"
        maxlength={TITLE_MAX_LENGTH}
        required
      />
      <div class="char-counter" class:max-reached={projectTitle.length >= TITLE_MAX_LENGTH}>{projectTitle.length}/{TITLE_MAX_LENGTH}</div>
    </div>
    {#if project?.nowHackatimeHours}
      <h2 class="project-time">{project.nowHackatimeHours} hours</h2>
    {/if}
  </div>
  <div class="project-tags">
    <span class="project-tag type">{friendlyProjectType}</span>
    {#each project?.nowHackatimeProjects || [] as hackatimeProjectName}
      <span class="project-tag">linked to <i>{hackatimeProjectName}</i></span>
    {/each}
  </div>
  <div class="edit-field-wrapper">
    <textarea
      class="edit project-description"
      bind:value={projectDesc}
      placeholder="Project Description"
      maxlength={DESC_MAX_LENGTH}
      required
    ></textarea>
    <div class="char-counter" class:max-reached={projectDesc.length >= DESC_MAX_LENGTH}>{projectDesc.length}/{DESC_MAX_LENGTH}</div>
  </div>
  <div class="edit-field-wrapper">
    <input
      class="edit project-url"
      bind:value={projectRepoURL}
      placeholder="Project Repo URL"
      maxlength={DESC_MAX_LENGTH}
    />
    <div class="char-counter" class:max-reached={projectRepoURL.length >= DESC_MAX_LENGTH}>{projectRepoURL.length}/{DESC_MAX_LENGTH}</div>
  </div>
  <div class="edit-field-wrapper">
    <input
      class="edit project-url"
      bind:value={projectPlayableURL}
      placeholder="Project Playable URL"
      maxlength={DESC_MAX_LENGTH}
    />
    <div class="char-counter" class:max-reached={projectPlayableURL.length >= DESC_MAX_LENGTH}>{projectPlayableURL.length}/{DESC_MAX_LENGTH}</div>
  </div>
</div>
<div class="submit-section">
  <Button label="UPDATE HACKATIME PROEJCTS" icon="edit" color="blue" onclick={openHackatimeProjectModal}/>
  <Button label={submittingEdits ? 'updating...' : incompleteEdits ? "Missing Fields" :  "FINISH"} disabled={incompleteEdits || submittingEdits} onclick={submitEdits}/>
</div>

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

  .project-url {
    font-family: 'PT Sans', sans-serif;
    font-size: 20px;
    color: white;
    letter-spacing: -0.2px;
    line-height: 1.5;
    width: 646px;
  }

  .submit-section {
    position: relative;
    
    display: flex;
    flex-direction: row;
    align-items: end;
    gap: 20px;
  }

  .edit {
    background-color: #3B3153;
    border-radius: 8px;
    padding: 8px;
  }

  .project-title.edit {
    margin-bottom: 12px;
    width: 646px;
  } 

  .project-description.edit {
    width: 646px;
    height: 160px;
    resize: none;
    margin-bottom: 8px;
  }

  .edit-field-wrapper {
    position: relative;
    width: fit-content;
    margin-bottom: 12px;
  }

  .edit-field-wrapper input.edit {
    margin-bottom: 0;
  }

  .edit-field-wrapper :not(p) {
    display: block;
  }

  .char-counter {
    position: absolute;
    bottom: 8px;
    right: 8px;
    font-family: 'PT Sans', sans-serif;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    pointer-events: none;
  }

  .char-counter.max-reached {
    color: #f24b4b;
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
