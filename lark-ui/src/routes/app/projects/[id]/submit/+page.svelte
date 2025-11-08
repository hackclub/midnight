<script lang="ts">
  import Button from "$lib/Button.svelte";
  import { page } from "$app/state";
  import { projectPageState } from "../state.svelte";

  const projectId = page.params.id;
  projectPageState.backpage = `/app/projects/${projectId}`;

  let project = projectPageState.project!;

  let formpage = $state(1);

  const TITLE_MAX_LENGTH = 30;
  const DESC_MAX_LENGTH = 300;

  const copy = {
    'personal_website': {
      typeDesc: 'a personal website should be a publicly accesible website',
      playableDesc: 'a personal website should be a publicly accesible website'
    },
    'platformer_game': {
      typeDesc: 'a platformer game should be a game that can be played on a computer or mobile device',
    },
    'website': {
      typeDesc: 'a website should be a publicly accesible website',
    },
    'game': {
      typeDesc: 'a game should be a game that can be played on a computer or mobile device',
    },
    'terminal_cli': {
      typeDesc: 'a terminal cli should be a command line interface that can be run on a computer or mobile device',
    },
    'desktop_app': {
      typeDesc: 'a desktop app should be a application that can be run on a computer or mobile device',
    },
    'mobile_app': {
      typeDesc: 'a mobile app should be a application that can be run on a computer or mobile device',
    },
    'wildcard': {
      typeDesc: 'a wildcard project should be a project that is not one of the other types',
    },
    all: {
      descDesc: 'description',
      repoDesc: 'a repository url should be a publicly accesible git repository',
    },
  };

  let projectScreenshot = project?.screenshotUrl || "";
  let projectTitle = project?.projectTitle || "";
  let projectType = project?.projectType || "wildcard";
  let projectDesc = project?.description || "";
  let projectRepoURL = project?.repoUrl || "";
  let projectPlayableURL = project?.playableUrl || "";

  $effect(() => {
    if (project) {
      projectScreenshot = project.screenshotUrl || "";
      projectType = project.projectType || "wildcard";
      projectTitle = project.projectTitle || "";
      projectDesc = project.description || "";
      projectRepoURL = project.repoUrl || "";
      projectPlayableURL = project.playableUrl || "";
    }
  });

  let incompleteEdits = $state(true);

  let friendlyProjectType = $derived.by(() => {
    if (!project) return "";
    switch (project.projectType) {
      case "personal_website":
        return "Personal Website";
      case "terminal_cli":
        return "Terminal CLI";
      case "desktop_app":
        return "Desktop App";
      case "platformer_game":
        return "Platformer Game";
      case "game":
        return "Game";
      case "mobile_app":
        return "Mobile App";
      case "wildcard":
        return "Wildcard";
      case "website":
        return "Website";
    }
  });

  let projectColor = $derived.by(() => {
    if (!project) return "";
    switch (project.projectType) {
      case "website":
        // case 'personal_website':
        return "#FFBB31";
      // case 'platformer_game':
      case "game":
        return "#ED0F7E";
      case "terminal_cli":
        return "#1385F0";
      case "desktop_app":
        return "#1DCDC2";
      case "mobile_app":
        return "#A313F0";
      default:
        return "#F24B4B";
    }
  });

  $effect(() => {
    incompleteEdits = 
      projectTitle.length === 0 || 
      projectDesc.length === 0 ||
      projectRepoURL.length === 0 ||
      projectPlayableURL.length === 0;
  });
</script> 

