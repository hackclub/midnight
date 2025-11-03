<script lang="ts">
  import { page } from '$app/stores';
  import MidnightHeader from '$lib/MidnightHeader.svelte';
  import { goto } from '$app/navigation';
</script>

<div class="bg-[#443B61] min-h-screen flex flex-col">
  <section
    class="bg-[#f24b4b] flex flex-col items-center justify-start flex-grow relative overflow-hidden"
  >
    <MidnightHeader />

    <div class="flex flex-col items-center text-center px-6 z-10 pt-[7.5vh]">
      <div class="relative">
        <h1
          class="text-black bg-[#443B61]/0 px-[3vw] rounded-xl py-0 my-0 font-['PT_Serif',_serif] text-[22.5vh] md:text-[30vh] font-extrabold leading-[30vh]"
        >
          404
        </h1>
        <h1
          class="text-[#fee1c0] absolute top-[0.5vh] left-[0.5vh] md:top-[-1vh] md:left-[1.5vh] bg-[#443B61]/0 px-[3vw] rounded-xl py-0 my-0 font-['PT_Serif',_serif] text-[22.5vh] md:text-[30vh] font-extrabold leading-[30vh]"
        >
          404
        </h1>
      </div>

      <p
        class="text-[#fee1c0] font-['PT_Sans',_sans-serif] text-[2.5vh] md:text-[3.25vh] font-bold mb-[3vh] mt-[3vh] max-w-2xl"
      >
        Sorry, we couldn't find
        <strong>{ $page.url.pathname }</strong>.<br />
        Maybe it was lost in the mystery...
      </p>

      <button
        on:click={() => goto('/')}
        class="pushable"
      >
        <span
          class="front font-['Moga',_sans-serif] text-[#fee1c0] text-center tracking-[4px]"
        >
          Go Back Home
        </span>
      </button>
    </div>
  </section>
</div>

<style>
  .pushable {
    background: #000000;
    border: none;
    border-radius: 2.5vh; 
    padding: 0;
    cursor: pointer;
    transform: translateY(8px) translateX(-8px);
  }

  .front {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 10vh; 
    padding: 0 2vw; 
    font-size: 5vh;
    border-radius: 2.5vh;
    background: #f24b4b;
    color: #fee1c0;
    transform: translateY(-8px) translateX(8px);
    transition: transform 600ms cubic-bezier(0.3, 0.7, 0.4, 1);
  }

  .pushable:hover .front {
    transform: translateY(-12px) translateX(12px);
    transition: transform 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5);
  }

  .pushable:active .front {
    transform: translateY(-2px) translateX(4px);
    transition: transform 34ms;
  }
</style>


