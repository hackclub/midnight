<script lang="ts">
  function randomRot() {
    let result = 5 - Math.floor(Math.random() * 10);
    return result == 0 ? 2 : result;
  }

  function createLink(projectType: string) {
    return '/app/projects/create?type=' + encodeURIComponent(projectType);
  }
</script>

<div class="create-new-project">
  <h1 class="title">CREATE NEW PROJECT</h1>
  <p class="subtitle">Build your first project... And get a holographic sticker!</p>

  <div class="cards-container">
    <a href="{createLink('personal_website')}" class="card-link" style="--rot-amt: {randomRot()}deg">
      <img src="/cards/personal_website.svg" alt="Personal Website" class="card-svg" />
    </a>

    <a href="{createLink('platformer_game')}" class="card-link" style="--rot-amt: {randomRot()}deg">
      <img src="/cards/platformer_game.svg" alt="Platformer Game" class="card-svg" />
    </a>

    <a href="/app/projects/select" class="card-link" style="--rot-amt: {randomRot()}deg">
      <img src="/cards/more_projects.svg" alt="More Projects" class="card-svg" />
    </a>
  </div>
</div>

<style>
  .create-new-project {
    position: relative;
    width: 800px;
    height: 486px;
    background-image: url('/shapes/shape-bg-1.svg');
    background-size: cover;
    background-position: center;
    padding-top: 30px;
  }

  .title {
    font-family: 'Moga', sans-serif;
    font-size: 48px;
    color: #453b61;
    letter-spacing: -0.5px;
    line-height: 1;
    margin: 0;
    margin-top: 8px;
    font-weight: normal;
    text-align: center;
  }

  .subtitle {
    font-family: 'PT Sans', sans-serif;
    font-size: 20px;
    color: #453b61;
    letter-spacing: -0.5px;
    margin: 0;
    font-weight: normal;
    text-align: center;
  }

  .cards-container {
    display: flex;
    gap: 24px;
    justify-content: center;
    margin-top: 24px;
  }

  .card-link {
    display: block;
    transition: all 0.1s ease-in;
  }

  .card-link:hover {
    rotate: var(--rot-amt);
    scale: 1.1;
    transition: all 0.1s ease-out;
  }

  .card-svg {
    display: block;
    width: 207px;
    height: 308px;
  }
</style>
