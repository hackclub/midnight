<script lang="ts">
    const { variant = 1 }: { variant?: number } = $props();
</script>

{#if variant == 4}
  <div class="sticker-container">
    <img src="/sticker.png" alt="Sticker" class="sticker" />
    <img src="/hand.png" alt="Hand" class="hand"/>
  </div>
{:else}
  <img src="/butler/{variant}.png" alt="Butler" />
{/if}

<style>
  img {
    position: absolute;
    bottom: 0;
    right: 0;

    width: 100%;
    height: auto;
    display: block;
  }

  .sticker-container {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .sticker {
    position: absolute;
    bottom: 48px;
    left: 0;
    width: 220px;
    height: auto;
    animation: teeter 2s ease-in-out infinite;
    transform-origin: center center;
  }

  @keyframes teeter {
    0%, 100% {
      transform: rotate(-4deg);
    }
    50% {
      transform: rotate(4deg);
    }
  }

  .hand {
    position: absolute;
    bottom: 200px;
    left: 150px;
    width: 100px;
    height: auto;
  }
</style>
