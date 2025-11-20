<script lang="ts">
  import Button from '$lib/Button.svelte';
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
        {@const submission = projectPageState.project.submissions[projectPageState.project.submissions.length - 1]}
        {@const status = submission.approvalStatus}
        <div class="tracking-container">
          <div class="tracking-header">
            <div class="tracking-title-section">
              <div>
                <h3 class="tracking-title">Submission Tracking</h3>
                <p class="tracking-subtitle">Track your project review status</p>
              </div>
            </div>
          </div>

          <div class="tracking-timeline">
            <div class="tracking-step completed">
              <div class="step-circle completed">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M13 4L6 11L3 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="step-content">
                <div class="step-title">Submitted</div>
              </div>
            </div>

            <div class="tracking-step" class:completed={status === 'approved' || status === 'rejected'} class:active={status === 'pending'}>
              <div class="step-circle" class:completed={status === 'approved' || status === 'rejected'} class:active={status === 'pending'}>
                {#if status === 'pending'}
                  <svg class="spinner" width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="28 10"/>
                  </svg>
                {:else if status === 'approved' || status === 'rejected'}
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M13 4L6 11L3 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                {:else}
                  <div class="step-number">2</div>
                {/if}
              </div>
              <div class="step-content">
                <div class="step-title">Under Review</div>
              </div>
            </div>

            <div class="tracking-step" class:completed={status === 'approved' || status === 'rejected'} class:rejected={status === 'rejected'}>
              <div class="step-circle" class:completed={status === 'approved' || status === 'rejected'} class:rejected={status === 'rejected'}>
                {#if status === 'approved'}
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M13 4L6 11L3 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                {:else if status === 'rejected'}
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                {:else}
                  <div class="step-number">3</div>
                {/if}
              </div>
              <div class="step-content">
                <div class="step-title">
                  {#if status === 'approved'}
                    Approved
                  {:else if status === 'rejected'}
                    Denied
                  {:else}
                    Decision
                  {/if}
                </div>
              </div>
            </div>
          </div>

          {#if status === 'rejected'}
            <div class="tracking-feedback">
              <div class="feedback-body">
                <div class="feedback-label">Reviewer Feedback</div>
                <div class="feedback-text">{submission.hoursJustification || 'No feedback provided'}</div>
              </div>
            </div>
          {/if}
        </div>
      {/if}
</div>

{#if projectPageState.user && projectPageState.user.hackatimeAccount}
      {#if projectPageState.project?.submissions && projectPageState.project.submissions.length > 0}
        {@const latestSubmission = projectPageState.project.submissions[projectPageState.project.submissions.length - 1]}
        <div class="submit-section">
          {#if latestSubmission.approvalStatus === 'approved'}
            <Button label="RE-SUBMIT" onclick={() => goto(`/app/projects/${projectPageState.project?.projectId}/submit`)}/>
          {:else if latestSubmission.approvalStatus === 'rejected'}
            <Button label="RE-SUBMIT" onclick={() => goto(`/app/projects/${projectPageState.project?.projectId}/submit`)}/>
          {:else}
            <Button
              label="Submitted"
              disabled
            />
          {/if}
          {#if projectPageState.project.isLocked}
            <Button label="REQUEST CHANGES" icon="edit" color="blue" onclick={() => goto(`/app/projects/${projectPageState.project?.projectId}/request-changes`)}/>
          {/if}
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

  /* Tracking Container - Parcel Style */
  .tracking-container {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
  }

  .tracking-header {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  }

  .tracking-title-section {
    display: flex;
    align-items: center;
  }

  .tracking-title {
    font-family: 'Moga', sans-serif;
    font-size: 22px;
    color: white;
    margin: 0;
    line-height: 1.2;
    letter-spacing: -0.5px;
  }

  .tracking-subtitle {
    font-family: 'PT Sans', sans-serif;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    margin: 3px 0 0 0;
    letter-spacing: -0.176px;
  }

  /* Timeline Steps */
  .tracking-timeline {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: flex-start;
    gap: 20px;
  }

  .tracking-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    opacity: 0.4;
    transition: opacity 0.3s ease;
  }

  .tracking-step.completed,
  .tracking-step.active {
    opacity: 1;
  }

  .step-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    border: 3px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.4);
    font-family: 'PT Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    transition: all 0.3s ease;
    position: relative;
    z-index: 2;
    flex-shrink: 0;
  }

  .step-circle.completed {
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.3) 0%, rgba(56, 142, 60, 0.3) 100%);
    border-color: #4CAF50;
    color: #4CAF50;
    box-shadow: 0 0 12px rgba(76, 175, 80, 0.2);
  }

  .step-circle.active {
    background: linear-gradient(135deg, rgba(255, 183, 77, 0.3) 0%, rgba(255, 167, 38, 0.3) 100%);
    border-color: #FFB74D;
    color: #FFB74D;
    animation: pulse-circle 2s ease-in-out infinite;
  }

  .step-circle.rejected {
    background: linear-gradient(135deg, rgba(244, 67, 54, 0.3) 0%, rgba(211, 47, 47, 0.3) 100%);
    border-color: #F44336;
    color: #F44336;
    box-shadow: 0 0 12px rgba(244, 67, 54, 0.2);
  }

  @keyframes pulse-circle {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(255, 183, 77, 0.6);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(255, 183, 77, 0);
    }
  }

  .step-circle .spinner {
    animation: spin 1.5s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .step-number {
    font-size: 14px;
  }

  .step-content {
    text-align: center;
  }

  .step-title {
    font-family: 'PT Sans', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: white;
    margin-bottom: 2px;
    letter-spacing: -0.3px;
  }

  .step-time {
    font-family: 'PT Sans', sans-serif;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.45);
    font-weight: 500;
    letter-spacing: 0.2px;
  }

  /* Feedback Section */
  .tracking-feedback {
    margin-top: 16px;
    padding: 14px 16px;
    background: linear-gradient(135deg, rgba(244, 67, 54, 0.15) 0%, rgba(211, 47, 47, 0.1) 100%);
    border: 1px solid rgba(244, 67, 54, 0.3);
    border-radius: 8px;
  }

  .feedback-body {
    width: 100%;
  }

  .feedback-label {
    font-family: 'PT Sans', sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: #EF5350;
    margin-bottom: 6px;
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }

  .feedback-text {
    font-family: 'PT Sans', sans-serif;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.5;
    white-space: pre-wrap;
    letter-spacing: -0.176px;
  }

  @media (max-width: 1024px) {
    .tracking-container {
      padding: 16px;
    }

    .tracking-title {
      font-size: 20px;
    }

    .tracking-header {
      margin-bottom: 16px;
      padding-bottom: 12px;
    }

    .tracking-timeline {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    .tracking-step {
      flex-direction: row;
      align-items: center;
      gap: 14px;
      width: 100%;
    }

    .step-circle {
      width: 30px;
      height: 30px;
      font-size: 13px;
    }

    .step-content {
      text-align: left;
    }

    .step-title {
      font-size: 13px;
    }

    .step-time {
      font-size: 10px;
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

    .tracking-container {
      padding: 14px;
    }

    .tracking-title {
      font-size: 18px;
    }

    .tracking-subtitle {
      font-size: 12px;
    }

    .step-circle {
      width: 28px;
      height: 28px;
      font-size: 12px;
    }

    .tracking-step {
      gap: 12px;
    }

    .step-title {
      font-size: 12px;
    }

    .step-time {
      font-size: 10px;
    }

    .tracking-feedback {
      padding: 12px;
    }

    .feedback-label {
      font-size: 11px;
    }

    .feedback-text {
      font-size: 12px;
    }
  }

  @media (max-width: 480px) {
    .project-title {
      font-size: 40px;
    }

    .project-time {
      font-size: 20px;
    }

    .tracking-header {
      margin-bottom: 12px;
      padding-bottom: 10px;
    }

    .tracking-title {
      font-size: 16px;
    }
  }
</style>
