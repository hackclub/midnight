<script lang="ts">
  import BaseCard from './BaseCard.svelte';
</script>

<BaseCard color="#2e2740">
  {#snippet children()}
    <div class="new-project-content">
      <h2 class="new-project-title">
        <span class="title-line">NEW</span>
        <span class="title-line">PROJECT</span>
      </h2>
      
      <div class="plus-icon">
        <img src="/plus-icon.svg" alt="Add" />
      </div>
    </div>
  {/snippet}
</BaseCard>

<style>
  .new-project-content {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .new-project-title {
    font-family: 'Moga', sans-serif;
    font-size: 48px;
    color: white;
    text-align: center;
    letter-spacing: -0.528px;
    line-height: 0.9;
    margin: 0 0 20px 0;
    width: 152px;
  }

  .title-line {
    display: block;
  }

  .plus-icon {
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .plus-icon img {
    width: 100%;
    height: 100%;
  }
</style>