{#if formpage == 1}
<div class="project-content">
  <div class="heading">
    <h1 class="project-title">
      Ready to submit <span style="color: {projectColor}"
        >{projectTitle}</span
      >?
    </h1>
  </div>
  <div class="subheading">
    <h2>Fill out this infromation and make sure it looks correct</h2>
    <p>
      You can come back to this page at anytime! Your information will be saved.
    </p>
  </div>
  <div class="project-submit-form">
    <div class="field">
      <p class="label">Screenshot</p>
      <input type="file" id="project-screenshot" class="hidden" accept="image/*"/>
      <label for="project-screenshot" class="screenshot-upload">Upload Screenshot</label>
      {#if projectScreenshot}
        <img src={projectScreenshot} alt="Project Screenshot" class="screenshot-preview" />
      {/if}
    </div>
    <div class="field">
      <label for="project-title">Title</label>
      <input 
        type="text" 
        id="project-title" 
        bind:value={projectTitle} 
        maxlength={TITLE_MAX_LENGTH}
        required 
      />
    </div>
    <div class="field">
      <label for="project-type">Type</label>
      <select id="project-type" bind:value={projectType}>
        <option value="personal_website">Personal Website</option>
        <option value="website">Website</option>
        <option value="game">Game</option>
        <option value="platformer_game">Platformer Game</option>
        <option value="terminal_cli">Terminal CLI</option>
        <option value="desktop_app">Desktop App</option>
        <option value="mobile_app">Mobile App</option>
        <option value="wildcard">Wildcard</option>
      </select>
      <p class="info">{copy[projectType].typeDesc}</p>
    </div>
    <div class="field">
      <label for="project-desc">Description</label>
      <p class="info">{copy.all.descDesc}</p>
      <textarea 
        id="project-desc" 
        bind:value={projectDesc} 
        maxlength={DESC_MAX_LENGTH}
        required
      ></textarea>
    </div>
    <div class="field">
      <label for="project-repo-url">Repository URL</label>
      <p class="info">This needs to be a publicly accessible repository!</p>
      <input 
        type="url" 
        id="project-repo-url" 
        bind:value={projectRepoURL} 
        required
      />
    </div>
    <div class="field">
      <label for="project-playable-url">Live link to your website</label>
      <p class="info">For a game, this should be an itch.io link</p>
      <input 
        type="url" 
        id="project-playable-url" 
        bind:value={projectPlayableURL} 
        required 
      />
    </div>
  </div>
  <Button
    label={incompleteEdits ? "Missing Fields" : "Next"}
    disabled={incompleteEdits}
    onclick={() => formpage++}
  />
</div>
{:else if formpage == 2}
<div class="project-content">
  <div class="heading">
    <h1 class="project-title">
      Ready to submit <span style="color: {projectColor}"
        >{project.projectTitle}</span
      >?
    </h1>
  </div>
  <div class="subheading">
    <h2>Fill out this infromation and make sure it looks correct</h2>
    <p>
      You can come back to this page at anytime! Your information will be saved.
    </p>
  </div>
  <div class="project-submit-form">
    <div class="field">
      <p class="label">Hackatime Projects</p>
      <p class="info">Make sure this information looks accurate!</p>
      <div class="hackatime-projects">
        {#each project.nowHackatimeProjects as hackatimeProject}
          <div class="hackatime-project selected">
            <h2>{hackatimeProject}</h2>
          </div>
        {/each}
        <p class="total">{project.nowHackatimeHours} hours total across all projects</p>
        <button onclick={() => projectPageState.openHackatimeProjectModal = true} class="hackatime-project modify">
          <h2>edit projects</h2>
          <img src='/icons/edit.svg' alt='edit' />
        </button>
      </div>
    </div>
  </div>
  <div class="buttons">
    <Button
      label="← Prev"
      onclick={() => formpage--}
      color="black"
    />
    <Button
      label={incompleteEdits ? "Missing Fields" : "Next"}
      disabled={incompleteEdits}
      onclick={() => formpage++}
    />
  </div>
</div>
{/if}

<style>
  .project-submit-form {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    padding-right: 16px;
    scrollbar-color: white #3b3153;

    height: max-content;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 2px;

    margin-bottom: 12px;

    label, .label {
      font-family: 'PT Sans', sans-serif;
      font-weight: bold;
      font-size: 16px;
      color: white;
      letter-spacing: -0.154px;
    }

    input[type="text"], input[type="url"], textarea, select {
      font-family: 'PT Sans', sans-serif;
      font-size: 16px;
      color: white;

      background-color: #372f4b;
      border-radius: 8px;
      padding: 8px;
      border: none;

      &:focus {
        outline: none;
        background-color: #453b61;
        color: white;
        border: 1px solid white;
      }
    }

    p.info {
      font-family: 'PT Sans', sans-serif;
      font-size: 16px;
      color: white;
      font-style: italic;
      letter-spacing: -0.11px;
      margin: 0;
    }

    #project-title {
      font-size: 32px;
      font-family: 'Moga', sans-serif;
    }

    #project-desc {
      min-height: 160px;
      resize: none;
    }

    .screenshot-upload {
      border: 1px dashed white;
      padding: 32px 0;
      border-radius: 8px;
      background-color: transparent;
      cursor: pointer;
      color: white;
      text-align: center;
      font-family: 'PT Sans', sans-serif;
      font-weight: bold;
      font-size: 14px;
      letter-spacing: -0.154px;
      display: block;
    }

    .screenshot-preview {
      width: 100%;
      border-radius: 8px;
      margin-top: 8px;
    }

    .hidden {
      display: none;
    }
  }

  .heading {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    gap: 8px;
  }

  .subheading {
    font-family: "PT Sans", sans-serif;
    color: white;

    display: flex;
    flex-direction: column;
    gap: 0px;

    margin-bottom: 16px;
  }

  .subheading h2 {
    font-size: 24px;
  }
  .subheading p {
    font-size: 16px;
    font-style: italic;
  }

  .project-title {
    font-family: "Moga", sans-serif;
    font-size: 90px;
    color: white;
    letter-spacing: -0.99px;
    margin: 0;
    line-height: 1;
  }

  .hackatime-projects {
    padding: 8px;
    background-color: #584F71;
    border-radius: 8px;

    display: flex;
    flex-direction: column;
    gap: 8px;

    justify-content: stretch;

    p {
      text-align: center;
      color: white;
      font-family: 'PT Sans', sans-serif;
      font-size: 16px;
      font-weight: bold;
    }
  }

  .hackatime-project {
    padding: 16px;
  }

  .hackatime-project.selected {

    background-color: #FFBB31;

    border-radius: 4px;

    h2 {
      font-family: 'Moga', sans-serif;
      font-size: 32px;
    }
  }

  .hackatime-project.modify {
    background-color: #372F4B;
    color: white;

    cursor: pointer;

    border-radius: 4px;

    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 8px;

    h2 {
      font-family: 'PT Sans', sans-serif;
      font-size: 20px;
    }

    img {
      transition: all 0.5s ease-out;
    }

    &:hover {
      filter: brightness(1.1);

      img {
        rotate: 360deg;
        transition: all 0.5s ease-out;
      }
    }
  }

  .buttons {
    display: flex;
    flex-direction: row;
    gap: 16px;
  }
</style>
