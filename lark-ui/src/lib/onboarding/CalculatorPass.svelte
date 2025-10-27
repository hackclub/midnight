<script lang="ts">
  let hours = $state(50);
  let grant = $derived(hours * 10);
  
  const { handleCalc } = $props();

  async function handleCalcInner() {
    await handleCalc(hours);
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
    @font-face {
      font-family: 'PT Sans';
      src: url('/font/PTSans-Regular.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
  </style>
</svelte:head>

<div class="calculator-wrapper">
  <div class="boarding-pass">
    <h1 class="title">GET your entire flight covered</h1>
    
    <p class="subtitle">
      Only need 40hrs to attend! Code extra hours to cover your flight & hotel
    </p>
    
    <div class="slider-section">
      <p class="amount" style="left: {hours}%">${grant}</p>
      
      <div class="slider-wrapper">
        <input 
          type="range" 
          min="0" 
          max="100" 
          bind:value={hours}
          class="slider"
          style="--value: {hours}"
        />
      </div>
    </div>
    
    <p class="hours-needed">[{hours}hrs] extra needed!</p>
    
    <button class="submit-btn" onclick={handleCalcInner}>
      SUBMIT
      <img src="/quill-icon.svg" alt="" class="quill" />
    </button>
  </div>
</div>

<style>
  .calculator-wrapper {
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
  }

  .boarding-pass {
    position: relative;
    width: 100%;
    min-height: 480px;
    background-image: url('/boardingpass.svg');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center;
    padding: 100px 80px 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .title {
    font-family: 'Moga', sans-serif;
    font-size: 56px;
    font-weight: normal;
    color: #3d3560;
    text-align: center;
    letter-spacing: -0.6px;
    line-height: 1.1;
    margin: 0;
  }

  .subtitle {
    font-family: 'PT Sans', sans-serif;
    font-size: 18px;
    color: #3d3560;
    text-align: center;
    letter-spacing: -0.2px;
    line-height: 1.3;
    margin: 0 0 20px 0;
    max-width: 700px;
  }

  .slider-section {
    width: 100%;
    max-width: 550px;
    position: relative;
    margin: 30px 0 10px 0;
  }

  .amount {
    position: absolute;
    top: -70px;
    transform: translateX(-50%);
    font-family: 'Moga', sans-serif;
    font-size: 60px;
    font-weight: bold;
    color: #f24b4b;
    margin: 0;
    letter-spacing: -0.8px;
    white-space: nowrap;
    user-select: none;
  }

  .slider-wrapper {
    width: 100%;
    height: 35px;
    display: flex;
    align-items: center;
  }

  .slider {
    width: 100%;
    height: 10px;
    -webkit-appearance: none;
    appearance: none;
    background: linear-gradient(to right, 
      #f24b4b 0%, 
      #f24b4b calc(var(--value) * 1%), 
      #d1d1d1 calc(var(--value) * 1%), 
      #d1d1d1 100%);
    border-radius: 10px;
    outline: none;
    cursor: pointer;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 40px;
    height: 40px;
    background: #f24b4b;
    border: 3px solid white;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .slider::-moz-range-thumb {
    width: 40px;
    height: 40px;
    background: #f24b4b;
    border: 3px solid white;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .slider::-moz-range-track {
    background: transparent;
  }

  .slider::-moz-range-progress {
    background: #f24b4b;
    height: 10px;
    border-radius: 10px;
  }

  .hours-needed {
    font-family: 'PT Sans', sans-serif;
    font-size: 20px;
    color: #3d3560;
    margin: 0;
    letter-spacing: -0.2px;
  }

  .submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 270px;
    height: 75px;
    background: #f24b4b;
    border: none;
    border-radius: 16px;
    font-family: 'Moga', sans-serif;
    font-size: 52px;
    color: #fee1c0;
    letter-spacing: 3.2px;
    cursor: pointer;
    margin: 0;
    transition: opacity 0.2s;
  }

  .submit-btn:hover {
    opacity: 0.9;
  }

  .quill {
    width: 26px;
    height: 40px;
    margin-top: 4px;
  }

  @media (max-width: 1100px) {
    .boarding-pass {
      padding: 90px 60px 45px;
      gap: 10px;
    }

    .title {
      font-size: 48px;
    }

    .subtitle {
      font-size: 16px;
    }

    .amount {
      font-size: 52px;
      top: -65px;
    }

    .slider-section {
      max-width: 480px;
    }

    .hours-needed {
      font-size: 18px;
    }

    .submit-btn {
      width: 240px;
      height: 68px;
      font-size: 48px;
    }
  }

  @media (max-width: 768px) {
    .boarding-pass {
      padding: 80px 40px 40px;
      gap: 8px;
    }

    .title {
      font-size: 38px;
    }

    .subtitle {
      font-size: 14px;
    }

    .amount {
      font-size: 44px;
      top: -58px;
    }

    .slider-section {
      max-width: 400px;
    }

    .hours-needed {
      font-size: 16px;
    }

    .submit-btn {
      width: 210px;
      height: 60px;
      font-size: 42px;
    }

    .quill {
      width: 24px;
      height: 36px;
    }
  }

  @media (max-width: 480px) {
    .boarding-pass {
      padding: 70px 25px 35px;
    }

    .title {
      font-size: 30px;
    }

    .subtitle {
      font-size: 12px;
    }

    .amount {
      font-size: 36px;
      top: -52px;
    }

    .slider-section {
      max-width: 300px;
    }

    .hours-needed {
      font-size: 14px;
    }

    .submit-btn {
      width: 180px;
      height: 52px;
      font-size: 36px;
    }

    .quill {
      width: 22px;
      height: 34px;
    }
  }
</style>
