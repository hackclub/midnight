<script lang="ts">
  import { goto } from "$app/navigation";
  import MidnightHeader from "$lib/MidnightHeader.svelte";
  import { env } from "$env/dynamic/public";
  import { onMount } from "svelte";

  let email = "";

  let message = "";

  let isSubmitting = false;
  let submissionInProgress = false;

  const apiUrl = env.PUBLIC_API_URL || "";

  onMount(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    const emailParam = urlParams.get("email");
    if (emailParam) {
      email = emailParam;
    }

    // send an otp to the user's email
    const response = await fetch(`${apiUrl}/api/user/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email })
    });

    console.log('sent an OTP')

    if (!response || !response.ok) {
      const data = await response.json();
      message = data.message || "Failed to send OTP. Please try again.";
    }
  });

  function formatBirthday(input: string): string {
    return input;
  }

  function calculateAge(birthdayString: string): number {
    const formattedBirthday = formatBirthday(birthdayString);
    const birthDate = new Date(formattedBirthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
    @font-face {
      font-family: "Ws Paradose";
      src: url("/font/Ws Paradose.ttf") format("truetype");
      font-weight: normal;
      font-style: normal;
    }
    @font-face {
      font-family: "Ws Paradose";
      src: url("/font/Ws Paradose Italic.ttf") format("truetype");
      font-weight: normal;
      font-style: italic;
    }
    @font-face {
      font-family: "Moga";
      src: url("/font/Moga.ttf") format("truetype");
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
      padding: 8px 40px;
      border-radius: 18px;
      background: #f24b4b;
      color: #fee1c0;
      transform: translateY(-8px) translateX(8px);
      transition: transform 600ms cubic-bezier(0.3, 0.7, 0.4, 1);
    }

    @media (min-width: 768px) {
      .front {
        padding: 12px 60px;
      }
    }

    @media (min-width: 1536px) {
      .pushable {
        border-radius: 22px;
        transform: translateY(10px) translateX(-10px);
      }
      .front {
        padding: 14px 80px;
        border-radius: 22px;
        transform: translateY(-10px) translateX(10px);
      }
      .pushable:hover .front {
        transform: translateY(-14px) translateX(14px);
      }
    }

    @media (min-width: 1920px) {
      .pushable {
        border-radius: 26px;
        transform: translateY(12px) translateX(-12px);
      }
      .front {
        padding: 16px 100px;
        border-radius: 26px;
        transform: translateY(-12px) translateX(12px);
      }
      .pushable:hover .front {
        transform: translateY(-16px) translateX(16px);
      }
    }

    .pushable:hover .front {
      transform: translateY(-12px) translateX(12px);
      transition: transform 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5);
    }

    .pushable:active .front {
      transform: translateY(-2px) translateX(4px);
      transition: transform 34ms;
    }

    .pushable:focus:not(:focus-visible) {
      outline: none;
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
  class="bg-[#f24b4b] relative w-full h-screen flex flex-col items-center main-container"
>
  <MidnightHeader />

  <!-- Mobile/Tablet Card Layout -->
  <!-- <div class="mobile-card-container" style="overflow-y: visible;">
    <div class="mobile-card">
      <form on:submit={handleSubmit} class="flex flex-col w-full">
        <div class="form-content">
          <h1
            class="font-['Moga',_sans-serif] text-[60px] text-black leading-[1.1] mb-[0.6vh]"
          >
            <span>RSVP FoR</span> <span class="text-[#f24b4b]">MIDNIGHT</span>
          </h1>

          <p
            class="font-['PT_Sans',_sans-serif] text-[16px] text-black leading-[1.2] mb-[8px]"
          >
            Midnight is for teenagers 18 and under
          </p>

          <div class="grid grid-cols-1 gap-y-[12px] mb-[16px]">
            <div class="flex flex-col gap-[8px]">
              <label
                for="firstName-mobile"
                class="font-['PT_Sans',_sans-serif] text-[16px] text-black leading-[1.2]"
              >
                First Name
              </label>
              <input
                id="firstName-mobile"
                type="text"
                bind:value={firstName}
                required
                autocomplete="given-name"
                class="w-full h-[48px] px-[14px] py-[10px] rounded-[8px] bg-[#fffbf6] font-['PT_Sans',_sans-serif] text-[18px] text-black leading-[1.2] focus:outline-none focus:ring-2 focus:ring-black border-0"
                disabled={isSubmitting}
                placeholder="William"
              />
            </div>

            <div class="flex flex-col gap-[8px]">
              <label
                for="lastName-mobile"
                class="font-['PT_Sans',_sans-serif] text-[16px] text-black leading-[1.2]"
              >
                Last Name
              </label>
              <input
                id="lastName-mobile"
                type="text"
                bind:value={lastName}
                required
                autocomplete="family-name"
                class="w-full h-[48px] px-[14px] py-[10px] rounded-[8px] bg-[#fffbf6] font-['PT_Sans',_sans-serif] text-[18px] text-black leading-[1.2] focus:outline-none focus:ring-2 focus:ring-black border-0"
                disabled={isSubmitting}
                placeholder="Daniel"
              />
            </div>

            <div class="flex flex-col gap-[8px]">
              <label
                for="email-mobile"
                class="font-['PT_Sans',_sans-serif] text-[16px] text-black leading-[1.2]"
              >
                Email
              </label>
              <input
                id="email-mobile"
                type="email"
                bind:value={email}
                required
                autocomplete="email"
                class="w-full h-[48px] px-[14px] py-[10px] rounded-[8px] bg-[#fffbf6] font-['PT_Sans',_sans-serif] text-[18px] text-black leading-[1.2] focus:outline-none focus:ring-2 focus:ring-black border-0"
                disabled={isSubmitting}
                placeholder="wdaniel@hackclub.com"
              />
            </div>

            <div class="flex flex-col gap-[8px]">
              <label
                for="birthday-mobile"
                class="font-['PT_Sans',_sans-serif] text-[16px] text-black leading-[1.2]"
              >
                Birthday
              </label>
              <input
                id="birthday-mobile"
                type="date"
                bind:value={birthday}
                required
                autocomplete="bday"
                class="w-full h-[48px] px-[14px] py-[10px] rounded-[8px] bg-[#fffbf6] font-['PT_Sans',_sans-serif] text-[18px] text-black leading-[1.2] focus:outline-none focus:ring-2 focus:ring-black border-0"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {#if errorMessage}
            <p
              class="text-white font-['PT_Sans',_sans-serif] text-lg bg-red-900 bg-opacity-50 px-4 py-3 rounded-lg mb-6 text-center"
            >
              {errorMessage}
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

            <div
              class="p-4 bg-[#fffbf6] rounded-[8px] w-full max-w-140 leading-[1.2]"
            >
              <div class="flex justify-between items-center mb-[0.5vh]">
                <span class="mb-1">
                  <span
                    class="font-['PT_Sans',_sans-serif] text-[14px] text-black font-semibold"
                  >
                    {rsvpCount.toLocaleString()} out of {maxRsvps.toLocaleString()}
                    sticker sheets claimed
                  </span><br />
                  <span
                    class="font-['PT_Sans',_sans-serif] text-[12px] text-black"
                  >
                    Refer 2 friends, get a sticker sheet!<br />
                    + Each referral counts as a ticket toward a raffle for a
                    <strong>Framework 12 Laptop</strong>!
                  </span>
                </span>
              </div>
              <div
                class="w-full h-[clamp(10px,_1vh,_16px)] bg-[#fffbf6] rounded-full overflow-hidden border-2 border-black"
              >
                <div
                  class="h-full bg-[#f24b4b] transition-all duration-500 ease-out rounded-full"
                  style="width: {progressPercentage}%"
                ></div>
              </div>
            </div>

            <a
              href="/faq"
              class="px-[18px] py-[8px] bg-[#fffbf6] rounded-[8px] text-center flex flex-col"
            >
              <span
                class="font-['PT_Serif',_sans-serif] font-bold text-[12px] text-[#3c3765] leading-[1.2]"
              >
                seems like your aunt left you another letter...
              </span>
              <span
                class="font-['PT_Serif',_sans-serif] font-bold text-[16px] text-[#1385f0] leading-[1.2] underline"
              >
                read the faq
              </span>
            </a>
          </div>
        </div>
      </form>
    </div>
  </div> -->

  <!-- Desktop Layout -->
  <div
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
            value={email}
          />
          <input
            id="passcode"
            type="text"
            required
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
  </div>
</section>
