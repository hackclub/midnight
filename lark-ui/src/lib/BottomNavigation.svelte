<script lang="ts">
  import { goto } from '$app/navigation';
  
  const { onboarding = true } = $props();

  let activeTab = 'create';
  
  function navigateTo(tab: string) {
    activeTab = tab;
    switch(tab) {
      case 'create':
        goto('/app/projects');
        break;
      case 'explore':
        goto('/app/explore');
        break;
      case 'shop':
        goto('/app/shop');
        break;
    }
  }
</script>

<div class="bottom-navigation">
  <div class="nav-tabs">
    <button 
      class="nav-item" 
      class:active={activeTab === 'create'}
      onclick={() => navigateTo('create')}
      role="tab"
      aria-selected={activeTab === 'create'}
    >
      Create
    </button>
    <button 
      class="nav-item {onboarding ? 'disabled' : 'enabled'}" 
      class:active={activeTab === 'explore'}
      onclick={() => navigateTo('explore')}
      role="tab"
      aria-selected={activeTab === 'explore'}
    >
      Explore
      {#if onboarding}
        <img class="lock" src="/icons/lock.svg" alt="Lock" />
      {/if}
    </button>
    <button 
      class="nav-item {onboarding ? 'disabled' : 'enabled'}" 
      class:active={activeTab === 'shop'}
      onclick={() => navigateTo('shop')}
      role="tab"
      aria-selected={activeTab === 'shop'}
    >
      Shop
      {#if onboarding}
        <img class="lock" src="/icons/lock.svg" alt="Lock" />
      {/if}
    </button>
  </div>
  <div class="tray">
    {#if !onboarding}
      <img src="/bell-icon.svg" alt="Notification" />
    {/if}
  </div>
</div>

<style>
  .bottom-navigation {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #2D273F;
    height: 137px;
    padding: 0 120px;
    z-index: 100;

    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .nav-tabs {
    display: flex;
    gap: 60px;
  }

  .nav-item {
    font-family: 'Moga', sans-serif;
    font-size: 90px;

    text-align: center;
    text-box-trim: trim-both;
    cursor: pointer;
    transition: color 0.3s ease;
    letter-spacing: -0.99px;
    user-select: none;
    background: none;
    border: none;
    padding: 0;
    margin: 0;

    position: relative;
  }

  .enabled {
    color: white;
  }

  .disabled {
    color: #7C7C7C;
    pointer-events: none;
  }
  
  .nav-item.active {
    color: #ffbb31;
  }
  
  .nav-item:hover {
    opacity: 0.8;
  }

  .lock {
    position: absolute;

    bottom: 0;
    left: 50%;
    translate: -50% 0;

    z-index: 20;

    width: 24px;
    height: 30px;
    rotate: -10deg;
  }
  
  @media (max-width: 768px) {
    .nav-item {
      font-size: 48px;
    }
    
    .bottom-navigation {
      height: 80px;
      padding: 0 1rem;
    }
  }
  
  @media (max-width: 480px) {
    .nav-item {
      font-size: 32px;
    }
    
    .bottom-navigation {
      height: 60px;
      padding: 0 0.5rem;
    }
  }
</style>
