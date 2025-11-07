<script lang="ts">
  import { goto } from '$app/navigation';
  import { checkAuthStatus, updateUser } from '$lib/auth';
  import Button from '$lib/Button.svelte';
  import CalculatorPass from '$lib/onboarding/CalculatorPass.svelte';
  import Dialogue from '$lib/onboarding/Dialogue.svelte';
  import ProjectTypeSelect from '$lib/onboarding/ProjectTypeSelect.svelte';
  import Texture from '$lib/Texture.svelte';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  const dialogues = [
    'Greetings. I\'m Murdock. Your aunt\'s butler. She demanded I guide you through this process.',
    'Obviously, I told her you’re not an idiot. Yet, here we are. ',
    'First... Sign up.',
    '',
    'To earn your invite to Vienna, you must prove your skills. Code for 50 hours.',
    'Code additional hours to get your travel fully covered. Use the slider to see how many hours you need to cover your travel. You can change this later if needed.',
    '',
    'Hmm... [#hours] You can create as many projects as you want to hit this goal.',
    'Now... Let’s get started.',
    'Build a personal website, platformer game, or anything you want. Here’s a holographic sticker for your efforts.'
  ]

  let submitting = $state(false);

  let step = $state(-1);
  let missingInfo = $state(false);

  let dialogueText = $state(dialogues[0]);
  let butlerVariant = $state(1);

  let dialogueVisible = $state(true);
  let formVisible = $state(false);
  let calculatorVisible = $state(false);
  let projectTypeVisible = $state(false);
  let overlayVisible = $state(true);
  
  let firstName = $state('');
  let lastName = $state('');
  let email = $state('');
  let birthday = $state('');
  
  // If we are returning from create, jump directly to the project type selection
  if (browser) {
    const initParams = new URLSearchParams(window.location.search);
    if (initParams.get('from') === 'create') {
      step = 8;
      projectTypeVisible = true;
      dialogueVisible = false;
      overlayVisible = false;
      dialogueText = dialogues[8];
      butlerVariant = 1;
    }
  }
  
  async function handleSubmit() {
    // Submit form data
    console.log({ firstName, lastName, birthday });

    await updateUser({
      firstName: firstName,
      lastName: lastName,
      birthday: birthday,
    });

    missingInfo = false;
    nextStep();
  }

  async function handleCalc(hours: number) {
    console.log(hours);

    dialogues[7] = `Hmm... ${hours + 50} hours. You can create as many projects as you want to hit this goal.`;

    nextStep();
  }

  function nextStep() {
    step++;

    switch (step) {
      case 1:
        if (missingInfo) {
          butlerVariant = 3;
        } else {
          step = 4;
          formVisible = false;
        }
        break;
      
      case 2:
        formVisible = true;
        butlerVariant = 1;
        break;

      case 3:
        dialogueVisible = false;
        overlayVisible = false;
        break;
      
      case 4:
        formVisible = false;
        dialogueVisible = true;
        overlayVisible = true;
        butlerVariant = 2;
        break;
  
      case 5:
        formVisible = false;
        dialogueVisible = true;
        calculatorVisible = true;
        overlayVisible = true;
        butlerVariant = 3;
        break;
      
      case 6:
        dialogueVisible = false;
        overlayVisible = false;
        break;
      
      case 7:
        calculatorVisible = false;
        dialogueVisible = true;
        overlayVisible = true;
        butlerVariant = 2;
        break;
      
      case 8:
        projectTypeVisible = true;
        butlerVariant = 1;
        break;

      case 9:
        butlerVariant = 4;
    }

    if (step >= dialogues.length) {
      overlayVisible = false;
      dialogueVisible = false;
      return;
    }

    dialogueText = dialogues[step];
  }

  onMount(async () => {    
    const authStatus = await checkAuthStatus();

    if (!authStatus) {
      goto('/');
      return;
    } else if (authStatus.onboardComplete) {
      goto('/app/projects');
      return;
    }

    firstName = authStatus.firstName;
    lastName = authStatus.lastName;
    email = authStatus.email;
    birthday = authStatus.birthday;

    const isTemporaryUser = authStatus.firstName == 'Temporary' || authStatus.lastName == 'User';
    const defaultBirthday = '2000-01-01';
    const needsBirthday = !birthday || birthday.startsWith(defaultBirthday);
    
    if (isTemporaryUser || !authStatus.email) {
      missingInfo = true;
      firstName = '';
      lastName = '';
      email = email;
      birthday = '';
    } else if (needsBirthday) {
      missingInfo = true;
      birthday = '';
    }

    const urlParams = new URLSearchParams(window.location.search);
    const fromParam = urlParams.get('from');
    
    if (fromParam === 'create') {
      step = 8;
      projectTypeVisible = true;
      dialogueVisible = false;
      overlayVisible = false;
      dialogueText = dialogues[8];
      butlerVariant = 1;
    } else {
      nextStep();
    }
  });
</script>

