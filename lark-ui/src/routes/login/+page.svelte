<script lang="ts">
  import MidnightHeader from "$lib/MidnightHeader.svelte";
  import { onMount } from "svelte";
  import Button from "$lib/Button.svelte";
  import { requestOTP } from "$lib/auth";

  let email = $state("");
  let referralCode = $state("");

  let requestingOTP = $state(true);
  let verifyingOTP = $state(false);

  let error = $state("");

  let isSubmitting = $state(false);

  onMount(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    error = urlParams.get("error") || "";

    const emailParam = urlParams.get("email");
    if (emailParam) {
      email = emailParam;
    }

    const referralParam = urlParams.get("code");
    if (referralParam) {
      referralCode = referralParam;
    }
  });

  function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async function sendOTP() {
    if (!isValidEmail(email)) {
      error = "Please enter a valid email address.";
      return;
    }
    
    isSubmitting = true;
    const response = await requestOTP(email, referralCode);

    if (response.ok) {
      error = "";
      requestingOTP = false;
      verifyingOTP = true;
    } else {
      error = "Failed to send OTP. Please try again later.";
    }
    
    isSubmitting = false;
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=PT+Serif:wght@400;700&display=swap"
    rel="stylesheet"
  />
  <style>
    .letter {
      animation: letterAnim 0.5s ease-out;
      transform-origin: bottom left;
    }

    @keyframes letterAnim {
      0% {
        translate: 0 50px;
        rotate: 1deg;
      }
      100% {
        translate: 0 0;
        rotate: 0;
      }
    }

    @media (max-width: 1023px),
      (orientation: portrait),
      (max-aspect-ratio: 4/3) {
      .letter-bg {
        display: none !important;
      }

      .mobile-card {
        background: #fee1c0;
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

      .mobile-card form {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .mobile-card .form-content {
        flex: 0 1 auto;
      }

      .mobile-card .pushable {
        transform: translateY(8px) translateX(-8px);
      }

      .mobile-card .front {
        padding: 12px 48px;
        transform: translateY(-8px) translateX(8px);
      }

      .mobile-card .pushable:hover .front {
        transform: translateY(-12px) translateX(12px);
      }

      .mobile-card .pushable:active .front {
        transform: translateY(-2px) translateX(4px);
      }

      .main-container {
        height: 100vh !important;
        width: 100vw !important;
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
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #f24b4b;
        z-index: -1;
      }

      section {
        overflow-x: hidden !important;
      }

      .desktop-layout {
        display: none !important;
      }
    }

    /* Hide castle SVG from header on mobile/tablet */
    @media (max-width: 1023px),
      (orientation: portrait),
      (max-aspect-ratio: 4/3) {
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
      }

      .desktop-layout {
        display: flex !important;
      }
    }
  </style>
</svelte:head>

<section
  class="bg-[#f24b4b] relative w-full h-screen flex flex-col items-center main-container overflow-hidden"
>
  <MidnightHeader />

  <!-- Mobile/Tablet Card Layout -->
  <!-- <div class="mobile-card-container" style="overflow-y: visible;">
    <div class="mobile-card">
      <form method="POST" action="?/verify_otp" class="flex flex-col w-full">
        <div class="form-content">
          <h1
            class="font-['Moga',_sans-serif] text-[60px] text-black leading-[1.1] mb-[0.6vh]"
          >
            <span>SIGN INTO</span> <span class="text-[#f24b4b]">MIDNIGHT</span>
          </h1>

          <p
            class="font-['PT_Sans',_sans-serif] text-[16px] text-black leading-[1.2] mb-[8px]"
          >
            Enter the one-time passcode sent to your email
          </p>

          <div class="grid grid-cols-1 gap-y-[12px] mb-[16px]">
            <div class="flex flex-col gap-[8px]">
              <label
                for="passcode-mobile"
                class="font-['PT_Sans',_sans-serif] text-[16px] text-black leading-[1.2]"
              >
                One-Time Passcode
              </label>
              <input
                type="hidden"
                name="email"
                bind:value={email}
              />
              <input
                id="passcode-mobile"
                type="text"
                name="otp"
                required
                autocomplete="one-time-code"
                class="w-full h-[48px] px-[14px] py-[10px] rounded-[8px] bg-[#fffbf6] font-['PT_Sans',_sans-serif] text-[18px] text-black leading-[1.2] focus:outline-none focus:ring-2 focus:ring-black border-0"
                disabled={isSubmitting}
                placeholder="000000"
              />
            </div>
          </div>

          {#if message}
            <p
              class="text-white font-['PT_Sans',_sans-serif] text-lg bg-red-900 bg-opacity-50 px-4 py-3 rounded-lg mb-6 text-center"
            >
              {message}
            </p>
          {/if}

          <div class="flex flex-col items-center w-full gap-[24px]">
            <button
              type="submit"
              class="pushable"
              disabled={isSubmitting || submissionInProgress}
            >
              <span
                class="front font-['Moga',_sans-serif] text-[#fee1c0] text-[32px] text-center tracking-[1.92px] leading-[normal]"
              >
                {#if isSubmitting}
                  <span class="flex items-center gap-2">
                    <svg
                      class="animate-spin h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    SUBMITTING...
                  </span>
                {:else}
                  SUBMIT
                {/if}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div> -->

  <!-- Desktop Layout -->
  <!-- <div
    class="desktop-layout relative flex-col items-center justify-center md:justify-end flex-1 w-full px-4 overflow-hidden hidden lg:flex"
  >
    <img
      src="/letter.svg"
      alt="Letter"
      class="letter-bg absolute top-0 left-0 w-full min-w-[900px] min-h-[600px] h-full md:top-auto md:bottom-0 md:left-1/2 md:-translate-x-1/2 md:translate-y-0 md:w-[60vw] md:max-w-[1200px] md:max-h-[70vh] md:h-auto object-cover object-center md:object-contain z-0 pointer-events-none"
      style="object-position: center center;"
    />

    <div
      class="relative z-20 flex flex-col items-start w-[720px] max-w-[960px] max-h-[70vh] p-[0.5vw] overflow-hidden"
    >
      <h1
        class="font-['Moga',_sans-serif] text-[60px] text-black leading-[1.1] mb-[0.6vh]"
      >
        <span>SIGN INTO</span> <span class="text-[#f24b4b]">MIDNIGHT</span>
      </h1>

      <form
        method="POST"
        action="?/verify_otp"
        class="flex flex-col w-full items-center justify-center h-full mt-6"
      >
        <div class="flex flex-col gap-[1.5vh] w-full max-w-[400px]">
          <label
            for="passcode"
            class="font-['PT_Sans',_sans-serif] text-[24px] text-black leading-[1.2] text-center"
          >
            Enter One-Time Passcode
          </label>
          <input
            type="hidden"
            name="email"
            bind:value={email}
          />
          <input
            id="passcode"
            type="text"
            required
            name="otp"
            autocomplete="one-time-code"
            class="w-full h-[clamp(48px,_4vh,_72px)] px-[1vw] py-[1vh] rounded-[0.6vw] bg-[#fffbf6] font-['PT_Sans',_sans-serif] text-[24px] text-black text-center leading-[1.2] focus:outline-none focus:ring-2 focus:ring-black border-0"
            disabled={isSubmitting}
            placeholder="000000"
          />

          {#if message}
            <p
              class="text-white font-['PT_Sans',_sans-serif] text-[16px] bg-red-900 bg-opacity-50 px-[1vw] py-[1vh] rounded-lg text-center"
            >
              {message}
            </p>
          {/if}

          <button
            type="submit"
            class="pushable mt-[2vh] mb-72"
            disabled={isSubmitting || submissionInProgress}
          >
            <span
              class="front font-['Moga',_sans-serif] text-[#fee1c0] text-[32px] text-center tracking-[0.06em] leading-[normal]"
            >
              {#if isSubmitting}
                <span class="flex items-center gap-2">
                  <svg
                    class="animate-spin h-[clamp(20px,_1.5vw,_40px)] w-[clamp(20px,_1.5vw,_40px)]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  SUBMITTING...
                </span>
              {:else}
                SUBMIT
              {/if}
            </span>
          </button>
        </div>
      </form>
    </div>
  </div> -->

  <div
    class="letter absolute bottom-0 left-50%"
  >
    <img
      src="/letter.svg"
      alt="Letter"
    />
    <div class="absolute top-0 left-0 p-12 w-full">
      <h1
        class="font-['Moga',_sans-serif] text-[60px] text-black leading-[1.1] mb-[0.6vh]"
      >
        <span>SIGN UP / SIGN INTO</span> <span class="text-[#f24b4b]">MIDNIGHT</span>
      </h1>

      {#if requestingOTP} 
        <form
          class="flex flex-col w-full items-center justify-center h-full mt-6"
          onsubmit={(e) => { e.preventDefault(); sendOTP(); }}
        >
          <div class="flex flex-col gap-[1.5vh] w-full max-w-[400px]">
            <label
              for="email"
              class="font-['PT_Sans',_sans-serif] text-[24px] text-black leading-[1.2] text-center"
            >
              Enter your email
            </label>
            <input
              id="email"
              type="email"
              required
              name="email"
              autocomplete="email"
              class="w-full h-[clamp(48px,_4vh,_72px)] px-[1vw] py-[1vh] rounded-[0.6vw] bg-[#fffbf6] font-['PT_Sans',_sans-serif] text-[24px] text-black text-center leading-[1.2] focus:outline-none focus:ring-2 focus:ring-black border-0"
              disabled={isSubmitting}
              bind:value={email}
              placeholder="wdaniel@gmail.com"
            />

            <Button label={isSubmitting ? "sending..." : "Next →"} disabled={isSubmitting} type="submit"/>

            {#if error}
              <p
                class="text-white font-['PT_Sans',_sans-serif] text-[16px] bg-red-900 bg-opacity-50 px-[1vw] py-[1vh] rounded-lg text-center mt-2"
              >
                {error}
              </p>
            {/if}
          </div>
        </form>
      {:else if verifyingOTP}
        <form
          method="POST"
          action="?/verify_otp"
          class="flex flex-col w-full items-center justify-center h-full mt-6"
        >
          <div class="flex flex-col gap-[1.5vh] w-full max-w-[400px]">
            <label
              for="otp"
              class="font-['PT_Sans',_sans-serif] text-[24px] text-black leading-[1.2] text-center"
            >
              We sent you a code to <i>{email}</i>. Enter it below.
            </label>
            <input
              type="hidden"
              name="email"
              bind:value={email}
            />
            <input
              type="text"
              name="otp"

              required
              autocomplete="one-time-code"
              class="w-full h-[clamp(48px,_4vh,_72px)] px-[1vw] py-[1vh] rounded-[0.6vw] bg-[#fffbf6] font-['PT_Sans',_sans-serif] text-[24px] text-black text-center leading-[1.2] focus:outline-none focus:ring-2 focus:ring-black border-0"
              disabled={isSubmitting}
              placeholder="000000"
            />

            {#if error}
              <p
                class="text-white font-['PT_Sans',_sans-serif] text-[16px] bg-red-900 bg-opacity-50 px-[1vw] py-[1vh] rounded-lg text-center"
              >
                {error}
              </p>
            {/if}

            <Button label="Sign In" type="submit"/>
          </div>
        </form>
      {/if}
    </div>
  </div>
</section>
