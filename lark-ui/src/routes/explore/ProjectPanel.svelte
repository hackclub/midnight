<script lang="ts">
    export let open: boolean;
    export let selectedProject: any;
    export let isRandomMode: boolean;
    export let panelHeight: number;
    export let currentTranslate: number;
    export let dragging: boolean;
    export let ready: boolean;

    export let onClose: () => void;
    export let onGenerateRandom: () => void;

    // drag events passed from parent
    export let onPointerDown: (e: PointerEvent) => void;
    export let onPointerMove: (e: PointerEvent) => void;
    export let onPointerUp: (e: PointerEvent) => void;
</script>

<!-- PANEL WRAPPER -->
<div
	class="fixed left-0 w-full flex flex-col items-center z-[78]"
	style="
		transform: translateY({currentTranslate}px);
		transition: {dragging ? 'none' : 'transform 0.35s cubic-bezier(0.25, 0.8, 0.3, 1)'};
		display: {ready ? 'flex' : 'none'};
	"
>
	<!-- PANEL BODY -->
	<div
		class="w-full bg-[#F24B4B] flex flex-col items-center justify-center rounded-b-[8vh] border-b-[3px] border-black shadow-2xl overflow-hidden"
		style="height: 70vh;"
	>
		<div class="bg-[#fee1c0] border-y-[2px] border-black h-[6.5vh] flex items-center justify-center w-full">
			<h2 class="text-[2.2vh] font-bold text-[#2A2746] font-['PT_Sans',_sans-serif]">
				{isRandomMode ? "Discover Random Projects" : "Project Preview"}
			</h2>
		</div>

		<!-- CONTENT -->
		<div class="flex flex-row justify-between items-center h-full px-[5vw] py-[4vh] text-[#fee1c0]">
			<!-- LEFT SIDE -->
			<div class="flex flex-col justify-center w-[45vw] gap-[0vh] font-['PT_Serif',_serif]">
				<div class="relative">
					<h1
						class="text-[10vh] leading-[10vh] font-extrabold mb-[3vh] font-['Moga',_sans-serif] text-black absolute top-[0.5vh] left-[-0.25vw] z-[-1]"
					>
						{selectedProject.name}
					</h1>
					<h1
						class="text-[10vh] leading-[10vh] font-extrabold mb-[3vh] font-['Moga',_sans-serif] text-[#fee1c0]"
					>
						{selectedProject.name}
					</h1>
				</div>

				<div class="flex items-center justify-start text-white font-extrabold font-sans gap-[0.5vw] mb-[1.5vh]">
					<p class="bg-[#54a0f1] text-black border-2 border-black rounded-full py-[0.5vh] px-[1.5vw]">4 hours</p>
					<p class="bg-[#54a0f1] text-black border-2 border-black rounded-full py-[0.5vh] px-[1.5vw]">2 weeks ago</p>
				</div>

				<p class="text-[2.2vh] leading-relaxed max-w-[50ch] opacity-90 font-extrabold">
					{selectedProject.desc}
				</p>

				<div class="flex items-center justify-start text-white font-extrabold font-sans gap-[0.5vw] mb-[1.5vh] mt-[1vh]">
					<p class="bg-neutral-900/30 cursor-pointer text-[#fee1c0] rounded-[0.2vh] py-[0.5vh] px-[1.5vw]">Github</p>
					<p class="bg-neutral-900/30 cursor-pointer text-[#fee1c0] rounded-[0.2vh] py-[0.5vh] px-[1.5vw]">Live Demo</p>
				</div>

				{#if isRandomMode}
					<button on:click={onGenerateRandom} class="pushable mt-[2vh] w-fit">
						<span class="front text-[2.3vh]">🎲 Discover Random Project</span>
					</button>
				{/if}
			</div>

			<!-- RIGHT SIDE IMG -->
			<div class="flex justify-center items-center w-[40vw]">
				<div class="bg-[#fee1c0] p-[1vh] rounded-[2vh] shadow-2xl border-[3px] border-black">
					<img
						src={selectedProject.img}
						alt={selectedProject.name}
						class="rounded-[1.5vh] shadow-xl w-[100%] h-auto object-cover border border-black no-select"
						draggable="false"
					/>
				</div>
			</div>
		</div>
	</div>

	<!-- DRAG HANDLE -->
	<div
		on:pointerdown={onPointerDown}
		on:pointermove={onPointerMove}
		on:pointerup={onPointerUp}
		class="absolute left-[5vw] bottom-[-11vh] w-[8vh] h-[12vh] hover:bottom-[-12vh] hover:h-[13vh] transition-all rounded-b-[10vh] bg-[#F24B4B] border-b-4 border-black flex items-end justify-center shadow-2xl cursor-grab drag-handle"
	>
		<img src="/sad.png" class="h-[6vh] mb-[2.5vh] no-select" alt="trigger" draggable="false" />
	</div>
</div>

<style>
	.pushable {
		background: #000;
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
		background: #fee1c0;
		color: #2a2746;
		transform: translateY(-8px) translateX(8px);
		transition: transform 600ms cubic-bezier(0.3, 0.7, 0.4, 1);
		font-family: 'PT Serif', serif;
		font-weight: 700;
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
