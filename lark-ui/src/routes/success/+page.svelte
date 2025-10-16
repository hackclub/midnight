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
        <div class="relative w-full aspect-square max-w-[333px]">
          <div class="absolute inset-0 ">
            <img 
              alt="Crow illustration" 
              class="w-full h-full object-contain" 
              src="/sad.png" 
            />
          </div>
        </div>
      </div>

      <h1 class="font-['PT_Serif',_serif] font-bold text-[#081832] text-3xl md:text-4xl lg:text-[48px] text-center leading-normal">
        your email will come next week
      </h1>

      <p class="font-['PT_Sans',_sans-serif] text-[#081832] text-[18px] text-center leading-normal max-w-[1097px]">
        your estranged aunt dropped it in her mailbox but postal employees are on strike
      </p>
    </div>
  </div>
  
  <footer class="w-full py-4 px-4 mt-8">
    <p class="font-['PT_Sans',_sans-serif] text-[#081832] text-[16px] text-center leading-normal">
      An in-person <span class="text-[#f24b4b]">murder mystery</span> by Hack Club ⋅ January 2026 ⋅ Vienna, Austria
    </p>
  </footer>
</div>

