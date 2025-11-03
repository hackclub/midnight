<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
    import { createProject } from '$lib/auth';
    import { goto } from '$app/navigation';
  
  let projectName = '';
  let projectDescription = '';
  let projectType = 'website';
  
  $: formConfig = {
    personal_website: {
      title: 'CREATE YOUR WEBSITE',
      namePlaceholder: 'Website Name',
      descriptionPlaceholder: 'Website Description'
    },
    platformer_game: {
      title: 'CREATE YOUR GAME',
      namePlaceholder: 'Game Name',
      descriptionPlaceholder: 'Game Description'
    },
    wildcard: {
      title: 'CREATE YOUR PROJECT',
      namePlaceholder: 'Project Name',
      descriptionPlaceholder: 'Project Description'
    }
  };
  
  $: config = formConfig[projectType as keyof typeof formConfig] || formConfig.wildcard;
  
  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type');
    if (typeParam && formConfig[typeParam as keyof typeof formConfig]) {
      projectType = typeParam;
    } else {
      projectType = 'wildcard';
    }
  });
  
  async function handleSubmit(event: Event) {
    event.preventDefault();
    console.log('Creating project:', { 
      type: projectType,
      name: projectName, 
      description: projectDescription 
    });

    const project = await createProject({
      projectTitle: projectName,
      projectType: projectType,
      projectDescription: projectDescription
    });

    if (project) {
      goto(`/app/projects/${project.projectId}`);
    } else {
      alert('Failed to create project');
    }
  }
</script>

<svelte:head>
  <title>Create Your Personal Website - Midnight</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
</svelte:head>

<div class="create-page">
  <div class="card">
    <h1 class="title">{config.title}</h1>
    <p class="subtitle">Don't worry about the perfect name, you can change it later!</p>
    
    <form on:submit={handleSubmit}>
      <input 
        type="text" 
        class="input-field" 
        placeholder={config.namePlaceholder}
        bind:value={projectName}
      />
      
      <textarea 
        class="textarea-field" 
        placeholder={config.descriptionPlaceholder}
        bind:value={projectDescription}
        rows="8"
      ></textarea>
      
      <button type="submit" class="submit-button">
        Create Project
      </button>
    </form>
  </div>
</div>

<style>
  .create-page {
    min-height: 100vh;
    background-color: #453b61;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
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
