<script lang="ts">
    import { goto } from '$app/navigation';
    import Button from '$lib/Button.svelte';
    import ProjectType from '$lib/cards/ProjectType.svelte';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';

    let backHref = '/app/projects';
    let fromOnboarding = $derived($page.url.searchParams.get('from') === 'onboarding');

    onMount(() => {
        const params = new URLSearchParams(window.location.search);
        const from = params.get('from');
        if (from === 'onboarding' || (document.referrer && document.referrer.includes('/app/onboarding'))) {
            backHref = '/app/onboarding?from=create';
        }
    });
</script>

<svelte:head>
  <title>Create Your Project - Midnight</title>
</svelte:head>

<div class="select-page">
    <div class="header">
        <div class="back-button">
            <Button label="← BACK" onclick={() => goto(backHref)} color="black" />
        </div>
        <h1 class="page-title">Create A Project</h1>
    </div>
    <div class="project-types-grid">
        <ProjectType type="website" fromOnboarding={fromOnboarding} />
        <ProjectType type="game" fromOnboarding={fromOnboarding} />
        <ProjectType type="cli" fromOnboarding={fromOnboarding} />
        <ProjectType type="desktop_app" fromOnboarding={fromOnboarding} />
        <ProjectType type="mobile_app" fromOnboarding={fromOnboarding} />
    </div>
    <div class="wildcard">
      <Button label="Or... Choose your own fate" onclick={() => {
        goto('/app/projects/create?type=' + encodeURIComponent('wildcard') + (fromOnboarding ? '&from=onboarding&return=select' : ''));
      }} />
    </div>
</div>

<style>
  .select-page {
    position: relative;
    min-height: 100vh;
    background: #453b61;
    padding: 32px 66px 200px;
  }

  .header {
    display: flex;
    justify-content: start;
    align-items: center;
    gap: 32px;

    margin: 0 0 16px 0;
  }

  .back-button {
    translate: 0 -8px;
  }

  .page-title {
    font-family: 'Moga', sans-serif;
    font-size: 90px;
    color: white;
    letter-spacing: -1px;
    line-height: 1.5;
  }

  .project-types-grid {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 32px;
  }

  .wildcard {
    margin-top: 32px;
  }
</style>
