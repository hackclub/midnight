<script lang="ts">
  import Button from "$lib/Button.svelte";
  import posthog from "posthog-js";
  import { page } from "$app/state";
  import { projectPageState } from "../state.svelte";
  import { checkAuthStatus, createSubmission, getProject, updateProject, updateUser, uploadFileCDN, type Project, type User } from "$lib/auth";
  import { goto } from "$app/navigation";
    import { onMount } from "svelte";
  import { browser } from "$app/environment";

  const projectId = page.params.id;
  projectPageState.backpage = `/app/projects/${projectId}`;

  let project = projectPageState.project!;
  let user = projectPageState.user!;

  if (project.submissions.length > 0) {
    onMount(() => goto(`/app/projects/${projectId}`));
    //incomplete functionality :pf:
  }
  
  let formpage = $state(1);

  type Dynamic<T> = {
    [key: string]: T;
  }

  let checklist = $state<Dynamic<boolean>>({
    "You have an experienceable link (a URL where anyone can try your project now)": false,
    "You have a public GitHub URL with all source code": false,
    "You have a screenshot of your project": false,
  })

  switch (project?.projectType) {
    case "personal_website":
    case "website":
      checklist = {
        ...checklist,
        "Your project is deployed on the web (Vercel, Netlify, GitHub Pages, Fly.io, etc.)": false,
        "Your experienceable link loads without errors": false,
        "Core features of your website work; there are no placeholders": false,
        "Your repo includes simple build/deploy instructions": false,
      }
      break;
    case "platformer_game":
    case "game":
      checklist = {
        ...checklist,
        "Your game is published on itch.io with a public page": false,
        "Your game page includes a playable version (WebGL or downloadable build)": false,
        "Your game runs without crashing on startup": false,
        "There is a description and screenshot on your project's itch.io page": false,
      }
      break;
    case 'terminal_cli':
      checklist = {
        ...checklist,
        "Your CLI is installable in one simple command (brew, pip, cargo, or install script)": false,
        "Running the CLI immediately performs the main behavior": false,
        "Clear install instructions in README": false,
        "Example usage shown in README": false
      }
      break;
    case 'desktop_app':
      checklist = {
        ...checklist,
        "(Windows) Downloadable .exe file that successfully launches\n(macOS) Downloadable .dmg or .pkg file that opens/installs\n(Linux) AppImage or package (.deb/.rpm) that launches": false,
        "Clear download link provided": false,
        "Basic instructions for running the app included": false
      }
      break;
    case 'mobile_app':
      checklist = {
        ...checklist,
        "(iOS) Your app is Published on TestFlight with a public invitation link\n(Android) Downloadable .apk file or published on Google Play": false,
        "App opens and core functionality runs without immediate crash": false,
        "Instructions included if any special permissions are required": false,
      }
      break;
  }

  const copy = {
    "personal_website": {
      typeDesc: "A personal website should be your own original site where people can get to know you",
      playableDesc: "This should be a publicly accesible link to your website.",
    },
    "platformer_game": {
      typeDesc: "A platformer game",
      playableDesc: "This should be an link to your game on itch.io."
    },
    "website": {
      typeDesc: "A website should be a ",
      playableDesc: "This should be a publicly accesible link to your website.",
    },
    "game": {
      typeDesc:
        "A game should be a game that can be played on a computer or mobile device",
      playableDesc: "This should be a publicly accesible link to your website.",
    },
    "terminal_cli": {
      typeDesc:
        "A terminal cli should be an installable executable that can be run from and output to a terminal in a Windows, Mac, or Linux computer",
      playableDesc:
        "This should be a link to the package on github releases, homebrew formulae, or other equivalent."      
    },
    "desktop_app": {
      typeDesc:
        "A desktop app should be a GUI application that can be installed and opened on a windows, mac, or linux computer",
      playableDesc:
        "This should be a link to the app's github release."      
    },
    "mobile_app": {
      typeDesc:
        "A mobile app should be a application that can be run on a ios or android device",
      playableDesc:
        "This should be a link to the app's github release or a testflight link (iOS)."      
    },
    "wildcard": {
      typeDesc:
        "A wildcard project should be a project that is not one of the other types",
      playableDesc:
        "This should be an experienceable link (a URL where anyone can try your project now). Make sure to include documentation on how to use it if necessary."
    },
    all: {
      screenshotDesc: "This should be a screenshot of your project working.",
      descDesc: "This should be a 2-4 sentence description of your project. What is it about? What does it do?",
      repoDesc: "This needs to be a publicly accessible GitHub repository!",
    },
  } as Dynamic<any>;

  let projectScreenshot = $state<string>(project?.screenshotUrl || "");
  let projectTitle = $state<string>(project?.projectTitle || "");
  let projectType = $state<string>(project?.projectType || "wildcard");
  let projectDesc = $state<string>(project?.description || "");
  let projectRepoURL = $state<string>(project?.repoUrl || "");
  let projectPlayableURL = $state<string>(project?.playableUrl || "");

  let userFirstName = $state<string>(user?.firstName || "");
  let userLastName = $state<string>(user?.lastName || "");
  let userEmail = $state<string>(user?.email || "");
  let friendlyUserBirthday = $state<string>((new Date(user?.birthday)).toISOString().split('T')[0]);

  let userAddressLine1 = $state<string>(user?.addressLine1 || "");
  let userAddressLine2 = $state<string>(user?.addressLine2 || "");
  let userCity = $state<string>(user?.city || "");
  let userState = $state<string>(user?.state || "");
  let userCountry = $state<string>(user?.country || "");
  let userZipCode = $state<string>(user?.zipCode || "");

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
  let submitting = $state(false);
  
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
      return false;
    } else {
      error = ""
      return true;
    }
  }

  async function submitProject() {
    submitting = true;

    const userResult = await saveUserData({
      firstName: userFirstName,
      lastName: userLastName,
      addressLine1: userAddressLine1,
      city: userCity,
      state: userState,
      country: userCountry,
      zipCode: userZipCode,
    })

    if (!userResult || !projectId) return;
    
    const submitResult = await createSubmission(Number(projectId));

    if (submitResult.error) {
      error = submitResult.error;
      submitting = false;
      return;
    }

    if (browser) {
      posthog.capture('project submitted', {
        projectId,
        projectType: project?.projectType ?? null
      });
    }

    projectPageState.project = await getProject(projectId);
    projectPageState.user = await checkAuthStatus();

    goto(`/app/projects/${projectId}`)
  }
