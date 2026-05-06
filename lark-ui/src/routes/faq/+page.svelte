<script lang="ts">
  import { onMount } from 'svelte';
  import { env } from '$env/dynamic/public';

  const signupsDisabled = env.PUBLIC_SIGNUPS_DISABLED === 'true';

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

  {#if signupsDisabled}
    <div class="container mx-auto px-8 md:px-16 py-20 max-w-3xl w-full">
      <h1 class="font-['Moga',_sans-serif] text-[48px] md:text-[72px] text-black text-center mb-8">
        <span>FAQ FoR </span>
        <span class="text-[#f24b4b]">MIDNIGHT</span>
      </h1>
      <div class="bg-[#f24b4b] text-[#fee1c0] rounded-2xl p-6 md:p-10 font-['PT_Serif',_serif] text-center shadow-[8px_8px_0_#2A2746] border-4 border-[#2A2746]">
        <p class="font-bold text-[22px] md:text-[28px] mb-4">Midnight has ended.</p>
        <p class="text-[16px] md:text-[18px] leading-relaxed">
          Midnight took place in Vienna, Austria on January 4–8, 2026. Big thanks to everyone who participated, built, and made the mystery what it was. ♥
        </p>
        <p class="text-[14px] md:text-[16px] leading-relaxed mt-6">
          Questions? Reach out at <a href="mailto:midnight@hackclub.com" class="underline">midnight@hackclub.com</a>.
        </p>
      </div>
    </div>
  {:else}
  <div class="container mx-auto px-8 md:px-16 lg:px-32 xl:px-12 py-20 max-w-5xl w-full">
    <div class="flex flex-col lg:flex-row gap-8 lg:gap-12">
      <aside class="w-full max-w-sm mx-auto lg:w-[225px] lg:mx-0 lg:sticky lg:top-[180px] lg:self-start flex-shrink-0 z-10">
        <div class="bg-[rgba(255,255,255,0.5)] p-6 rounded-lg">
          <h2 class="font-['PT_Serif',_serif] font-bold text-[16px] text-black text-center mb-4">
            table of contents
          </h2>
          <ul class="font-['PT_Sans',_sans-serif] text-[12px] text-black space-y-2 list-disc pl-5">
            <li><a href="#what-is-midnight">What is Midnight?</a></li>
            <li><a href="#how-to-get-invited">Can I still get invited?</a></li>
            <li><a href="#when-and-where">When and where did this happen?</a></li>
            <li><a href="#who-can-participate">Who participated?</a></li>
            <li><a href="#unable-to-attend">Alternative prizes</a></li>
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

        <div class="bg-[#f24b4b] text-[#fee1c0] rounded-lg p-4 md:p-6 mb-10 font-['PT_Serif',_serif]">
          <p class="font-bold text-[18px] md:text-[20px] mb-1">Midnight has ended.</p>
          <p class="text-[14px] md:text-[16px] leading-relaxed">
            The program ran from November 2025 through January 2026 and the in-person hackathon took place in Vienna, Austria on January 4–8, 2026. Signups are closed and we're no longer accepting new participants. Thanks to everyone who made it happen ♥
          </p>
        </div>

        <section id="what-is-midnight" class="mb-12 scroll-mt-[180px]">
          <h2 class="font-['PT_Serif',_serif] font-bold text-[24px] text-black mb-4">
            What is Midnight?
          </h2>
          <p class="font-['PT_Sans',_sans-serif] text-[16px] text-black leading-relaxed">
            Midnight was an in-person murder mystery experience by Hack Club. In early January 2026, teenagers from around the world traveled to Vienna, Austria to solve a murder mystery through building technical projects, experience Vienna together, and meet friends for life. The program has now concluded.
          </p>
        </section>

        <section id="how-to-get-invited" class="mb-12 scroll-mt-[180px]">
          <h2 class="font-['PT_Serif',_serif] font-bold text-[24px] text-black mb-4">
            Can I still get invited?
          </h2>
          <p class="font-['PT_Sans',_sans-serif] text-[16px] text-black leading-relaxed">
            No — Midnight has already happened and signups are closed. Keep an eye on <a href="https://hackclub.com" target="_blank" class="underline">hackclub.com</a> and the Hack Club Slack for future flagship events!
          </p>
        </section>

        <section id="when-and-where" class="mb-12 scroll-mt-[180px]">
          <h2 class="font-['PT_Serif',_serif] font-bold text-[24px] text-black mb-4">
            When and where did this happen?
          </h2>
          <p class="font-['PT_Sans',_sans-serif] text-[16px] text-black leading-relaxed">
            Midnight took place in Vienna, Austria on January 4–8, 2026.
          </p>
        </section>

        <section id="who-can-participate" class="mb-12 scroll-mt-[180px]">
          <h2 class="font-['PT_Serif',_serif] font-bold text-[24px] text-black mb-4">
            Who participated?
          </h2>
          <p class="font-['PT_Sans',_sans-serif] text-[16px] text-black leading-relaxed">
            Teenagers aged 13–18 from around the world who spent 50 hours building personal projects in the lead-up to the event.
          </p>
        </section>

        <section id="unable-to-attend" class="mb-12 scroll-mt-[180px]">
          <h2 class="font-['PT_Serif',_serif] font-bold text-[24px] text-black mb-4">
            I qualified but couldn't attend in person — what about alternative prizes?
          </h2>
          <p class="font-['PT_Sans',_sans-serif] text-[16px] text-black leading-relaxed">
            If you completed the requirements but were unable to make it to Vienna, you'll be able to exchange your time for alternative prizes through the online "store" that opens after the in-person experience. If you have questions about your status, email us at <a href="mailto:midnight@hackclub.com" class="underline">midnight@hackclub.com</a>.
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
  {/if}

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
