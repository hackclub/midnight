<script lang="ts">
  import MidnightHeader from '$lib/MidnightHeader.svelte';
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=PT+Serif:wght@400;700&display=swap" rel="stylesheet">
  <style>
    @font-face {
      font-family: 'Ws Paradose';
      src: url('/font/Ws Paradose.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    @font-face {
      font-family: 'Ws Paradose';
      src: url('/font/Ws Paradose Italic.ttf') format('truetype');
      font-weight: normal;
      font-style: italic;
    }
    @font-face {
      font-family: 'Moga';
      src: url('/font/Moga.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    
    @media (max-width: 1023px), (orientation: portrait), (max-aspect-ratio: 4/3) {
      .letter-bg {
        display: none !important;
      }
      
      .mobile-card {
        background: #FEE1C0;
        border-radius: 0;
        padding: 40px 32px;
        width: 90%;
        max-width: 800px;
        min-width: 320px;
        display: flex;
        flex-direction: column;
        z-index: 1000;
        position: relative;
        margin: auto;
        transform: rotate(-2deg);
        box-shadow: 0 15px 50px rgba(0, 0, 0, 0.2);
      }
      
      .main-container {
        height: 100vh !important;
        width: 100vw !important;
        overflow: hidden !important;
        position: relative;
        z-index: 1;
      }
      
      .mobile-card-container {
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        flex: 1 !important;
        width: 100% !important;
      }
      
      .main-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #f24b4b;
        z-index: -1;
      }
      
      section {
        overflow: hidden !important;
      }
      
      .desktop-layout {
        display: none !important;
      }
    }
    
    @media (max-width: 1023px), (orientation: portrait), (max-aspect-ratio: 4/3) {
      :global(.absolute.bottom-0.left-0.w-full.h-screen) {
        display: none !important;
      }
    }
    
    @media (min-width: 1024px) and (orientation: landscape) and (min-aspect-ratio: 4/3) {
      .mobile-card,
      .mobile-card-container {
        display: none !important;
      }
      
      .main-container {
        height: 100vh;
        width: 100%;
        overflow-x: hidden;
        overflow-y: hidden;
      }
      
      .desktop-layout {
        display: flex !important;
      }
    }
  </style>
</svelte:head>

<section class="bg-[#f24b4b] relative w-full h-screen flex flex-col items-center overflow-hidden main-container">
  <MidnightHeader />

  <!-- Mobile/Tablet Card Layout -->
  <div class="mobile-card-container" style="align-items: flex-start; padding-top: 26vh;">
    <div class="mobile-card">
      <div class="flex flex-col items-center gap-4">
        <div class="relative w-full max-w-[200px]">
          <img 
            alt="Crow illustration" 
            class="w-full h-full object-contain" 
            src="/sad.png" 
          />
        </div>

        <h1 class="font-['PT_Serif',_serif] font-bold text-black text-[28px] text-center leading-[1.2]">
          check your inbox
        </h1>

        <p class="font-['PT_Sans',_sans-serif] text-black text-[16px] text-center leading-[1.3] max-w-[320px]">
          those postal employees work fast!
        </p>

        <a href="/faq" class="px-[18px] py-[8px] bg-[#fffbf6] rounded-[8px] text-center flex flex-col mt-4">
          <span class="font-['PT_Serif',_sans-serif] font-bold text-[12px] text-[#3c3765] leading-[1.2]">
            seems like your aunt left you another letter...
          </span>
          <span class="font-['PT_Serif',_sans-serif] font-bold text-[16px] text-[#1385f0] leading-[1.2] underline">
            read the faq
          </span>
        </a>
      </div>
    </div>
  </div>

  <!-- Desktop Layout -->
  <div class="desktop-layout relative flex-col items-center justify-start flex-1 w-full px-4 overflow-y-auto hidden lg:flex pt-[28vh]">
    <img src="/letter.svg" alt="Letter" class="letter-bg absolute top-0 left-0 w-full h-full md:top-auto md:bottom-0 md:left-1/2 md:-translate-x-1/2 md:translate-y-0 md:w-[60vw] md:max-w-[1200px] md:max-h-[70vh] md:h-auto object-cover object-center md:object-contain z-0 pointer-events-none" style="object-position: center center;" />
    
    <div class="relative z-20 flex flex-col items-center w-[48vw] max-w-[960px] px-[0.5vw]">
      <div class="flex flex-col items-center gap-[2vh]">
        <div class="relative w-full max-w-[clamp(180px,_15vw,_280px)]">
          <img 
            alt="Crow illustration" 
            class="w-full h-full object-contain" 
            src="/sad.png" 
          />
        </div>

        <h1 class="font-['PT_Serif',_serif] font-bold text-black text-[clamp(28px,_2vw,_48px)] text-center leading-[1.2]">
          check your inbox
        </h1>

        <p class="font-['PT_Sans',_sans-serif] text-black text-[clamp(16px,_1.2vw,_28px)] text-center leading-[1.3] max-w-[clamp(280px,_35vw,_500px)]">
          those postal employees work fast!
        </p>

        <a href="/faq" class="px-[1vw] py-[0.5vh] bg-[#fffbf6] rounded-[0.4vw] text-center flex flex-col mt-[2vh]">
          <span class="font-['PT_Serif',_sans-serif] font-bold text-[clamp(11px,_0.65vw,_16px)] text-[#3c3765] leading-[normal]">
            seems like your aunt left you another letter...
          </span>
          <span class="font-['PT_Serif',_sans-serif] font-bold text-[clamp(14px,_0.9vw,_24px)] text-[#1385f0] leading-[normal] underline">
            read the faq
          </span>
        </a>
      </div>
    </div>
  </div>
</section>

