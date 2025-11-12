<script lang="ts">
  import Button from "$lib/Button.svelte";
  import { page } from "$app/state";
  import { projectPageState } from "../state.svelte";
  import { createSubmission, updateProject, updateUser, uploadFileCDN, type Project, type User } from "$lib/auth";
    import { goto } from "$app/navigation";

  const projectId = page.params.id;
  projectPageState.backpage = `/app/projects/${projectId}`;

  let project = projectPageState.project!;
  let user = projectPageState.user!;

  let formpage = $state(1);

  const TITLE_MAX_LENGTH = 30;
  const DESC_MAX_LENGTH = 300;

  const copy = {
    personal_website: {
      typeDesc: "a personal website should be a publicly accesible website",
      playableDesc: "a personal website should be a publicly accesible website",
    },
    platformer_game: {
      typeDesc:
        "a platformer game should be a game that can be played on a computer or mobile device",
    },
    website: {
      typeDesc: "a website should be a publicly accesible website",
    },
    game: {
      typeDesc:
        "a game should be a game that can be played on a computer or mobile device",
    },
    terminal_cli: {
      typeDesc:
        "a terminal cli should be a command line interface that can be run on a computer or mobile device",
    },
    desktop_app: {
      typeDesc:
        "a desktop app should be a application that can be run on a computer or mobile device",
    },
    mobile_app: {
      typeDesc:
        "a mobile app should be a application that can be run on a computer or mobile device",
    },
    wildcard: {
      typeDesc:
        "a wildcard project should be a project that is not one of the other types",
    },
    all: {
      descDesc: "description",
      repoDesc:
        "a repository url should be a publicly accesible git repository",
    },
  };

  let projectScreenshot = $state(project?.screenshotUrl || "");
  let projectTitle = $state(project?.projectTitle || "");
  let projectType = $state(project?.projectType || "wildcard");
  let projectDesc = $state(project?.description || "");
  let projectRepoURL = $state(project?.repoUrl || "");
  let projectPlayableURL = $state(project?.playableUrl || "");

  let userFirstName = $state(user?.firstName || "");
  let userLastName = $state(user?.lastName || "");
  let userEmail = $state(user?.email || "");
  let userBirthday = $state(user?.birthday || "");

  let friendlyUserBirthday = $state((new Date(user?.birthday)).toISOString().split('T')[0]);

  let userAddressLine1 = $state(user?.addressLine1 || "");
  let userAddressLine2 = $state(user?.addressLine2 || "");
  let userCity = $state(user?.city || "");
  let userState = $state(user?.state || "");
  let userCountry = $state(user?.country || "");
  let userZipCode = $state(user?.zipCode || "");

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

  let areProjectFieldsComplete = $derived(
    projectScreenshot.length > 0 &&
    projectTitle.length > 0 &&
    projectDesc.length > 0 &&
    projectRepoURL.length > 0 &&
    projectPlayableURL.length > 0
  );

  let areUserFieldsComplete = $derived(
    userFirstName.length > 0 &&
    userLastName.length > 0 &&
    userAddressLine1.length > 0 &&
    userCity.length > 0 &&
    userState.length > 0 &&
    userCountry.length > 0 &&
    userZipCode.length > 0
  );

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

  let error = $state("");
  async function saveProjectData(updatedField: Partial<Project>) {
    projectPageState.project = {
      ...projectPageState.project!,
      ...updatedField,
    };

    if (projectId) {
      const result = await updateProject(projectId, updatedField);

      if (result.error) {
        error = result.error;
        return false;
      } else {
        error = ""
        return true;
      }
    }
    return false;
  }

  async function saveUserData(updatedField: Partial<User>) {
    projectPageState.user = {
      ...projectPageState.user!,
      ...updatedField,
    };

    const result = await updateUser(updatedField);

    if (result.error) {
      error = result.error;
    } else {
      error = ""
    }
  }

  async function submitProject() {
    if (!projectId) return;
    await createSubmission(Number(projectId));
    goto(`/app/projects/${projectId}`)
  }
</script>

