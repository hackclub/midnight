<script lang="ts">
    export let project: {
        name: string;
        desc: string;
        img: string;
    };

    export let onOpen: (project: any) => void;
    export let onHover: () => void;
</script>

<div
    on:click={() => onOpen(project)}
    on:mouseenter={onHover}
    class="group cursor-pointer rounded-[2vh] gap-[1vh] flex flex-col items-center text-center transition-all no-select"
>
    <div
        class="bg-[#5E5087] p-[2vh] border border-black rounded-[2vh] shadow-lg transition-all duration-200 ease-out group-hover:rotate-[2deg] group-hover:shadow-2xl group-hover:scale-[1.1]"
    >
        <img
            src={project.img}
            alt={project.name}
            class="rounded-[1.5vh] mb-[1vh] w-full h-[25vh] object-cover border-2 border-black transition-all duration-200 ease-out no-select"
            draggable="false"
        />
        <div class="flex items-center justify-center no-select">
            <p>4 hours</p>
            <div class="w-[0.5vh] h-[0.5vh] bg-[#fee1c0] rounded-full mx-[1vw]"></div>
            <p>2 weeks ago</p>
        </div>
    </div>

    <div
        class="bg-[#5E5087] px-[0] py-[1vh] w-full border border-black rounded-[2vh] shadow-lg transition-all duration-200 ease-out group-hover:-rotate-[3deg] group-hover:shadow-2xl group-hover:scale-[1.05]"
    >
        <h3 class="text-[3vh] font-bold font-['PT_Serif',_serif] border-b border-black pb-[0.5vh]">
            {project.name}
        </h3>
        <p class="text-[2vh] opacity-80 pt-[0.5vh] px-[1vw]">{project.desc.slice(0,65)}...</p>
    </div>
</div>
