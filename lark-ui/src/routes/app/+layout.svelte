<script lang="ts">
  import BottomNavigation from '$lib/BottomNavigation.svelte';
  import { navigating } from '$app/state';
  import { page } from '$app/state';

  let { children } = $props();

  let shouldShowLoader = $derived.by(() => {
    const from = navigating.from?.url.pathname;
    const to = navigating.to?.url.pathname;
    
    if (!from || !to) return true;
    
    // Don't show loader if navigating within same project (e.g., /app/projects/123 to /app/projects/123/edit)
    const fromBase = from.split('/').slice(0, 4).join('/');
    const toBase = to.split('/').slice(0, 4).join('/');
    
    return fromBase !== toBase;
  });
</script>

{#if shouldShowLoader}
  {#await navigating.complete}
    <div class="loading">
      <img src="/loading/crow_fly.gif" alt="Loading..." />
    </div>
  {:then}
    {@render children()}
  {/await}
{:else}
  {@render children()}
{/if}

<BottomNavigation page={page.url.pathname} />

<style>
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: #453b61;
  }

  .loading img {
    image-rendering: pixelated;
    width: 250px;
    height: auto;
  }
</style>
