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
      src: url('/font/PTSans-Bold.ttf') format('truetype');
      font-weight: bold;
      font-style: normal;
    }
  </style>
</svelte:head>

<div class="dialogue-container" style="opacity: {visible ? 1 : 0};">
  <div class="dialogue-box">
    <div class="speaker-label">
      <p class="speaker-name">{speaker}</p>
    </div>
    <div class="dialogue-text">
      <p>{text}</p>
    </div>
    <button class="next-button" on:click={nextFn}>Next</button>
  </div>
</div>

<style>
  .dialogue-container {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 198px;
  }

  .dialogue-box {
    position: relative;
    width: 100%;
    height: 100%;
    background: #1c1c1c;
    border: 2px solid white;
  }

  .speaker-label {
    position: absolute;
    top: -44px;
    left: 51px;
    width: 351px;
    height: 84px;
    background: #1c1c1c;
    border: 2px solid white;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .speaker-name {
    font-family: 'PT Sans', sans-serif;
    font-weight: bold;
    font-size: 50px;
    color: white;
    text-align: center;
    letter-spacing: -0.55px;
    margin: 0;
  }

  .dialogue-text {
    padding: 20px 50px;
    display: flex;
    align-items: center;
    height: 100%;
  }

  .dialogue-text p {
    font-family: 'PT Sans', sans-serif;
    font-size: 32px;
    color: white;
    line-height: 1.4;
    margin: 0;
  }

  .next-button {
    position: absolute;
    top: -28px;
    right: 51px;
    width: 151px;
    height: 60px;
    background: #F24B4B;
    border: 2px solid white;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;

    cursor: pointer;

    color: white;
    font-family: 'PT Sans', sans-serif;
    font-weight: bold;
    font-size: 32px;
  }

  @media (max-width: 768px) {
    .speaker-name {
      font-size: 32px;
    }
    
    .speaker-label {
      width: 250px;
      height: 60px;
      top: -32px;
      left: 30px;
    }
    
    .dialogue-text p {
      font-size: 20px;
      padding: 10px 30px;
    }
  }

  @media (max-width: 480px) {
    .speaker-name {
      font-size: 24px;
    }
    
    .speaker-label {
      width: 200px;
      height: 50px;
      top: -26px;
      left: 20px;
    }
    
    .dialogue-text p {
      font-size: 16px;
      padding: 5px 20px;
    }

    .dialogue-container {
      height: 150px;
    }
  }
</style>
