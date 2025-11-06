<script lang="ts">
  import BottomNavigation from '$lib/BottomNavigation.svelte';
  import { navigating } from '$app/state';
  import { page } from '$app/state';

  let { children } = $props();
</script>

{#await navigating.complete}
  <div class="loading">
    <img src="/loading/crow_fly.gif" alt="Loading..." />
  </div>  
{:then navigated} 
  {@render children()}
{/await}

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
