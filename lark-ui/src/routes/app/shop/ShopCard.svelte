<script lang="ts">
    import type { ShopItemVariant } from "$lib/auth";

    const { itemId, name, img, desc, requiredHours, isActive = true, variants = [] }: {
        itemId: number;
        name: string;
        desc: string;
        img: string;
        requiredHours: number | null;
        isActive?: boolean;
        variants?: ShopItemVariant[];
    } = $props();

    const hasVariants = variants.length > 0;
    const minVariantCost = hasVariants ? Math.min(...variants.map(v => v.cost)) : null;
    const maxVariantCost = hasVariants ? Math.max(...variants.map(v => v.cost)) : null;

    function getDisplayPrice(): string {
        if (hasVariants && minVariantCost !== null && maxVariantCost !== null) {
            if (minVariantCost === maxVariantCost) {
                return `${minVariantCost} hours`;
            }
            return `${minVariantCost} - ${maxVariantCost} hours`;
        }
        if (requiredHours) {
            return `${requiredHours} hours needed`;
        }
        return 'Free';
    }
</script>

<a
    href={isActive ? `/app/shop/${itemId}` : undefined}
    class="group rounded-[2vh] flex flex-col s-center text-center transition-all no-select 
        {isActive ? 'cursor-pointer' : 'cursor-not-allowed opacity-50 grayscale'}"
    onclick={(e) => !isActive && e.preventDefault()}
>

    <div
        class="bg-[#F24B4B] py-[3vh] px-[1.25vw] pt-[3.75vh] shadow-lg
            transition-all duration-200 ease-out relative
            {isActive ? 'group-hover:scale-[1.03]' : ''}"
    >
        <div class="bg-[#453b61] rounded-full w-[7vh] h-[7vh] absolute top-[-3.5vh] left-[-3.5vh]"></div>
        <div class="bg-[#453b61] rounded-full w-[7vh] h-[7vh] absolute top-[-3.5vh] right-[-3.5vh]"></div>
        <div class="bg-[#453b61] rounded-full w-[7vh] h-[7vh] absolute bottom-[-3.5vh] left-[-3.5vh]"></div>
        <div class="bg-[#453b61] rounded-full w-[7vh] h-[7vh] absolute bottom-[-3.5vh] right-[-3.5vh]"></div>

        {#if img}
            <img
                src={img}
                alt={name}
                class="rounded-[1.5vh] mb-[1vh] w-[92.5%] mx-auto h-[25vh] object-cover border-2 border-black no-select"
                draggable="false"
            />
        {:else}
            <div class="rounded-[1.5vh] mb-[1vh] w-full h-[25vh] bg-[#453b61] border-2 border-black flex items-center justify-center">
                <span class="text-4xl">🛍️</span>
            </div>
        {/if}


        <h3 class="text-[3vh] font-bold font-['PT_Serif',_serif] pb-[0.5vh] line-clamp-2 px-[1vw]">
            {name}
        </h3>

        <div class="relative my-[2vh]">
            <div class="w-full h-[1px] bg-black"></div>
            <p class="bg-[#c13c3c] min-w-fit w-[60%] border-black border items-center justify-center flex-nowrap flex top-[-1.5vh] left-[50%] translate-x-[-50%] absolute py-[0.25vh] px-[1vw] rounded-full text-[1.5vh]">{getDisplayPrice()}</p>
        </div>

        <p class="text-[2vh] opacity-80 pt-[0.5vh] px-[1vw] line-clamp-2 leading-[3vh]">
            {desc}
        </p>


        <div class="flex flex-col s-center justify-center mt-[1vh] relative">

            {#if hasVariants}
                <p class="text-blue-200 font-extrabold w-fit px-[2vw] underline mx-auto rounded-full text-[1.5vh] italic">{variants.length} option{variants.length > 1 ? 's' : ''}</p>
            {/if}

            {#if !isActive}
                <p class="text-red-400 text-sm">Unavailable</p>
            {/if}
        </div>
    </div>
</a>

