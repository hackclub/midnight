<script lang="ts">
  import { goto } from '$app/navigation';
  import BottomNavigation from '$lib/BottomNavigation.svelte';
</script>

<svelte:head>
  <title>Home - Midnight</title>
</svelte:head>

<div class="home-page">
  <div class="home-container">
    <div class="main-content">
      <div class="get-started-section">
        <h1 class="get-started-title">GET STARTED</h1>
        <p class="subtitle">Build your first project... And get a holographic sticker!</p>
        
        <div class="project-cards">
          <div class="project-card personal-website">
            <img src="/website.svg" alt="Personal Website" class="card-svg" />
          </div>
          
          <div class="project-card platformer-game">
            <img src="/platformer.svg" alt="Platformer Game" class="card-svg" />
          </div>
          
          <div class="project-card wildcard">
            <img src="/wildcard.svg" alt="Wildcard" class="card-svg" />
          </div>
        </div>
      </div>
    </div>
    
    <BottomNavigation />
  </div>
</div>

<style>
  .home-page {
    background-color: #453b61;
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
  }
  
  .home-container {
    position: relative;
    width: 100%;
    height: 100vh;
  }
  
  .main-content {
    position: relative;
    width: 100%;
    height: calc(100vh - 137px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }
  
  .get-started-section {
    background: white;
    border-radius: 10px;
    padding: 2rem;
    max-width: 812px;
    width: 100%;
    position: relative;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
  
  .get-started-title {
    font-family: 'Moga', sans-serif;
    font-size: 90px;
    color: #453b61;
    text-align: left;
    margin: 0 0 0.5rem 0;
    line-height: 1.2;
    letter-spacing: -0.99px;
  }
  
  .subtitle {
    font-family: 'PT Sans', sans-serif;
    font-size: 16px;
    color: black;
    text-align: left;
    margin: 0 0 1rem 0;
    font-weight: normal;
    letter-spacing: -0.176px;
  }
  
  .project-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .project-card {
    position: relative;
    height: 350px;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .card-svg {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
  }
  
  
  @media (max-width: 768px) {
    .main-content {
      height: calc(100vh - 80px);
    }
    
    .get-started-title {
      font-size: 48px;
    }
    
    .project-cards {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }
    
    .project-card {
      height: 250px;
    }
  }
  
  @media (max-width: 480px) {
    .main-content {
      height: calc(100vh - 60px);
    }
  }
</style>
