<script lang="ts">
  import { goto } from '$app/navigation';
  
  let email = '';
  let isSubmitting = false;
  let errorMessage = '';

  async function handleSubmit(event: Event) {
    event.preventDefault();
    
    if (!email.trim()) return;
    
    isSubmitting = true;
    errorMessage = '';

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        goto('/success');
      } else {
        errorMessage = data.error || 'Failed to submit RSVP';
      }
    } catch (error) {
      errorMessage = 'Network error. Please try again.';
      console.error('Error submitting RSVP:', error);
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
  </style>
</svelte:head>

<div class="bg-[#fee1c0] min-h-screen w-full flex flex-col">
  <div class="flex-1 flex items-center justify-center p-4">
    <div class="flex flex-col items-center justify-center gap-8 max-w-4xl w-full">
      <div class="relative flex items-center justify-center w-full max-w-md">
        <div class="relative w-full aspect-square max-w-[295px]">
          
          <div class="absolute inset-0 ">
            <img 
              alt="Crow illustration" 
              class="w-full h-full object-contain" 
              src="/crow.png" 
            />
          </div>
        </div>
      </div>

      <h1 class="font-['PT_Serif',_serif] font-bold text-[#081832] text-3xl md:text-4xl lg:text-[48px] text-center leading-normal">
        a strange letter arrives...
      </h1>

      <form class="relative w-full max-w-md flex gap-2" on:submit={handleSubmit}>
        <div class="bg-[#081832] h-[48px] flex-1 flex items-center px-4">
          <input 
            type="email"
            bind:value={email}
            placeholder="enter your email to RSVP"
            class="bg-transparent text-[#fee1c0] placeholder-[#fee1c0] font-['PT_Sans',_sans-serif] text-[20px] w-full outline-none text-center"
            required
            disabled={isSubmitting}
          />
        </div>
        <button 
          type="submit"
          class="bg-[#f24b4b] size-[48px] flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-50 flex-shrink-0"
          disabled={isSubmitting}
          aria-label="Submit RSVP"
        >
          <svg width="23" height="34" viewBox="0 0 23 34" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4 h-auto">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M22.2026 0.0659476C22.0533 0.103572 21.8312 0.158447 21.7091 0.187941C21.5869 0.217386 21.2982 0.310828 21.0675 0.395544C18.5775 1.31003 17.4027 2.02261 15.5882 3.71912C14.7033 4.54641 14.4534 4.81568 14.1269 5.29314L13.9723 5.51924L13.8658 6.33537C13.8072 6.78429 13.7477 7.20524 13.7337 7.27087L13.7081 7.39019L13.5155 7.07566C13.322 6.7596 13.2087 6.65139 13.1253 6.70319C12.9577 6.80724 11.9723 8.96109 11.6728 9.87795C11.5469 10.2637 11.1957 11.5977 10.9029 12.8026C10.7515 13.4257 10.6047 14.418 10.6047 14.8177V15.0523L10.3456 15.5881C10.203 15.8828 10.0599 16.1983 10.0274 16.2893L9.9684 16.4548L7.65848 16.4132C6.38804 16.3904 5.05986 16.3717 4.70698 16.3717H4.0654L3.86799 16.4752C3.62552 16.6024 3.45012 16.8919 3.45012 17.1649C3.45012 17.591 3.79332 17.9239 4.28122 17.971L4.51036 17.9931L5.26245 19.0621C5.67613 19.6501 6.00906 20.1361 6.00235 20.1422C5.99564 20.1484 5.36886 20.5933 4.60951 21.1309C3.22136 22.1139 3.00964 22.2982 2.66304 22.8263L2.47456 23.1134L1.38716 26.8064C0.789107 28.8376 0.288718 30.5552 0.275245 30.6234C0.261722 30.6915 0.200031 30.8811 0.138142 31.0447L0.0255685 31.3421L0.00464286 31.8899C-0.00957077 32.2622 0.00868974 32.5705 0.0616454 32.8525C0.144756 33.295 0.356233 33.9065 0.453261 33.9848C0.49067 34.015 2.72226 33.9998 6.60707 33.943C9.95936 33.8939 13.9299 33.8375 15.4304 33.8177C16.931 33.7978 18.167 33.7679 18.1773 33.7512C18.1875 33.7346 17.6874 31.2673 17.0658 28.2684L15.9358 22.8159L15.3848 22.2783C15.0654 21.9667 14.8561 21.7268 14.887 21.7077C14.9162 21.6896 15.233 21.5986 15.5911 21.5056L16.2421 21.3366L16.7191 21.8284L17.196 22.3202L18.3787 28.0333L19.5614 33.7463H20.0677H20.5739L20.7604 33.559C20.9721 33.3464 21.1829 32.9304 21.3038 32.487L21.3861 32.1848L21.3854 31.4908L21.3846 30.7969L20.0392 26.0133L18.6938 21.2297L18.5258 20.9818C18.2093 20.5145 18.0445 20.4009 16.9465 19.8929C16.3765 19.6292 15.8913 19.395 15.8683 19.3724C15.8453 19.3499 15.9694 19.0893 16.1441 18.7934L16.4618 18.2554L16.8292 18.225C17.3828 18.1793 17.6508 17.9965 17.7596 17.5906C17.8564 17.2297 17.6017 16.7616 17.2462 16.6469C17.1104 16.6031 13.1594 16.496 11.6718 16.4958L11.0855 16.4957L11.1174 16.2955C11.135 16.1854 11.2322 15.8707 11.3335 15.5961L11.5177 15.0968L11.8632 14.983C13.6351 14.3991 15.8435 12.9085 17.7312 11.0223C18.4874 10.2667 19.4143 9.20607 19.3541 9.16532C19.3289 9.14832 19.2943 9.09632 19.2772 9.04972C19.2601 9.00318 19.0769 8.84703 18.8701 8.70273L18.4941 8.4404L19.2586 8.41561C19.6791 8.40198 20.0313 8.37967 20.0412 8.36604C20.2834 8.03278 20.9845 6.9445 21.3412 6.34781C22.0912 5.09337 22.3156 4.55479 22.146 4.41589C22.1093 4.3858 21.7693 4.31338 21.3906 4.25503C21.0118 4.19664 20.6931 4.14003 20.6823 4.12917C20.6486 4.09536 21.2268 3.82069 21.5083 3.73672C21.6557 3.6928 21.9487 3.65681 22.1592 3.65681C22.3699 3.65681 22.5563 3.63396 22.5735 3.60605C22.6226 3.52614 22.883 2.42701 22.9371 2.07054C22.9881 1.7353 23.007 1.30641 22.9977 0.696687L22.9922 0.339033L22.839 0.1638C22.6704 -0.0291293 22.6142 -0.0377546 22.2026 0.0659476ZM19.9191 2.23259L19.5358 2.44233L18.6072 3.29628C15.9616 5.72927 14.6155 7.453 13.5049 9.83007C13.1821 10.521 12.5518 12.1368 12.5028 12.3991L12.4691 12.5796H12.5429C12.6561 12.5796 12.7454 12.41 13.1488 11.4288C13.7429 9.98409 14.3356 8.82442 14.9597 7.8858C16.0013 6.31931 16.878 5.34044 18.97 3.40811C19.7505 2.68711 20.4109 2.02033 20.343 2.02191C20.3207 2.02241 20.13 2.11719 19.9191 2.23259ZM13.9606 17.5785V17.8683L14.047 17.9403L14.1334 18.0124L14.8369 17.9928L15.5404 17.9733L15.5622 17.8665C15.5741 17.8078 15.5976 17.6538 15.6143 17.5243L15.6447 17.2888H14.8027H13.9606V17.5785ZM13.5013 18.8618C13.3242 19.0999 13.1899 19.3118 13.2028 19.3328C13.2157 19.3537 13.5775 19.3708 14.0069 19.3708H14.7877L15.0569 19.0114C15.2049 18.8137 15.3527 18.6018 15.3854 18.5405L15.4447 18.4289H14.6339H13.8232L13.5013 18.8618ZM21.7311 21.9032C21.7129 21.9328 21.7226 21.9819 21.7528 22.0123L21.8078 22.0674L21.8627 22.0123C21.9196 21.9551 21.884 21.8493 21.8078 21.8493C21.7838 21.8493 21.7493 21.8736 21.7311 21.9032Z" fill="#FEE1C0"/>
          </svg>
        </button>
      </form>
      
      {#if errorMessage}
        <p class="text-[#f24b4b] font-['PT_Sans',_sans-serif] text-sm text-center">
          {errorMessage}
        </p>
      {/if}
    </div>
  </div>
  
  <footer class="w-full py-4 px-4 mt-8">
    <p class="font-['PT_Sans',_sans-serif] text-[#081832] text-[16px] text-center leading-normal">
      An in-person <span class="text-[#f24b4b]">murder mystery</span> by Hack Club ⋅ January 2026 ⋅ Vienna, Austria ⋅ <a href="mailto:midnight@hackclub.com" class="text-[#f24b4b]">midnight@hackclub.com</a>
    </p>
  </footer>
</div>
