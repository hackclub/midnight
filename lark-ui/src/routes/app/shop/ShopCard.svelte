<script lang="ts">
    const { index, name, img, desc, requiredHours }: {
        index: number;
        name: string;
        desc: string;
        img: string;
        requiredHours: number | null;
    } = $props();
</script>

<a
    href={`/app/shop/${index}`}
    class="group cursor-pointer rounded-[2vh] gap-[1vh] flex flex-col s-center text-center transition-all no-select"
>
    <div
        class="bg-[#5E5087] p-[2vh] border border-black rounded-[2vh] shadow-lg transition-all duration-200 ease-out group-hover:rotate-[2deg] group-hover:shadow-2xl group-hover:scale-[1.1]"
    >
        <img
            src={img}
            alt={name}
            class="rounded-[1.5vh] mb-[1vh] w-full h-[25vh] object-cover border-2 border-black transition-all duration-200 ease-out no-select"
            draggable="false"
        />
        <div class="flex s-center justify-center no-select">
            <p>{requiredHours ? `${requiredHours} hours needed` : 'Free'}</p>
        </div>
    </div>

    <div
        class="bg-[#5E5087] px-[0] py-[1vh] w-full border border-black rounded-[2vh] shadow-lg transition-all duration-200 ease-out group-hover:-rotate-[3deg] group-hover:shadow-2xl group-hover:scale-[1.05]"
    >
        <h3 class="text-[3vh] font-bold font-['PT_Serif',_serif] border-b border-black pb-[0.5vh] px-[1vw] line-clamp-2 overflow-hidden text-ellipsis break-words">
            {name}
        </h3>
        <p class="text-[2vh] opacity-80 pt-[0.5vh] px-[1vw] line-clamp-2 overflow-hidden text-ellipsis">{desc}</p>
    </div>
</a>
