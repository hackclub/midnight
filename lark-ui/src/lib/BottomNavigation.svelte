<script lang="ts">
  import { goto } from '$app/navigation';
  
  let activeTab = 'create';
  
  function navigateTo(tab: string) {
    activeTab = tab;
    switch(tab) {
      case 'create':
        goto('/home');
        break;
      case 'explore':
        goto('/explore');
        break;
      case 'shop':
        goto('/shop');
        break;
      case 'login':
        goto('/login');
        break;
    }
  }
</script>

<svelte:head>
  <style>
    @font-face {
      font-family: 'Moga';
      src: url('/font/Moga.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
  </style>
</svelte:head>

<div class="bottom-navigation">
  <div class="create-container">
    <img src="/createpop.svg" alt="Create dialogue bubble" class="create-bubble" />
    <button 
      class="nav-item" 
      class:active={activeTab === 'create'}
      on:click={() => navigateTo('create')}
      role="tab"
      aria-selected={activeTab === 'create'}
    >
      Create
    </button>
  </div>
  <button 
    class="nav-item" 
    class:active={activeTab === 'explore'}
    on:click={() => navigateTo('explore')}
    role="tab"
    aria-selected={activeTab === 'explore'}
  >
    Explore
  </button>
  <button 
    class="nav-item" 
    class:active={activeTab === 'shop'}
    on:click={() => navigateTo('shop')}
    role="tab"
    aria-selected={activeTab === 'shop'}
  >
    Shop
  </button>
  <button 
    class="nav-item" 
    class:active={activeTab === 'login'}
    on:click={() => navigateTo('login')}
    role="tab"
    aria-selected={activeTab === 'login'}
  >
    LOGIN
  </button>
</div>

<style>
  .bottom-navigation {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #2D273F;
    height: 137px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0 2rem;
    z-index: 100;
  }
  
  .nav-item {
    font-family: 'Moga', sans-serif;
    font-size: 90px;
    color: white;
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
  }
  
  .nav-item.active {
    color: #ffbb31;
  }
  
  .nav-item:hover {
    opacity: 0.8;
  }
  
  .create-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .create-bubble {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 208px;
    height: 137px;
    margin-bottom: -10px;
    z-index: 1;
  }
  
  @media (max-width: 768px) {
    .nav-item {
      font-size: 48px;
    }
    
    .bottom-navigation {
      height: 80px;
      padding: 0 1rem;
    }
    
    .create-bubble {
      width: 156px;
      height: 103px;
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
    
    .create-bubble {
      width: 104px;
      height: 69px;
    }
  }
</style>
