<script lang="ts">
  import { goto } from '$app/navigation';
    import { getReferralCode } from './auth';
  
  const { onboarding = false } = $props();

  let activeTab = $state('create');
  let shakingTab = $state('');

  let referralPopover = $state(false);
  
  function handleLockedClick(tab: string) {
    shakingTab = tab;
    setTimeout(() => {
      shakingTab = '';
    }, 800);
  }

  async function showReferralPopover() {
    const referralCode = await getReferralCode();

    if (referralCode?.rafflePos) {
      const referralLink = `https://midnight.1mp.dev/?code=${referralCode.rafflePos}`;
      navigator.clipboard.writeText(referralLink);
    }

    referralPopover = true;
    setTimeout(() => {
      referralPopover = false;
    }, 4000);
  }
  
  function navigateTo(tab: string) {
    if (onboarding && (tab === 'explore' || tab === 'shop')) {
      handleLockedClick(tab);
      return;
    }
    
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
      class="nav-item {true ? 'disabled' : 'enabled'}" 
      class:active={activeTab === 'explore'}
      class:shake={shakingTab === 'explore'}
      onclick={() => navigateTo('explore')}
      role="tab"
      aria-selected={activeTab === 'explore'}
    >
      Explore
      <!-- {#if onboarding} -->
        <img class="lock" src="/icons/lock.svg" alt="Lock" />
      <!-- {/if} -->
    </button>
    <button 
      class="nav-item {true ? 'disabled' : 'enabled'}" 
      class:active={activeTab === 'shop'}
      class:shake={shakingTab === 'shop'}
      onclick={() => navigateTo('shop')}
      role="tab"
      aria-selected={activeTab === 'shop'}
    >
      Shop
      <!-- {#if onboarding} -->
        <img class="lock" src="/icons/lock.svg" alt="Lock" />
      <!-- {/if} -->
    </button>
  </div>
  <div class="tray">
    {#if !onboarding}
      <!-- <img src="/icons/bell.svg" alt="Notification" /> -->
      <button class="referral" onclick={showReferralPopover}>
        {#if referralPopover}
          <div class="referral-popover">
            <p>Referral link copied to clipboard</p>
          </div>
        {/if}
        <img src="/icons/link.svg" alt="Referral" />
      </button>
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
    z-index: 200;

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

  .tray {
    display: flex;
    gap: 32px;
  }

  .referral {
    position: relative;
  }

  .referral img {
    width: 48px;
    height: 48px;
  }

  .referral:hover img {
    opacity: 0.8;
    cursor: pointer;
  }

  .referral-popover {
    position: absolute;
    bottom: 120%;
    left: 50%;
    translate: -50% 0;
    z-index: 200;
    padding: 1.5rem 2rem;
    background-image: url('/shapes/shape-popover-2.svg');
    background-size: contain;
    background-repeat: no-repeat;
    white-space: nowrap;

    animation: fadeInOut 4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
    transform-origin: center bottom;
  }

  @keyframes fadeInOut {
    0% {
      scale: 0;
      opacity: 0;
    }
    15%, 80% {
      scale: 1;
      opacity: 1;
    }
    100% {
      scale: 0;
      opacity: 0;
    }
  }

  .referral-popover p {
    font-size: 16px;
    color: black;
    margin: 0;
    margin-bottom: 24px;
    translate: -10px 1px;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    33% { transform: translateX(-5px); }
    66% { transform: translateX(5px); }
  }

  .nav-item.shake {
    animation: shake 400ms;
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
