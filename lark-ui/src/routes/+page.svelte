<script lang="ts">
  import { goto } from '$app/navigation';
  import MidnightHeader from '$lib/MidnightHeader.svelte';
  import { env } from '$env/dynamic/public';
  import { onMount } from 'svelte';
  
  let email = '';
  let errorMessage = '';
  let showModal = false;

  function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }


/* Added the clicking sound to buttons */
let clickSound: HTMLAudioElement | undefined;

onMount(() => {
  clickSound = new Audio('/sounds/click.mp3');
  clickSound.preload = 'auto';
});

function playClick() {
  if (!clickSound) return;
  try {
    clickSound.currentTime = 0;
    clickSound.play().catch(() => {});
  } catch (e) {
    clickSound.play().catch(() => {});
  }
}

  /* Created a helper to add sound to faq button */
  function navigateToFaq() {
    playClick();
    goto('/faq');
  }

  async function handleNavigateToRsvp(event: Event) {
    event.preventDefault();
    playClick();
    errorMessage = '';
    
    if (!email.trim()) {
      goto('/rsvp');
      return;
    }

    if (!isValidEmail(email)) {
      errorMessage = 'Please enter a valid email address';
      return;
    }

    const emailToSend = email.trim();
    goto(`/rsvp?email=${encodeURIComponent(emailToSend)}`);

    const apiUrl = env.PUBLIC_API_URL || '';
    fetch(`${apiUrl}/api/user/rsvp/initial`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: emailToSend }),
    }).catch(error => {
      console.error('Error submitting email:', error);
    });
  }

  function openModal() {
    showModal = true;
  }

  function closeModal() {
    showModal = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
      closeModal();
    }
  }
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
    
    .pushable {
      background: #000000;
      border: none;
      border-radius: 18px;
      padding: 0;
      cursor: pointer;
      transform: translateY(8px) translateX(-8px);
    }
    
    .front {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 60px;
      padding: 0 30px;
      border-radius: 18px;
      background: #F24B4B;
      color: #fee1c0;
      transform: translateY(-8px) translateX(8px);
      transition: transform 600ms cubic-bezier(.3, .7, .4, 1);
    }
    
    @media (min-width: 768px) {
      .front {
        height: 66px;
        padding: 0 40px;
      }
    }
    
    @media (min-width: 1024px) {
      .front {
        height: 72px;
        padding: 0 50px;
      }
    }
    
    @media (min-width: 1536px) {
      .front {
        height: 78px;
        padding: 0 55px;
      }
    }
    
    .pushable:hover .front {
      transform: translateY(-12px) translateX(12px);
      transition: transform 250ms cubic-bezier(.3, .7, .4, 1.5);
    }
    
    .pushable:active .front {
      transform: translateY(-2px) translateX(4px);
      transition: transform 34ms;
    }
    
    .pushable:focus:not(:focus-visible) {
      outline: none;
    }
    
    .pushable-blue {
      background: #000000;
      border: none;
      border-radius: 18px;
      padding: 0;
      cursor: pointer;
      transform: translateY(8px) translateX(-8px);
    }
    
    .front-blue {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 60px;
      padding: 0 30px;
      border-radius: 18px;
      background: #4B9BF2;
      color: #fee1c0;
      transform: translateY(-8px) translateX(8px);
      transition: transform 600ms cubic-bezier(.3, .7, .4, 1);
    }
    
    @media (min-width: 768px) {
      .front-blue {
        height: 66px;
        padding: 0 40px;
      }
    }
    
    @media (min-width: 1024px) {
      .front-blue {
        height: 72px;
        padding: 0 50px;
      }
    }
    
    @media (min-width: 1536px) {
      .front-blue {
        height: 78px;
        padding: 0 55px;
      }
    }
    
    .pushable-blue:hover .front-blue {
      transform: translateY(-12px) translateX(12px);
      transition: transform 250ms cubic-bezier(.3, .7, .4, 1.5);
    }
    
    .pushable-blue:active .front-blue {
      transform: translateY(-2px) translateX(4px);
      transition: transform 34ms;
    }
    
    .pushable-blue:focus:not(:focus-visible) {
      outline: none;
    }
    
    .pushable-bottom {
      background: #000000;
      border: none;
      border-radius: 18px;
      padding: 0;
      cursor: pointer;
      transform: translateY(8px);
    }
    
    .front-bottom {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px 16px;
      border-radius: 12px;
      background: #F24B4B;
      color: #fee1c0;
      transform: translateY(-8px);
      transition: transform 600ms cubic-bezier(.3, .7, .4, 1);
    }
    
    @media (min-width: 640px) {
      .front-bottom {
        padding: 10px 20px;
        border-radius: 15px;
      }
    }
    
    @media (min-width: 768px) {
      .front-bottom {
        padding: 10px 24px;
        border-radius: 18px;
      }
    }
    
    @media (min-width: 1024px) {
      .front-bottom {
        padding: 12px 32px;
      }
    }
    
    .pushable-bottom:hover .front-bottom {
      transform: translateY(-12px);
      transition: transform 250ms cubic-bezier(.3, .7, .4, 1.5);
    }
    
    .pushable-bottom:active .front-bottom {
      transform: translateY(-4px);
      transition: transform 34ms;
    }
    
    .pushable-bottom:focus:not(:focus-visible) {
      outline: none;
    }
    
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }
    
    .modal-content {
      background: #fee1c0;
      padding: 32px;
      border-radius: 24px;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }
    
    @media (min-width: 768px) {
      .modal-content {
        padding: 48px;
      }
    }
    
    .modal-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: #F24B4B;
      color: #fee1c0;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-size: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }
    
    .modal-close:hover {
      transform: scale(1.1);
    }
    
    .letter-content {
      font-family: 'PT Serif', serif;
      color: #2A2746;
      line-height: 1.8;
      font-size: 16px;
    }
    
    @media (min-width: 768px) {
      .letter-content {
        font-size: 18px;
      }
    }
    
    .letter-content p {
      margin-bottom: 1em;
    }
    
    .letter-signature {
      margin-top: 2em;
      font-style: italic;
    }
  </style>
