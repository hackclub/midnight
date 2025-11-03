<script lang="ts">
  import { goto } from '$app/navigation';
</script>

<div class="w-full px-8 md:px-12 lg:px-16 2xl:px-12 pt-[37px] 2xl:pt-[36px] pb-8 2xl:pb-16 relative z-10">
  <div class="flex items-center justify-between gap-4 2xl:gap-8">
    <button 
      on:click={() => goto('/')}
      class="font-['Moga',_sans-serif] text-[#fee1c0] text-2xl md:text-3xl lg:text-[48px] 2xl:text-[48px] text-nowrap whitespace-pre flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
    >
      HACK CLUB PRESENTS
    </button>
    <div class="flex-1 hidden md:flex items-center justify-center px-4 2xl:px-8">
      <img alt="" class="h-[15px] lg:h-[24px] 2xl:h-[24px]" style="aspect-ratio: 774/23;" src="/50dd9bc384eb7e83c20f7e791a0a4bb37635a7cc.svg" />
    </div>
    <p class="font-['Moga',_sans-serif] text-[#fee1c0] text-2xl md:text-3xl lg:text-[48px] 2xl:text-[48px] text-nowrap text-right whitespace-pre flex-shrink-0">A MURDER   MYSTERY</p>
  </div>
</div>

<div class="absolute top-0 left-0 w-full h-screen min-h-[800px] pointer-events-none overflow-hidden">
  <img alt="Castle" class="w-full h-full min-h-[800px] object-cover object-top 2xl:scale-[120%] 2xl:translate-y-[-80px]" src="/castle.svg" />
</div>

