<script lang="ts">
  import Butler from "./Butler.svelte";

  const {
    speaker = 'MURDOCK',
    text = "Greetings. I'm Murdock. Your aunt's butler. She demanded I guide you through this process.",
    nextFn = () => {},
    visible = true,
    variant = 1
  }: {
    speaker?: string;
    text?: string;
    nextFn?: () => void;
    visible?: boolean;
    variant?: number;
  } = $props()
</script>

<div class="dialogue-container" style="pointer-events: {visible ? 'auto' : 'none'}; opacity: {visible ? 1 : 0};">
  <div class="dialogue-box">
    <div class="speaker-label">
      <img src="/shapes/shape-label-1.svg" alt="" class="label-bg" />
      <p class="speaker-name">{speaker}</p>
    </div>
    <div class="content-wrapper">
      <div class="dialogue-content">
        <p class="dialogue-text">{text}</p>
        <p class="continue-hint">Click to continue.</p>
      </div>
      <div class="butler">
        <Butler variant={variant} />
      </div>
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
    min-height: 200px;
    z-index: 100;
  }

  .dialogue-box {
    position: relative;
    width: 100%;
    min-height: 200px;
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

  .content-wrapper {
    display: flex;
    align-items: stretch;
    min-height: 200px;
    gap: 30px;
  }

  .butler {
    flex-shrink: 0;
    width: max(300px, 25vw);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    translate: 0 24px;
    padding-right: 30px;
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
    flex: 1;
    padding: 40px 0 30px 50px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    justify-content: center;
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
      min-height: 160px;
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

    .butler {
      width: 35vw;
    }
  }

  @media (max-width: 480px) {
    .dialogue-container {
      min-height: 140px;
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

    .content-wrapper {
      gap: 0;
    }
    
    .dialogue-content {
      padding: 20px 0 20px 20px;
    }
    
    .dialogue-text {
      font-size: 18px;
    }

    .continue-hint {
      font-size: 14px;
    }
  }
</style>