</script>

{#if formpage == 2}
  <div class="project-content">
    <div class="heading">
      <h1 class="project-title">
        Ready to submit <span style="color: {projectColor}">{projectTitle}</span
        >?
      </h1>
    </div>
    <div class="subheading">
      <h2>Fill out this information and make sure it looks correct</h2>
      <p>
        You can come back to this page at anytime! Your information will be
        saved.
      </p>
    </div>
    <div class="project-submit-form">
      <div class="field">
        <p class="label required">Screenshot</p>
        <p class="info">{copy.all.screenshotDesc}</p>
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
                error = cdnLink.error;
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
        <label for="project-title" class="required">Title</label>
        <input
          type="text"
          id="project-title"
          bind:value={projectTitle}
          maxlength=30
          required
        />
      </div>
      <div class="field">
        <label for="project-type" class="required">Type</label>
        <select
          id="project-type"
          bind:value={projectType}
          disabled
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
        <!-- <p class="info">{copy[projectType].typeDesc}</p> -->
      </div>
      <div class="field">
        <label for="project-desc" class="required">Description</label>
        <p class="info">{copy.all.descDesc}</p>
        <textarea
          id="project-desc"
          bind:value={projectDesc}
          maxlength=300
          required
        ></textarea>
      </div>
      <div class="field">
        <label for="project-repo-url" class="required">Repository URL</label>
        <p class="info">{copy.all.repoDesc}</p>
        <input
          type="url"
          id="project-repo-url"
          bind:value={projectRepoURL}
          required
        />
      </div>
      <div class="field">
        <label for="project-playable-url" class="required">Live link to your project</label>
        <p class="info">{copy[projectType].playableDesc}</p>
        <input
          type="url"
          id="project-playable-url"
          bind:value={projectPlayableURL}
          required
        />
      </div>
    </div>
    {#if error} 
      <p class="error">
        Got <i>{error}</i> from server. Please make sure your fields are correct.<br>
        <span style="font-size: 12px;">Are the URLs valid? Is the title under 30 characters and the description under 300 characters?</span>
      </p>
    {/if}
    <div class="buttons">
      <Button label="← Prev" onclick={() => formpage--} color="black" />
      <Button
        label={submitting ? 'loading...' : !areProjectFieldsComplete ? "Missing Fields" : "Next →"}
        disabled={!areProjectFieldsComplete || submitting}
        onclick={async () => { 
          submitting = true;
          if (await saveProjectData({
            projectTitle,
            description: projectDesc,
            repoUrl: projectRepoURL,
            playableUrl: projectPlayableURL,
            screenshotUrl: projectScreenshot
          })) {
            formpage++ 
          }
          submitting = false;
        }}
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
      <h2>Fill out this information and make sure it looks correct</h2>
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
{:else if formpage == 4}
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
          required
        />
      </div>
      <div class="field">
        <label for="user-last-name" class="required">Last Name</label>
        <input
          type="text"
          id="user-last-name"
          bind:value={userLastName}
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
        />
      </div>
      <div class="field">
        <label for="user-address-line-2">Address Line 2</label>
        <input
          type="text"
          id="user-address-line-2"
          bind:value={userAddressLine2}
        />
      </div>
      <div class="field">
        <label for="user-city" class="required">City</label>
        <input
          type="text"
          id="user-city"
          bind:value={userCity}
          required
        />
      </div>
      <div class="field">
        <label for="user-state" class="required">State</label>
        <input
          type="text"
          id="user-state"
          bind:value={userState}
          required
        />
      </div>
      <div class="field">
        <label for="user-country" class="required">Country</label>
        <input
          type="text"
          id="user-country"
          bind:value={userCountry}
          required
        />
      </div>
      <div class="field">
        <label for="user-zip" class="required">Zip Code</label>
        <input
          type="text"
          id="user-zip"
          bind:value={userZipCode}
          required
        />
      </div>

    {#if error} 
      <p class="error">{error}</p>
    {/if}

    </div>
    <div class="buttons">
        <Button label="← Prev" onclick={() => formpage--} color="black" />
        <Button
          label={submitting ? 'submitting...' : !areUserFieldsComplete ? "Missing Fields" : "Submit"}
          disabled={!areUserFieldsComplete || submitting}
          onclick={submitProject}          
        />
    </div>
  </div>
{:else}
  <div class="project-content">
    <div class="heading">
      <h1 class="project-title">
        Ready to submit <span style="color: {projectColor}"
          >{project.projectTitle}</span
        >?
      </h1>
    </div>
    <div class="subheading">
      <h2><strong>Shipped Project Requirements</strong><br>Every project submitted must be fully “shipped.” Use the checklists below to confirm your project qualifies.</h2>
    </div>
    <div class="project-submit-form">
      <form class="checklist">
        {#each Object.keys(checklist) as checklistItem}
          <div class="checklist-item">
            <div class="checkbox-container">
              <input
                type="checkbox"
                id={checklistItem}
                bind:checked={checklist[checklistItem]}
                required
              />
              <div class="checkbox-front" class:checked={checklist[checklistItem]}>
                <p>{checklist[checklistItem] ? '✓' : '✖︎'}</p>
              </div>
            </div>
            <label for={checklistItem} class="required">{checklistItem}</label>
          </div>
        {/each}
      </form>
    </div>
    <div class="buttons">
      <Button
        label={Object.values(checklist).every(Boolean) ? "Next →" : "Missing Fields"}
        disabled={!Object.values(checklist).every(Boolean)}
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

    margin-bottom: 32px;
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
    font-family: "PT Serif", sans-serif;
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
    justify-content: start;
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

    margin-bottom: 8px;
  }

  .checklist {
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-width: 800px;

    padding: 24px;
    border-radius: 16px;
    background-color: #372f4b;
  }

  .checklist-item {
    display: flex;
    justify-content: start;
    align-items: center;
    flex-direction: row;
    gap: 16px;

    label {
      font-family: "PT Sans", sans-serif;
      font-size: 20px;
      color: white;
      text-align: left;
    }
  }

  .checkbox-container {
    position: relative;
    width: 40px;
    height: 40px;
    border: none;
    cursor: pointer;
    background: black;
    border-radius: 10px;
    transform: translateY(2px) translateX(-2px);
  }

  .checkbox-front {
    position: relative;
    width: 40px;
    height: 40px;
    background: #F24B4B;
    border-radius: 8px;
    
    display: flex;
    align-items: center;
    justify-content: center;
    
    transform: translateY(-3px) translateX(3px);
    transition: transform 600ms cubic-bezier(0.3, 0.7, 0.4, 1);
    
    pointer-events: none;

    p {
      font-family: "Moga", sans-serif;
      font-size: 24px;
      color: white;
      margin: 0;
      translate: 0 2px;
    }
  }

  .checkbox-container input[type="checkbox"] {
    position: absolute;
    width: 40px;
    height: 40px;
    opacity: 0;
    cursor: pointer;
    top: 0;
    left: 0;
    margin: 0;
  }

  .checkbox-container:hover .checkbox-front {
    filter: brightness(1.2);
    transform: translateY(-5px) translateX(5px);
    transition: transform 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5);
  }

  .checkbox-front.checked {
    background: #1385F0;
    transform: translateY(0) translateX(0);
  }

  .checkbox-container:hover .checkbox-front.checked {
    transform: translateY(0) translateX(0);
    scale: 1.01;
  }
</style>
