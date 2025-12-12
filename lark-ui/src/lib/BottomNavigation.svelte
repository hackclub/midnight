<script lang="ts">
  import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
  import { checkAuthStatus, getReferralCode, type User } from './auth';
  import { getHourCounts } from './auth';

  type Tab = 'create' | 'explore' | 'shop' | 'settings' | 'faq' | 'travel';

  const { page, user }: {
    page: string;
    user?: User;
  } = $props();
 
  let activeTab = $derived.by(() => {
    if (!page) return 'create';
    if (page.startsWith('/app/projects')) return 'create';
    if (page.startsWith('/app/explore')) return 'explore';
    if (page.startsWith('/app/shop')) return 'shop';
    if (page.startsWith('/app/settings')) return 'settings';
    if (page.startsWith('/app/travel')) return 'travel';
    return 'create';
  });
  
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
      const referralLink = `https://midnight.hackclub.com/?code=${referralCode.rafflePos}`;
      navigator.clipboard.writeText(referralLink);
    }

    referralPopover = true;
    setTimeout(() => {
      referralPopover = false;
    }, 4000);
  }
  
  function navigateTo(tab: Tab) {
    if (tab === 'shop' && onboarding) {
      handleLockedClick(tab);
      return;
    }

    if (tab == 'travel' && travelLocked) {
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
      case 'faq':
        goto('/faq');
        break;
      case 'travel':
        goto('/app/travel');
        break;
    }
  }

  let onboarding = $state(true);
  let travelLocked = $state(false);

  onMount(async () => {
    const user = await checkAuthStatus();
    onboarding = user ? !user.onboardComplete : true; 

    const hours = await getHourCounts();
    travelLocked = hours.approvedHours < 10;
  })
</script>

<div class="bottom-navigation">
  <div class="bottom-nav-items">
    <div class="nav-tabs">
      <button 
        class="nav-item" 
        class:active={activeTab === 'create'}
        onclick={() => navigateTo('create')}
        role="tab"
        aria-selected={activeTab === 'create'}
        class:enabled={true}
        class:shake={shakingTab === 'create'}
      >
        Create
      </button>
      <button 
        class="nav-item enabled" 
        class:active={activeTab === 'explore'}
        class:shake={shakingTab === 'explore'}
        onclick={() => navigateTo('explore')}
        role="tab"
        aria-selected={activeTab === 'explore'}
      >
        Explore
      </button>
      <button 
        class="nav-item {onboarding ? 'disabled' : 'enabled'}" 
        class:active={activeTab === 'shop'}
        class:shake={shakingTab === 'shop'}
        onclick={() => navigateTo('shop')}
        role="tab"
        aria-selected={activeTab === 'shop'}
      >
        Shop
        {#if onboarding}
          <img class="lock" src="/icons/lock.svg" alt="Lock" />
        {/if}
      </button>
      <button
        class="nav-item enabled"
        onclick={() => navigateTo('faq')}
        class:active={activeTab === 'faq'}
        role="tab"
        aria-selected={activeTab === 'faq'}
      >
        FAQ
      </button>
      <button
        class="nav-item {travelLocked ? 'disabled' : 'enabled'}"
        onclick={() => navigateTo('travel')}
        class:active={activeTab === 'travel'}
        class:shake={shakingTab === 'travel'}
        role="tab"
        aria-selected={activeTab === 'travel'}
      >
        TRAVEL
        {#if travelLocked}
          <img class="lock" src="/icons/lock.svg" alt="Lock" />
        {/if}
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
        <a
          class="settings"
          class:active={activeTab === 'settings'}
          href="/app/settings"
        >
          <img src="/icons/settings.svg" alt="Settings" />
        </a>
      {/if}
    </div>
  </div>
</div>

<style>
  .progress-bar {
    height: 16px;

    display: flex;
  }

  .approved-hours {
    background: #1385F0;
    height: 100%;
    position: relative;
  }

  .tracked-hours {
    background: #4F5B9C;
    height: 100%;
    position: relative;
  }

  .remaining-hours {
    background: #5E5087;
    height: 100%;
    position: relative;
  }

  .marker {
    position: absolute;
    right: 0;
    bottom: calc(100%);
    transform: translateX(50%);
    
    padding: 8px 12px;
    background-image: url('/shapes/shape-popover-3.svg');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: bottom center;
    white-space: nowrap;
  }

  .marker p {
    font-family: 'PT Sans', sans-serif;
    font-size: 12px;
    font-weight: bold;
    color: white;
    margin: 0;
    margin-top: 12px;
    margin-bottom: 1.25px;
  }

  .goal-marker {
    position: absolute;
    right: 0;
    bottom: calc(100%);
    
    padding: 8px 12px;
    background-image: url('/shapes/shape-popover-4.svg');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: bottom center;
    white-space: nowrap;
  }

  .goal-marker p {
    font-family: 'PT Sans', sans-serif;
    font-size: 12px;
    font-weight: bold;
    color: white;
    margin: 0;
    margin-top: 12px;
    margin-bottom: 5px;
    rotate: -0.75deg;
  }  

  .bottom-navigation {
    position: fixed;
    z-index: 1000;
    bottom: 0;
    left: 0;
    right: 0;
    height: 15vh;
  }
  
  .bottom-nav-items {
    background: #2D273F;
    z-index: 200;
    height: 15vh;
    padding: 0 8vw;
    display: flex;
    align-items: center;
    justify-content: space-between;
    overflow-x: auto;
  }

  .nav-tabs {
    display: flex;
    gap: 4vw;
  }

  .nav-item {
    font-family: 'Moga', sans-serif;
    font-size: 9vh;

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
    width: 4vw;
    height: 4vw;
  }

  .settings img{
    width: 4vw;
    height: 4vw;
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
  

  .settings.active {
    filter: brightness(0) saturate(100%) invert(78%) sepia(88%) saturate(2130%) hue-rotate(330deg) brightness(101%) contrast(101%);
  }
</style>
