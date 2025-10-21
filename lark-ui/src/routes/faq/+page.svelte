<script lang="ts">
  import { onMount } from 'svelte';

  onMount(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const decorations = document.querySelectorAll('.parallax-decoration');
      decorations.forEach((decoration) => {
        (decoration as HTMLElement).style.backgroundPosition = `0 ${scrollY * 0.5}px`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=PT+Serif:wght@400;700&display=swap" rel="stylesheet">
  <style>
    @font-face {
      font-family: 'Moga';
      src: url('/font/Moga.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    html {
      scroll-behavior: smooth;
    }
  </style>
</svelte:head>

<div class="bg-[#fee1c0] min-h-screen relative pt-[160px] overflow-x-clip">
  <header class="bg-[#f24b4b] h-[160px] w-full fixed top-0 left-0 right-0 z-50">
    <div class="absolute left-0 top-0 w-full h-full overflow-hidden pointer-events-none z-10">
      <div class="absolute bottom-[-20px] left-[-10px] w-[calc(100%+20px)]" style="transform: rotate(0.5deg); transform-origin: bottom left;">
        <div class="bg-[#453b61] h-[55px] w-full"></div>
      </div>
      
      <img 
        src="/castle.svg" 
        alt="" 
        class="absolute right-0 top-[-10px] h-[160px] w-auto object-contain z-10"
      />
    </div>

    <a href="/" class="absolute left-[22px] top-[20px] z-30 block">
      <img 
        src="/logo.svg" 
        alt="Midnight Logo" 
        class="h-[80px] w-auto"
      />
    </a>
  </header>

  <div class="container mx-auto px-8 md:px-16 lg:px-32 xl:px-12 py-20 max-w-5xl w-full">
    <div class="flex flex-col lg:flex-row gap-8 lg:gap-12">
      <aside class="w-full max-w-sm mx-auto lg:w-[225px] lg:mx-0 lg:sticky lg:top-[180px] lg:self-start flex-shrink-0 z-10">
        <div class="bg-[rgba(255,255,255,0.5)] p-6 rounded-lg">
          <h2 class="font-['PT_Serif',_serif] font-bold text-[16px] text-black text-center mb-4">
            table of contents
          </h2>
          <ul class="font-['PT_Sans',_sans-serif] text-[12px] text-black space-y-2 list-disc pl-5">
            <li><a href="#what-is-midnight">What is Midnight?</a></li>
            <li><a href="#how-to-get-invited">How do I get invited?</a></li>
            <li><a href="#when-and-where">When and where is this happening?</a></li>
            <li><a href="#who-can-participate">Who can participate?</a></li>
            <li><a href="#unable-to-attend">What if I can't attend?</a></li>
            <li><a href="#contact">Who can I contact?</a></li>
          </ul>
          
          <div class="h-[1px] bg-black my-4"></div>

          <a href="https://docs.google.com/document/d/1QN19MK9OBo85iW-dVQn3uU2sy78u8UEzAOTBj8C-Fs4/edit?tab=t.0" target="_blank" class="text-[16px] text-[#1385F0] font-['PT_Sans',_sans-serif]">Parent's Guide</a>
        </div>
      </aside>

      <main class="flex-1">
        <h1 class="font-['Moga',_sans-serif] text-[48px] md:text-[72px] text-black text-left">
          <span>FAQ FoR </span>
          <span class="text-[#f24b4b]">MIDNIGHT</span>
        </h1>

        <section id="what-is-midnight" class="mb-12 scroll-mt-[180px]">
          <h2 class="font-['PT_Serif',_serif] font-bold text-[24px] text-black mb-4">
            What is Midnight?
          </h2>
          <p class="font-['PT_Sans',_sans-serif] text-[16px] text-black leading-relaxed">
            Midnight is an in-person murder mystery experience by Hack Club. In early January 2026 you and 99 other teenagers will go to Vienna, Austria to solve a murder mystery through creating technical projects! You will experience Vienna, meet like-minded friends (for life!) and create projects you will be proud of.
          </p>
        </section>

        <section id="how-to-get-invited" class="mb-12 scroll-mt-[180px]">
          <h2 class="font-['PT_Serif',_serif] font-bold text-[24px] text-black mb-4">
            How do I get invited?
          </h2>
          <p class="font-['PT_Sans',_sans-serif] text-[16px] text-black leading-relaxed">
            To participate in Midnight you must spend [X] hours building projects. And, that's it! The first 100 folks who do so will be invited. Travel stipends will be available.
          </p>
        </section>

        <section id="when-and-where" class="mb-12 scroll-mt-[180px]">
          <h2 class="font-['PT_Serif',_serif] font-bold text-[24px] text-black mb-4">
            When and where is this happening?
          </h2>
          <p class="font-['PT_Sans',_sans-serif] text-[16px] text-black leading-relaxed">
            Midnight is happening in Vienna, Austria on January x-x. Exact program times and locations will be released closer to the event.
          </p>
        </section>

        <section id="who-can-participate" class="mb-12 scroll-mt-[180px]">
          <h2 class="font-['PT_Serif',_serif] font-bold text-[24px] text-black mb-4">
            Who can participate?
          </h2>
          <p class="font-['PT_Sans',_sans-serif] text-[16px] text-black leading-relaxed">
            Anyone aged 13-18, who completes the required hours!
          </p>
        </section>

        <section id="unable-to-attend" class="mb-12 scroll-mt-[180px]">
          <h2 class="font-['PT_Serif',_serif] font-bold text-[24px] text-black mb-4">
            What if I complete the requirements but am unable to attend Midnight in-person?
          </h2>
          <p class="font-['PT_Sans',_sans-serif] text-[16px] text-black leading-relaxed">
            If you complete the requirements to attend Midnight, but are rendered unable to do so you will be able to exchange the time spent for alternative prizes. An online "store" will open after the in-person experience, where you will be able to choose your rewards.
          </p>
        </section>

        <section id="contact" class="mb-12 scroll-mt-[180px]">
          <h2 class="font-['PT_Serif',_serif] font-bold text-[24px] text-black mb-4">
            Who can I contact for more information?
          </h2>
          <p class="font-['PT_Sans',_sans-serif] text-[16px] text-black leading-relaxed">
            Reach out to us at <a href="mailto:midnight@hackclub.com" class="underline">midnight@hackclub.com</a> or on Hack Club's Slack, in the #midnight-help channel :)
          </p>
        </section>
      </main>
    </div>
  </div>

  <div 
    class="fixed right-12 top-[180px] bottom-0 w-[27px] hidden lg:block z-5 pointer-events-none parallax-decoration"
    style="background-image: url('/decoration.svg'); background-repeat: repeat-y; background-size: 27px 774px;"
  >
  </div>

  <div 
    class="fixed left-12 top-[180px] bottom-0 w-[27px] hidden lg:block z-5 pointer-events-none parallax-decoration"
    style="background-image: url('/decoration.svg'); background-repeat: repeat-y; background-size: 27px 774px;"
  >
  </div>
</div>
