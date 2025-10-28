<script lang="ts">
  export let speaker: string = 'MURDOCK';
  export let text: string = "Greetings. I'm Murdock. Your aunt's butler. She demanded I guide you through this process.";
  export let nextFn: () => void = () => {};
  export let visible: boolean = true;
</script>

<svelte:head>
  <style>
    @font-face {
      font-family: 'PT Sans';
      src: url('/font/PTSans-Regular.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    @font-face {
      font-family: 'PT Sans';
      src: url('/font/PTSans-Bold.ttf') format('truetype');
      font-weight: bold;
      font-style: normal;
    }
  </style>
</svelte:head>

<div class="dialogue-container" style="pointer-events: {visible ? 'auto' : 'none'}; opacity: {visible ? 1 : 0};">
  <div class="dialogue-box">
    <div class="speaker-label">
      <img src="/speaker-label-bg.svg" alt="" class="label-bg" />
      <p class="speaker-name">{speaker}</p>
    </div>
    <div class="dialogue-content">
      <p class="dialogue-text">{text}</p>
      <p class="continue-hint">Click to continue.</p>
    </div>
    <button class="click-overlay" onclick={nextFn} aria-label="Continue"></button>
  </div>
</div>

<style>
  .dialogue-container {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 200px;
    z-index: 100;
  }

  .dialogue-box {
    position: relative;
    width: 100%;
    height: 100%;
    background: #1c1c1c;
    cursor: pointer;
  }

  .speaker-label {
    position: absolute;
    top: -50px;
    left: 30px;
    width: 240px;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .label-bg {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .speaker-name {
    position: relative;
    z-index: 1;
    font-family: 'PT Sans', sans-serif;
    font-weight: bold;
    font-size: 40px;
    color: white;
    text-align: center;
    letter-spacing: -0.55px;
    margin: 0;
    line-height: normal;

    translate: 0 2px;
  }

  .dialogue-content {
    padding: 40px 94px 30px 50px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .dialogue-text {
    font-family: 'PT Sans', sans-serif;
    font-size: 32px;
    color: white;
    letter-spacing: -0.352px;
    line-height: normal;
    margin: 0;
  }

  .continue-hint {
    font-family: 'PT Sans', sans-serif;
    font-size: 20px;
    color: #acacac;
    letter-spacing: -0.22px;
    line-height: normal;
    margin: 0;
    max-width: 1181px;
  }

  .click-overlay {
    position: absolute;
    inset: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    z-index: 1;
  }

  @media (max-width: 768px) {
    .dialogue-container {
      height: 160px;
    }

    .speaker-label {
      width: 200px;
      height: 60px;
      top: -42px;
      left: 30px;
    }

    .speaker-name {
      font-size: 36px;
    }
    
    .dialogue-content {
      padding: 25px 40px 25px 40px;
    }
    
    .dialogue-text {
      font-size: 24px;
    }

    .continue-hint {
      font-size: 16px;
    }
  }

  @media (max-width: 480px) {
    .dialogue-container {
      height: 140px;
    }

    .speaker-label {
      width: 150px;
      height: 50px;
      top: -38px;
      left: 20px;
    }

    .speaker-name {
      font-size: 28px;
    }
    
    .dialogue-content {
      padding: 20px 30px;
    }
    
    .dialogue-text {
      font-size: 18px;
    }

    .continue-hint {
      font-size: 14px;
    }
  }
</style>