<div class="onboarding-page">
  <Dialogue
    speaker="MURDOCK"
    text={dialogueText}
    nextFn={nextStep}
    visible={dialogueVisible}
    variant={butlerVariant}
  />

  <div class="content" style="pointer-events: {overlayVisible ? 'none' : 'auto'};">
    <div id="overlay" style="display: {overlayVisible ? 'block' : 'none'};"></div>

    {#if formVisible}
      <div class="form-container">
        <form class="signup-form" onsubmit={async (e) => { 
          e.preventDefault(); 
          submitting = true;
          await handleSubmit();
          submitting = false;
        }}>
          <div class="form-background"></div>
          
          <div class="form-content">
            <h1 class="form-title">SIGN UP FOR MIDNIGHT</h1>
            <p class="form-subtitle">For ages 13 to 18</p>
            
            <div class="form-grid">
              <div class="form-field">
                <label for="firstName">First Name</label>
                <input 
                  type="text" 
                  id="firstName" 
                  bind:value={firstName}
                  placeholder="William"
                  required
                />
              </div>
              
              <div class="form-field">
                <label for="lastName">Last Name</label>
                <input 
                  type="text" 
                  id="lastName" 
                  bind:value={lastName}
                  placeholder="Daniel"
                  required
                />
              </div>
              
              <div class="form-field">
                <label for="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  bind:value={email}
                  disabled
                  placeholder="wdaniel@gmail.com"
                  required
                />
                <img src="/icons/lock.svg" alt="lock icon" class="lock-icon" />
              </div>
              
              <div class="form-field">
                <label for="birthday">Birthday</label>
                <input 
                  type="date" 
                  id="birthday" 
                  bind:value={birthday}
                  placeholder="mm/dd/yyyy"
                  required
                />
              </div>
            </div>

            <div class="submit-button">
              <Button label={submitting ? "submitting..." : "submit"} icon="quill" type="submit" disabled={submitting} />
            </div>
          </div>
        </form>
      </div>
    {/if}

    {#if projectTypeVisible}
      <ProjectTypeSelect />
    {/if}

    {#if calculatorVisible}
      <CalculatorPass handleCalc={handleCalc} />
    {/if}
  </div>

  <!-- <Texture /> -->
</div>

<style>
  #overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);

    z-index: 50;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
  }

  .onboarding-page {
    position: relative;
    width: 100%;
    min-height: 100vh;

    background-image: url('/onboarding_background.png');
    background-size: cover;
    background-position: center;

    overflow: hidden;
  }

  .form-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 866px;
    max-width: 90%;
  }

  .signup-form {
    position: relative;
    width: 100%;
    padding: 84px 28px 40px;
  }

  .form-background {
    position: absolute;
    inset: 0;
    background: white;
    border-radius: 10px;
    overflow: hidden;
  }

  .form-background::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('/form-texture.png');
    background-size: cover;
    background-position: center;
    opacity: 0.5;
  }

  .form-content {
    position: relative;
    z-index: 1;
  }

  .form-title {
    font-family: 'Moga', sans-serif;
    font-size: 80px;
    color: #453b61;
    text-align: center;
    letter-spacing: -0.88px;
    margin: 0 0 10px 0;
    line-height: 1.5;
  }

  .form-subtitle {
    font-family: 'PT Sans', sans-serif;
    font-size: 24px;
    color: rgba(0, 0, 0, 0.7);
    text-align: center;
    margin: 0 0 40px 0;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px 20px;
    margin-bottom: 36px;
  }

  .form-field {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .form-field label {
    font-family: 'PT Sans', sans-serif;
    font-weight: bold;
    font-size: 24px;
    color: black;
  }

  .form-field input {
    background: #fffbf6;
    border: none;
    height: 48px;
    padding: 0 11px;
    font-family: 'PT Sans', sans-serif;
    font-size: 20px;
    color: rgba(0, 0, 0, 0.7);
  }

  .form-field input::placeholder {
    color: rgba(0, 0, 0, 0.7);
  }

  .form-field input:disabled {
    background: #c9c9c9;
    color: #453b61;
    cursor: not-allowed;
  }

  .form-field .lock-icon {
    position: absolute;
    filter: invert();

    cursor: not-allowed;

    right: 14px;
    bottom: 14px;
    width: 20px;
    height: 20px;
  }

  .submit-button {
    display: flex;
    align-items: center;
    justify-content: center;

    scale: 1.2;
  }

  .submit-button:hover {
    opacity: 0.9;
  }
  @media (max-width: 900px) {
    .form-container {
      width: 95%;
    }

    .form-title {
      font-size: 48px;
    }

    .form-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }
  }

  @media (max-width: 600px) {
    .form-title {
      font-size: 36px;
    }

    .form-subtitle {
      font-size: 18px;
    }

    .form-field label {
      font-size: 18px;
    }

    .form-field input {
      font-size: 16px;
      height: 40px;
    }

    .submit-button {
      width: 240px;
      height: 70px;
    }

    .submit-button span {
      font-size: 48px;
    }

    .quill-icon {
      width: 24px;
      height: 36px;
    }
  }
</style>
