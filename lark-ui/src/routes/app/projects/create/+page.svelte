<script lang="ts">
  import { onMount } from 'svelte';
  import posthog from 'posthog-js';
  import { browser } from '$app/environment';
    import { checkAuthStatus, createProject } from '$lib/auth';
    import { goto } from '$app/navigation';
    import Button from '$lib/Button.svelte';
  
  let projectName = '';
  let projectDescription = '';
  let projectType = 'website';
  let isSubmitting = false;
  let backHref = '/app/projects/select';
  let returnTo = '';
  let onboardedBefore = false;
  
  $: formConfig = {
    personal_website: {
      title: 'CREATE YOUR WEBSITE',
      namePlaceholder: 'Website Name *',
      descriptionPlaceholder: 'Website Description *'
    },
    platformer_game: {
      title: 'CREATE YOUR GAME',
      namePlaceholder: 'Game Name *',
      descriptionPlaceholder: 'Game Description *'
    },
    website: {
      title: 'CREATE YOUR WEBSITE',
      namePlaceholder: 'Website Name *',
      descriptionPlaceholder: 'Website Description *'
    },
    game: {
      title: 'CREATE YOUR GAME',
      namePlaceholder: 'Game Name *',
      descriptionPlaceholder: 'Game Description *'
    },
    terminal_cli: {
      title: 'CREATE YOUR TERMINAL APP',
      namePlaceholder: 'CLI App Name *',
      descriptionPlaceholder: 'CLI App Description *'
    },
    cli: {
      title: 'CREATE YOUR TERMINAL APP',
      namePlaceholder: 'CLI App Name *',
      descriptionPlaceholder: 'CLI App Description *'
    },
    desktop_app: {
      title: 'CREATE YOUR DESKTOP APP',
      namePlaceholder: 'Desktop App Name *',
      descriptionPlaceholder: 'Desktop App Description *'
    },
    mobile_app: {
      title: 'CREATE YOUR MOBILE APP',
      namePlaceholder: 'Mobile App Name *',
      descriptionPlaceholder: 'Mobile App Description *'
    },
    wildcard: {
      title: 'CREATE YOUR PROJECT',
      namePlaceholder: 'Project Name *',
      descriptionPlaceholder: 'Project Description *'
    }
  };
  
  $: config = formConfig[projectType as keyof typeof formConfig] || formConfig.wildcard;
  
  const typeMapping: Record<string, string> = {
    cli: 'terminal_cli'
  };
  
  function getApiProjectType(uiType: string): string {
    return typeMapping[uiType] || uiType;
  }
  
  onMount(async () => {
    const authStatus = await checkAuthStatus();
    onboardedBefore = authStatus?.onboardComplete ?? false;

    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type');
    const fromParam = urlParams.get('from');
    const returnParam = urlParams.get('return');
    if (typeParam && formConfig[typeParam as keyof typeof formConfig]) {
      projectType = typeParam;
    } else {
      projectType = 'wildcard';
    }

    if (fromParam === 'onboarding') {
      if (returnParam === 'select' || (document.referrer && document.referrer.includes('/app/projects/select'))) {
        backHref = '/app/projects/select?from=onboarding';
      } else {
        backHref = '/app/onboarding?from=create';
      }
    } else if (document.referrer && document.referrer.includes('/app/onboarding')) {
      backHref = '/app/onboarding?from=create';
    } else {
      backHref = '/app/projects/select';
    }
  });
  
  async function handleSubmit(event: Event) {
    event.preventDefault();
    
    if (isSubmitting) {
      return;
    }
    
    isSubmitting = true;
    
    try {
      console.log('Creating project:', { 
        type: projectType,
        name: projectName, 
        description: projectDescription 
      });

      const project = await createProject({
        projectTitle: projectName,
        projectType: getApiProjectType(projectType),
        projectDescription: projectDescription
      });

      if (project) {
        if (browser) {
          posthog.capture('project created', {
            projectId: project.projectId,
            projectType: getApiProjectType(projectType)
          });
        }

        if (!onboardedBefore) {
          const updatedStatus = await checkAuthStatus();
          if (updatedStatus?.onboardComplete) {
            onboardedBefore = true;
            if (browser) {
              posthog.capture('onboarding completed', {
                projectId: project.projectId
              });
            }
          }
        }

        goto(`/app/projects/${project.projectId}`);
      } else {
        alert('Failed to create project');
      }
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>Create Your Personal Website - Midnight</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
</svelte:head>

<div class="create-page">
  <div class="back-button">
    <Button label="← BACK" onclick={() => goto(backHref)} color="black" />
  </div>
  <div class="card">
    <h1 class="title">{config.title}</h1>
    <p class="subtitle">Don't worry about the perfect name, you can change it later!</p>
    
    <form on:submit={handleSubmit}>
      <div class="input-wrapper">
        <input 
          type="text" 
          class="input-field" 
          placeholder={config.namePlaceholder}
          bind:value={projectName}
          maxlength="30"
          required
        />
        <span class="char-count" class:limit={projectName.length >= 30}>
          {projectName.length}/30
        </span>
      </div>
      
      <div class="input-wrapper">
        <textarea 
          class="textarea-field" 
          placeholder={config.descriptionPlaceholder}
          bind:value={projectDescription}
          rows="8"
          maxlength="300"
          required
        ></textarea>
        <span class="char-count" class:limit={projectDescription.length >= 300}>
          {projectDescription.length}/300
        </span>
      </div>
      
      <button type="submit" class="submit-button" disabled={isSubmitting || !projectName.trim() || !projectDescription.trim()}>
        {isSubmitting ? 'Creating...' : 'Create Project'}
      </button>
    </form>
  </div>
</div>

<style>
  .create-page {
    position: relative;
    min-height: 100vh;
    background-color: #453b61;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .back-button {
    position: absolute;
    top: 32px;
    left: 66px;
    translate: 0 -8px;
  }

  .card {
    background: white;
    border-radius: 10px;
    width: 100%;
    max-width: 621px;
    padding: 60px 60px 70px;
    box-sizing: border-box;
  }

  .title {
    font-family: 'Moga', sans-serif;
    font-size: 56px;
    line-height: 1.5;
    color: #453b61;
    text-align: center;
    letter-spacing: -0.616px;
    margin: 0 0 20px 0;
  }

  .subtitle {
    font-family: 'PT Sans', sans-serif;
    font-size: 20px;
    line-height: 1.5;
    color: black;
    text-align: center;
    letter-spacing: -0.22px;
    margin: 0 0 55px 0;
    white-space: nowrap;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 17px;
  }

  .input-wrapper {
    position: relative;
  }

  .char-count {
    position: absolute;
    bottom: 12px;
    right: 15px;
    font-family: 'PT Sans', sans-serif;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.5);
    pointer-events: none;
  }

  .char-count.limit {
    color: #f24b4b;
    font-weight: bold;
  }

  .input-field {
    width: 100%;
    height: 47px;
    background: white;
    border: 1px solid black;
    border-radius: 5px;
    padding: 0 20px;
    font-family: 'PT Sans', sans-serif;
    font-size: 20px;
    letter-spacing: -0.22px;
    box-sizing: border-box;
  }

  .input-field::placeholder {
    color: rgba(0, 0, 0, 0.6);
  }

  .textarea-field {
    width: 100%;
    min-height: 273px;
    background: white;
    border: 1px solid black;
    border-radius: 5px;
    padding: 15px 20px;
    font-family: 'PT Sans', sans-serif;
    font-size: 20px;
    letter-spacing: -0.22px;
    resize: vertical;
    box-sizing: border-box;
  }

  .textarea-field::placeholder {
    color: rgba(0, 0, 0, 0.6);
  }

  .submit-button {
    width: 100%;
    height: 56px;
    background: #f24b4b;
    border: none;
    border-radius: 10px;
    font-family: 'Moga', sans-serif;
    font-size: 40px;
    color: white;
    letter-spacing: -0.44px;
    cursor: pointer;
    margin-top: 10px;
    transition: background-color 0.2s;
  }

  .submit-button:hover {
    background: #e03d3d;
  }

  .submit-button:active {
    background: #d32f2f;
  }

  .submit-button:disabled {
    background: #999;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .submit-button:disabled:hover {
    background: #999;
  }

  @media (max-width: 768px) {
    .card {
      padding: 40px 30px;
    }

    .title {
      font-size: 40px;
    }

    .subtitle {
      font-size: 16px;
      white-space: normal;
    }

    .input-field,
    .textarea-field {
      font-size: 18px;
    }

    .submit-button {
      font-size: 32px;
    }
  }
</style>