{#if formpage == 1}
  <div class="project-content">
    <div class="heading">
      <h1 class="project-title">
        Ready to submit <span style="color: {projectColor}">{projectTitle}</span
        >?
      </h1>
    </div>
    <div class="subheading">
      <h2>Fill out this infromation and make sure it looks correct</h2>
      <p>
        You can come back to this page at anytime! Your information will be
        saved.
      </p>
    </div>
    <div class="project-submit-form">
      <div class="field">
        <p class="label">Screenshot</p>
        <input
          type="file"
          id="project-screenshot"
          class="hidden"
          accept="image/*"
          onchange={async (event) => {
            const fileInput = event.target! as HTMLInputElement;
            const file = fileInput.files![0];

            if (file) {
              const cdnLink = await uploadFileCDN(file);
              if (cdnLink.error) {
                alert(cdnLink.error);
                return;
              }
              projectScreenshot = cdnLink.url;

              await saveProjectData({ screenshotUrl: projectScreenshot });
            }
          }}
        />
        <label for="project-screenshot" class="screenshot-upload">
          {#if projectScreenshot}
            <img
              src={projectScreenshot}
              alt="Project Screenshot"
              class="screenshot-preview"
            />
          {:else}
            Upload Screenshot
          {/if}
        </label>
      </div>
      <div class="field">
        <label for="project-title">Title</label>
        <input
          type="text"
          id="project-title"
          bind:value={projectTitle}
          onfocusout={() => saveProjectData({ projectTitle })}
          maxlength={TITLE_MAX_LENGTH}
          required
        />
      </div>
      <div class="field">
        <label for="project-type">Type</label>
        <select
          id="project-type"
          bind:value={projectType}
          onfocusout={() => saveProjectData({ projectType })}
        >
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
          onfocusout={() => saveProjectData({ description: projectDesc })}
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
          onfocusout={() => saveProjectData({ repoUrl: projectRepoURL })}
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
          onfocusout={() => saveProjectData({ playableUrl: projectPlayableURL })}
          required
        />
      </div>
    </div>
    {#if error} 
      <p class="error">{error}</p>
    {/if}
    <Button
      label={error ? 'Error' : !areProjectFieldsComplete ? "Missing Fields" : "Next →"}
      disabled={!areProjectFieldsComplete || !!error}
      onclick={async () => { 
        if (await saveProjectData({
          projectTitle,
          description: projectDesc,
          repoUrl: projectRepoURL,
          playableUrl: projectPlayableURL
        })) {
          formpage++ 
        }
      }}
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
        You can come back to this page at anytime! Your information will be
        saved.
      </p>
    </div>
    <div class="project-submit-form">
      <div class="field">
        <p class="label">Hackatime Projects</p>
        <p class="info">Make sure this information looks accurate!</p>
        <div class="hackatime-projects">
          {#each projectPageState.linkedHackatimeProjects as hackatimeProject}
            <div class="hackatime-project selected">
              <h2>{hackatimeProject.name}</h2>
              <h4>
                {(hackatimeProject.total_duration / 3600).toFixed(1)} hours
              </h4>
              {#if hackatimeProject.repo}
                <h4>{hackatimeProject.repo}</h4>
              {/if}
            </div>
          {/each}
          <p class="total">
            {projectPageState.project?.nowHackatimeHours} hours total across all
            projects
          </p>
          <button
            onclick={() => (projectPageState.openHackatimeProjectModal = true)}
            class="hackatime-project modify"
          >
            <h2>edit projects</h2>
            <img src="/icons/edit.svg" alt="edit" />
          </button>
        </div>
      </div>
    </div>
    <div class="buttons">
      <Button label="← Prev" onclick={() => formpage--} color="black" />
      <Button
        label="Next →"
        onclick={() => formpage++}
      />
    </div>
  </div>
{:else if formpage == 3}
  <div class="project-content">
    <div class="heading">
      <h1 class="project-title">
        Ready to submit <span style="color: {projectColor}"
          >{project.projectTitle}</span
        >?
      </h1>
    </div>
    <div class="subheading">
      <h2>Let's get to learn more about ya</h2>
      <p>Verify this information is correct and fill out any blank fields.</p>
    </div>

    <div class="project-submit-form">
      <div class="field">
        <label for="user-first-name" class="required">First Name</label>
        <input
          type="text"
          id="user-first-name"
          bind:value={userFirstName}
          onfocusout={() => saveUserData({ firstName: userFirstName })}
          maxlength={TITLE_MAX_LENGTH}
          required
        />
      </div>
      <div class="field">
        <label for="user-last-name" class="required">Last Name</label>
        <input
          type="text"
          id="user-last-name"
          bind:value={userLastName}
          onfocusout={() => saveUserData({ lastName: userLastName })}
          maxlength={TITLE_MAX_LENGTH}
          required
          placeholder="Last Name"
        />
      </div>
      <div class="field">
        <label for="user-email" class="required">Email</label>
        <input
          type="email"
          id="user-email"
          bind:value={userEmail}
          onfocusout={() => saveUserData({ email: userEmail })}
          disabled
          required
          placeholder="Email"
        />
      </div>
      <div class="field">
        <label for="user-birthday" class="required">Birthdate</label>
        <input
          type="date"
          id="user-birthday"
          bind:value={friendlyUserBirthday}
          onfocusout={() => saveUserData({ birthday: new Date(friendlyUserBirthday).toISOString() })}
          required
        />
      </div>
      <div class="divider"></div>
      <div class="field">
        <label for="user-address-line-1" class="required">Address Line 1</label>
        <input
          type="text"
          id="user-address-line-1"
          bind:value={userAddressLine1}
          onfocusout={() => saveUserData({ addressLine1: userAddressLine1 })}
        />
      </div>
      <div class="field">
        <label for="user-address-line-2">Address Line 2</label>
        <input
          type="text"
          id="user-address-line-2"
          bind:value={userAddressLine2}
          onfocusout={() => saveUserData({ addressLine2: userAddressLine2 })}
        />
      </div>
      <div class="field">
        <label for="user-city" class="required">City</label>
        <input
          type="text"
          id="user-city"
          bind:value={userCity}
          onfocusout={() => saveUserData({ city: userCity })}
          required
        />
      </div>
      <div class="field">
        <label for="user-state" class="required">State</label>
        <input
          type="text"
          id="user-state"
          bind:value={userState}
          onfocusout={() => saveUserData({ state: userState })}
          required
        />
      </div>
      <div class="field">
        <label for="user-country" class="required">Country</label>
        <input
          type="text"
          id="user-country"
          bind:value={userCountry}
          onfocusout={() => saveUserData({ country: userCountry })}
          required
        />
      </div>
      <div class="field">
        <label for="user-zip" class="required">Zip Code</label>
        <input
          type="text"
          id="user-zip"
          bind:value={userZipCode}
          onfocusout={() => saveUserData({ zipCode: userZipCode })}
          required
        />
      </div>
    </div>

      <div class="buttons">
        <Button label="← Prev" onclick={() => formpage--} color="black" />
        <Button
          label={!areUserFieldsComplete ? "Missing Fields" : "Submit"}
          disabled={!areUserFieldsComplete}
          onclick={submitProject}
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

    label,
    .label {
      font-family: "PT Sans", sans-serif;
      font-weight: bold;
      font-size: 20px;
      color: white;
      letter-spacing: -0.154px;

      &.required::after {
        content: "*";
        color: red;
      }
    }

    input[type="text"],
    input[type="email"],
    input[type="date"],
    input[type="url"],
    textarea,
    select {
      font-family: "PT Sans", sans-serif;
      font-size: 16px;
      color: white;

      background-color: #372f4b;
      border-radius: 8px;
      padding: 8px;
      border: none;

      color-scheme: dark;
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &:focus {
        outline: none;
        background-color: #453b61;
        color: white;
        border: 1px solid white;
      }
    }

    p.info {
      font-family: "PT Sans", sans-serif;
      font-size: 16px;
      color: white;
      font-style: italic;
      letter-spacing: -0.11px;
      margin: 0;
    }

    #project-title {
      font-size: 32px;
      font-family: "Moga", sans-serif;
    }

    #project-desc {
      min-height: 160px;
      resize: none;
    }

    .screenshot-upload {
      border: 1px dashed white;

      border-radius: 8px;
      background-color: transparent;
      cursor: pointer;
      color: white;

      font-family: "PT Sans", sans-serif;
      font-weight: bold;
      font-size: 14px;
      letter-spacing: -0.154px;
      display: block;

      padding: 8px;

      width: fit-content;
    }

    .screenshot-preview {
      width: 300px;
      height: 200px;
      object-fit: cover;

      border-radius: 4px;
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
    background-color: #584f71;
    border-radius: 8px;

    display: flex;
    flex-direction: column;
    gap: 8px;

    justify-content: stretch;

    p {
      text-align: center;
      color: white;
      font-family: "PT Sans", sans-serif;
      font-size: 16px;
      font-weight: bold;
    }
  }

  .hackatime-project {
    padding: 16px;
  }

  .hackatime-project.selected {
    background-color: #ffbb31;

    border-radius: 4px;

    h2 {
      font-family: "Moga", sans-serif;
      font-size: 32px;
      line-height: 0.8;
      margin-top: 6px;
    }
  }

  .hackatime-project.modify {
    background-color: #372f4b;
    color: white;

    cursor: pointer;

    border-radius: 4px;

    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 8px;

    h2 {
      font-family: "PT Sans", sans-serif;
      font-size: 20px;
    }

    img {
      transition: all 600ms cubic-bezier(0.3, 0.7, 0.4, 1);
    }

    &:hover {
      filter: brightness(1.1);

      img {
        scale: 1.2;
        transition: all 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5);
      }
    }
  }

  .buttons {
    display: flex;
    flex-direction: row;
    gap: 16px;
  }

  .error {
    color: white;
    font-size: 16px;
    font-family: "PT Sans", sans-serif;
    padding: 16px;
    border-radius: 4px;
    background-color: #F24B4B;
  }
</style>