</svelte:head>

<div class="bg-[#443B61] min-h-screen">
  <section class="bg-[#f24b4b] w-full flex flex-col items-center h-screen relative min-h-[700px] md:min-h-[800px] overflow-hidden">
    <MidnightHeader />

    <div class="flex flex-col items-center justify-center flex-grow pt-16 px-4 pb-[120px] md:pb-[140px] lg:pb-[160px] 2xl:pb-[200px]">
      <div class="flex flex-col items-center w-full max-w-7xl">
        <h1 class="sr-only">Midnight - A Murder Mystery by Hack Club</h1>
        
        <div class="relative w-full max-w-3xl 2xl:max-w-4xl px-4 -mb-4 md:-mb-6 2xl:-mb-6">
          <img alt="Midnight - A Murder Mystery" class="w-full h-auto block" style="object-fit: contain; background-repeat: no-repeat; background-size: contain;" src="/logo.svg" />
        </div>
        
        <form on:submit={handleNavigateToRsvp} class="flex flex-col items-center gap-4 2xl:gap-5 rotate-[-4.25deg]">
          <p class="font-['PT_Serif',_serif] font-bold text-[#fee1c0] text-xs md:text-xl lg:text-2xl xl:text-[28px] 2xl:text-[30px] text-center leading-normal max-w-3xl 2xl:max-w-4xl">
            Spend 70 hours building personal projects, fly to a <br><span class="text-[#f24b4b]">murder mystery</span> hackathon in Vienna, Austria - Jan 2026 
          </p>
          
          <div class="flex flex-col items-center gap-3 2xl:gap-4 w-full max-w-2xl 2xl:max-w-[52rem]">
            <div class="flex flex-col md:flex-row items-center gap-3 md:gap-4 2xl:gap-5 w-full">
              <input
                type="email"
                bind:value={email}
                placeholder="wdaniel@hackclub.com"
                class="w-full md:flex-1 h-[60px] md:h-[66px] lg:h-[72px] 2xl:h-[78px] px-6 2xl:px-8 rounded-[18px] 2xl:rounded-[22px] bg-[#fee1c0] font-['PT_Sans',_sans-serif] text-[rgba(0,0,0,0.7)] text-xl md:text-2xl lg:text-[32px] 2xl:text-[36px] focus:outline-none focus:ring-2 focus:ring-[#fee1c0] focus:ring-opacity-50"
              />
              
              <button 
                type="submit"
                class="pushable flex-shrink-0"
              >
                <span class="front font-['Moga',_sans-serif] text-[#fee1c0] text-3xl md:text-4xl lg:text-5xl xl:text-[64px] 2xl:text-[64px] text-center text-nowrap tracking-[3.84px] whitespace-pre">
                  RSVP
                </span>
              </button>
            </div>
            
            <button 
              on:click={() => { playClick(); openModal(); }}
              type="button"
              class="pushable-blue"
            >
              <span class="front-blue font-['Moga',_sans-serif] text-[#fee1c0] text-3xl md:text-4xl lg:text-5xl xl:text-[64px] 2xl:text-[64px] text-center text-nowrap tracking-[3.84px] whitespace-pre">
                Read More
              </span>
            </button>
            
            {#if errorMessage}
              <p class="text-[#fee1c0] font-['PT_Sans',_sans-serif] text-base md:text-lg 2xl:text-xl bg-red-900 bg-opacity-50 px-4 py-2 2xl:px-5 2xl:py-2 rounded-lg 2xl:rounded-lg">
                {errorMessage}
              </p>
            {/if}
          </div>
        </form>
      </div>
    </div>

    <div class="absolute bottom-8 md:bottom-12 lg:bottom-16 2xl:bottom-16 left-0 right-0 flex justify-center z-30">
      <p class="font-['PT_Serif',_serif] font-bold text-[#fee1c0] text-lg md:text-2xl lg:text-3xl 2xl:text-[34px] text-center">
        a strange letter arrives... <span class="inline-block animate-bounce ml-2">⌄</span>
      </p>
    </div>
  </section>

 <!-- Read More Section Start -->
  <section
    class="relative flex flex-col md:flex-row justify-center items-center bg-[#443B61]  text-white py-16 px-4 sm:px-8"
  >
    <div class="flex flex-col gap-y-[1vw]">

      <div class="flex flex-col md:flex-row items-center justify-center w-[95vw] md:w-[80vw] gap-x-[1vw]">

        <div class="flex flex-col w-full gap-y-[1vw] pb-[2vh]">
          <div class="bg-[#fee1c0]/0 rounded-xl w-full px-[2vw] py-[1vh]">
            <p class="font-['Moga',_serif] font-bold text-[#fee1c0] text-center text-[8vh] tracking-[3.84px]">How it works</p>
          </div>
          <div class="bg-[#fee1c0] rounded-xl w-full px-[2vw] py-[1.5vh]">
            <p class="font-['PT_Serif',_serif] font-bold text-[#443B61] text-[3.5vh]">1. Work on projects</p>
          </div>
          <div class="bg-[#fee1c0] rounded-xl w-full px-[2vw] py-[1.5vh]">
            <p class="font-['PT_Serif',_serif] font-bold text-[#443B61] text-[3.5vh]">2. Collect your hours</p>
          </div>
          <div class="bg-[#fee1c0] rounded-xl w-full px-[2vw] py-[1.5vh]">
            <p class="font-['PT_Serif',_serif] font-bold text-[#443B61] text-[3.5vh]">3. Fly to Vienna, Austria</p>
          </div>
           <button 
              on:click={() => { playClick(); openModal(); }}
              type="button"
              class="pushable-blue"
            >
              <span class="front-blue font-['Moga',_sans-serif] text-[#fee1c0] text-[6vh] text-center text-nowrap tracking-[3.84px] whitespace-pre">
                Read More
              </span>
            </button>
         
        </div>
        
        <img
        alt="The Hack Club Midnight Team"
        src="https://hc-cdn.hel1.your-objectstorage.com/s/v3/7ada8a0621f0f84c5059b856cdea1bc1ab3e4bf0_group_photo.png"
        class="rounded-xl mt-[1vh] md:mt-6 w-[90vw] md:w-[37.5vw] object-cover"
        />

      </div>

      <div class="bg-[#fee1c0] rounded-xl w-full px-[2vw] py-[1.5vh]">
        <p class="font-['PT_Serif',_serif] font-bold text-[#443B61] text-[3.5vh] text-center">Build new projects, and learn with other highschoolers</p>
      </div>

      <div class="w-[95vw] md:w-[80vw] flex gap-[1vw]">
        <div class="w-2/10 bg-[#fee1c0] rounded-xl items-center justify-center p-[2vw] hidden md:flex">
          <img alt="The Crow" class="w-full h-auto block" style="object-fit: contain; background-repeat: no-repeat; background-size: contain;" src="/sad.png" />
        </div>

        <div class="bg-[#f24b4b] w-full md:w-8/10 rounded-xl px-[2vw] py-[2.5vh] flex items-center justify-center text-left">
          <p class="text-[#fee1c0] font-['PT_Serif',_serif] font-bold text-[2.75vh]"> Hack Club Midnight is a two-month online-to-in-person hackathon in Vienna, bringing hackers together to build creative projects, connect through events, and experience a unique murder-mystery themed adventure.
          </p>
        </div>
      </div>
    
  
    </div>
  </section>
    <!-- Read More Section End -->

  <section class="w-full flex flex-col items-center overflow-x-hidden pt-12 md:pt-16">
  <div class="bg-[#2A2746] aspect-video w-[110%] sm:w-[95%] md:w-[85%] lg:w-4/5 p-4 flex items-center justify-center mb-8 relative z-10">
    <iframe width="560" height="315" src="https://www.youtube.com/embed/oKHU66Ar6Gk?si=9kKLARVPPCcyygt-" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" class="w-full h-full" allowfullscreen></iframe>
  </div>
  
  <div class="w-[110%] sm:w-[95%] md:w-[85%] lg:w-4/5 relative block leading-[0]">
    <img alt="" class="w-full h-auto block" src="/envelope.svg" />
    
    <div class="absolute top-[10%] left-1/2 transform -translate-x-1/2 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 rotate-[-4.25deg]">
      <button 
        on:click={navigateToFaq}
        class="pushable-blue"
      >
        <span class="front-blue font-['Moga',_sans-serif] text-[#fee1c0] text-3xl md:text-4xl lg:text-5xl xl:text-[64px] 2xl:text-[64px] text-center text-nowrap tracking-[3.84px] whitespace-pre">
          FAQ
        </span>
      </button>
    </div>
  </div>
  </section>
</div>

{#if showModal}
  <div 
    class="modal-overlay" 
    on:click={closeModal} 
    on:keydown={handleKeydown}
    role="dialog" 
    aria-modal="true"
    tabindex="0"
  >
    <div 
      class="modal-content" 
      on:click={(e) => e.stopPropagation()}
      role="document"
    >
      <button class="modal-close" on:click={closeModal} aria-label="Close modal">×</button>
      
      <div class="letter-content">
        <p><strong>Dear hacker,</strong></p>
        
        <p>Welcome to Hack Club Midnight!</p>
        
        <p>Every year, Hack Club does something special. We have organized a bunch of wild adventures in the past (Shipwrecked, Juice, the Hacker Zephyr, etc).</p>
        
        <p>This year Hack Club is organizing our first ever murder mystery themed flagship hackathon in the EU. We will be working together online for two months, making our own projects, shipping them, and then getting together in-person in Vienna, Austria to be a part of an in-person murder mystery themed hackathon.</p>
        
        <p>You will have a community of makers and hackers just like yourself who want to build projects they're proud of! Every week, the midnight team will run calls and Slack huddles, as well as special online events for you to meet other participants coming to Midnight.</p>
        
        <p>For some of you, this might be the first time you're building projects. Others might be more experienced! We built Midnight to support hackers from with all levels of experience.</p>
        
        <p>The premise is simple: Spend 70 hours building projects, get a guaranteed ticket to an all expense paid murder mystery hackathon in Vienna, Austria.</p>
        
        <p>Being a part of events like these changed our lives as teenagers, and made us all fall in love with making things. All of us took our first solo flights to go to Hack Club events, build cool shit, and form some of our best friendships. We hope you get to experience that too :)</p>
        
        <p class="letter-signature">With love,</p>
        <p class="letter-signature">Alex, Kacper, Sebastian, Renran, Manitej, Dev and the Midnight Team</p>

        <img alt="The Hack Club Midnight Team" src="https://hc-cdn.hel1.your-objectstorage.com/s/v3/7ada8a0621f0f84c5059b856cdea1bc1ab3e4bf0_group_photo.png" />
      </div>
    </div>
  </div>
{/if}
