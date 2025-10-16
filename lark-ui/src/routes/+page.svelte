<script lang="ts">
  import { goto } from '$app/navigation';
  import MidnightHeader from '$lib/MidnightHeader.svelte';
  import { env } from '$env/dynamic/public';
  
  let email = '';
  let isSubmitting = false;
  let errorMessage = '';

  function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async function handleNavigateToRsvp(event: Event) {
    event.preventDefault();
    errorMessage = '';
    
    if (!email.trim()) {
      goto('/rsvp');
      return;
    }

    if (!isValidEmail(email)) {
      errorMessage = 'Please enter a valid email address';
      return;
    }

    isSubmitting = true;

    try {
      const apiUrl = env.PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/user/rsvp/initial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (response.ok) {
        goto(`/rsvp?email=${encodeURIComponent(email)}`);
      } else {
        const data = await response.json().catch(() => ({}));
        errorMessage = data.error || 'Failed to submit email';
      }
    } catch (error) {
      console.error('Error submitting email:', error);
      errorMessage = 'Network error. Please try again.';
    } finally {
      isSubmitting = false;
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
        height: 144px;
        padding: 0 80px;
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
        height: 144px;
        padding: 0 80px;
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
  </style>
</svelte:head>

<div class="bg-[#443B61] min-h-screen">
  <section class="bg-[#f24b4b] w-full flex flex-col items-center h-screen relative min-h-[700px] md:min-h-[800px] overflow-hidden">
    <MidnightHeader />

    <div class="flex flex-col items-center justify-center flex-grow pt-16 px-4 pb-[120px] md:pb-[140px] lg:pb-[160px] 2xl:pb-[200px]">
      <div class="flex flex-col items-center w-full max-w-7xl">
        <h1 class="sr-only">Midnight - A Murder Mystery by Hack Club</h1>
        
        <div class="relative w-full max-w-3xl 2xl:max-w-6xl px-4 -mb-4 md:-mb-6 2xl:-mb-12">
          <img alt="Midnight - A Murder Mystery" class="w-full h-auto block" style="object-fit: contain; background-repeat: no-repeat; background-size: contain;" src="/logo.svg" />
        </div>
        
        <form on:submit={handleNavigateToRsvp} class="flex flex-col items-center gap-4 2xl:gap-8 rotate-[-4.25deg]">
          <p class="font-['PT_Serif',_serif] font-bold text-[#fee1c0] text-xs md:text-xl lg:text-2xl xl:text-[28px] 2xl:text-[32px] text-center leading-normal max-w-3xl 2xl:max-w-6xl">
            Spend 70 hours building personal projects, get a trip to Vienna, Austria January 2026
          </p>
          
          <div class="flex flex-col items-center gap-3 2xl:gap-6 w-full max-w-2xl 2xl:max-w-4xl">
            <div class="flex flex-col md:flex-row items-center gap-3 md:gap-4 2xl:gap-8 w-full">
              <input
                type="email"
                bind:value={email}
                placeholder="wdaniel@hackclub.com"
                class="w-full md:flex-1 h-[60px] md:h-[66px] lg:h-[72px] 2xl:h-[144px] px-6 2xl:px-12 rounded-[18px] 2xl:rounded-[36px] bg-[#fee1c0] font-['PT_Sans',_sans-serif] text-[rgba(0,0,0,0.7)] text-xl md:text-2xl lg:text-[32px] 2xl:text-[64px] focus:outline-none focus:ring-2 focus:ring-[#fee1c0] focus:ring-opacity-50"
                disabled={isSubmitting}
              />
              
              <button 
                type="submit"
                class="pushable flex-shrink-0"
                disabled={isSubmitting}
              >
                <span class="front font-['Moga',_sans-serif] text-[#fee1c0] text-3xl md:text-4xl lg:text-5xl xl:text-[64px] 2xl:text-[128px] text-center text-nowrap tracking-[3.84px] 2xl:tracking-[7.68px] whitespace-pre">
                  RSVP
                </span>
              </button>
            </div>
            
            {#if errorMessage}
              <p class="text-[#fee1c0] font-['PT_Sans',_sans-serif] text-base md:text-lg 2xl:text-4xl bg-red-900 bg-opacity-50 px-4 py-2 2xl:px-8 2xl:py-4 rounded-lg 2xl:rounded-2xl">
                {errorMessage}
              </p>
            {/if}
          </div>
        </form>
      </div>
    </div>

    <div class="absolute bottom-8 md:bottom-12 lg:bottom-16 2xl:bottom-24 left-0 right-0 flex justify-center z-30">
      <p class="font-['PT_Serif',_serif] font-bold text-[#fee1c0] text-lg md:text-2xl lg:text-3xl 2xl:text-6xl text-center">
        a strange letter arrives... <span class="inline-block animate-bounce ml-2">⌄</span>
      </p>
    </div>
  </section>

  <section class="w-full flex flex-col items-center overflow-x-hidden pt-12 md:pt-16">
  <div class="bg-[#2A2746] aspect-video w-[110%] sm:w-[95%] md:w-[85%] lg:w-4/5 p-4 flex items-center justify-center mb-8 relative z-10">
    <iframe width="560" height="315" src="https://www.youtube.com/embed/imBlPXbAv6E?si=l09kXnFrCEmGYcvQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen class="w-full h-full relative z-10"></iframe>
  </div>
  
  <div class="w-[110%] sm:w-[95%] md:w-[85%] lg:w-4/5 relative block leading-[0]">
    <img alt="" class="w-full h-auto block" src="/envelope.svg" />
    
    <div class="absolute top-[10%] left-1/2 transform -translate-x-1/2 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 rotate-[-4.25deg]">
      <button 
        on:click={(e) => {
          e.preventDefault();
          errorMessage = '';
          if (email.trim() && isValidEmail(email)) {
            handleNavigateToRsvp(e);
          } else if (email.trim() && !isValidEmail(email)) {
            errorMessage = 'Please enter a valid email address';
          } else {
            goto('/rsvp');
          }
        }}
        class="pushable"
        disabled={isSubmitting}
      >
        <span class="front font-['Moga',_sans-serif] text-[#fee1c0] text-3xl md:text-4xl lg:text-5xl xl:text-[64px] 2xl:text-[128px] text-center text-nowrap tracking-[3.84px] 2xl:tracking-[7.68px] whitespace-pre">
          RSVP
        </span>
      </button>
      
      <button 
        on:click={() => goto('/faq')}
        class="pushable-blue"
      >
        <span class="front-blue font-['Moga',_sans-serif] text-[#fee1c0] text-3xl md:text-4xl lg:text-5xl xl:text-[64px] 2xl:text-[128px] text-center text-nowrap tracking-[3.84px] 2xl:tracking-[7.68px] whitespace-pre">
          Read More
        </span>
      </button>
    </div>
  </div>
  </section>
</div>
