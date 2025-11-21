<script lang="ts">
	import BottomNavigation from "$lib/BottomNavigation.svelte";
	import { onMount } from "svelte";
	import ProjectCard from "./ProjectCard.svelte";
	import ProjectPanel from "./ProjectPanel.svelte";
	import Leaderboard from "./Leaderboard.svelte";

	/* Sounds */
	const soundFiles = Array.from({ length: 7 }, (_, i) => `/sounds/sound${i + 1}.mp3`);

	function playRandomSound() {
		const randomSound = new Audio(soundFiles[Math.floor(Math.random() * soundFiles.length)]);
		randomSound.volume = 0.4;
		randomSound.play().catch(() => {});
	}

	/* Panel & Drag  */
	let open = false;
	let isRandomMode = true;
	let pointerId: number | null = null;
	let dragging = false;
	let panelHeight = 0;
	let currentTranslate = 0;
	let startOffset = 0;
	let ready = false;

	const allProjects = Array.from({ length: 320 }, (_, i) => ({
		name: `Project ${i + 1}`,
		desc: `This is a description for project number description for project number  ${i + 1}.`,
		img: `https://placehold.co/600x400?text=Project+${i + 1}`
	}));

	let visibleCount = 32;
	let visibleProjects = allProjects.slice(0, visibleCount);
	let sentinel: HTMLElement;

	function loadMore() {
		if (visibleCount < allProjects.length) {
			visibleCount += 32;
			visibleProjects = allProjects.slice(0, visibleCount);
		}
	}

	function setupObserver() {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) loadMore();
				}
			},
			{ rootMargin: "200px" }
		);
		if (sentinel) observer.observe(sentinel);
	}

	onMount(() => {
		panelHeight = window.innerHeight * 0.7;
		currentTranslate = -panelHeight;
		setupObserver();
		ready = true;
	});

	/* Project Select */
	let selectedProject = allProjects[Math.floor(Math.random() * allProjects.length)];

	function generateRandomProject() {
		selectedProject = allProjects[Math.floor(Math.random() * allProjects.length)];
		isRandomMode = true;
	}

	function openProjectPanel(project: any) {
		selectedProject = project;
		isRandomMode = false;
		open = true;
		currentTranslate = 0;
	}

	/* Draging */
	function handlePointerDown(e: PointerEvent) {
		if (e.pointerType === "mouse" && e.button !== 0) return;
		const target = e.currentTarget as HTMLElement;
		target.setPointerCapture(e.pointerId);
		pointerId = e.pointerId;
		startOffset = e.clientY - currentTranslate;
		dragging = true;
	}

	function handlePointerMove(e: PointerEvent) {
		if (!dragging || pointerId !== e.pointerId) return;
		currentTranslate = e.clientY - startOffset;
		currentTranslate = Math.min(0, Math.max(currentTranslate, -panelHeight));
	}

	function handlePointerUp(e: PointerEvent) {
		if (pointerId !== e.pointerId) return;
		const target = e.currentTarget as HTMLElement;
		target.releasePointerCapture(e.pointerId);
		pointerId = null;
		dragging = false;

		const midpoint = -panelHeight / 2;
		open = currentTranslate > midpoint;
		currentTranslate = open ? 0 : -panelHeight;

		if (open && isRandomMode) generateRandomProject();
	}

	/* Leaderboard */
	const leaderboard:any = [
        { name: "Alice", hours: 120, approvedHours: 110, coins: 450 },
        { name: "Bob", hours: 98, approvedHours: 90, coins: 380 },
        { name: "Charlie", hours: 105, approvedHours: 103, coins: 410 },
        { name: "Diana", hours: 75, approvedHours: 70, coins: 260 },
        { name: "Ethan", hours: 89, approvedHours: 82, coins: 310 },
        { name: "Farah", hours: 112, approvedHours: 109, coins: 420 },
        { name: "George", hours: 66, approvedHours: 64, coins: 200 },
        { name: "Hana", hours: 134, approvedHours: 130, coins: 500 },
        { name: "Ivan", hours: 92, approvedHours: 90, coins: 330 },
        { name: "Julia", hours: 101, approvedHours: 99, coins: 390 }
    ];

</script>

<Leaderboard {leaderboard} />

<ProjectPanel
	{open}
	{selectedProject}
	{isRandomMode}
	{panelHeight}
	{currentTranslate}
	{dragging}
	{ready}
	onClose={() => {
		open = false;
		currentTranslate = -panelHeight;
	}}
	onGenerateRandom={generateRandomProject}
	onPointerDown={handlePointerDown}
	onPointerMove={handlePointerMove}
	onPointerUp={handlePointerUp}
/>

<div
	class={`w-full fixed left-0 top-0 h-screen bg-neutral-800/20 backdrop-blur-[2px] z-[77] transition-all duration-600 ease-in-out ${
		open ? "opacity-100" : "opacity-0 pointer-events-none"
	}`}
	on:click={() => {
		open = false;
		currentTranslate = -panelHeight;
	}}
></div>

<main class="relative z-[1] pt-[8vh] pb-[10vh] flex flex-col items-center text-center text-[#fee1c0] bg-[#443B61] min-h-screen font-['PT_Sans',_sans-serif]">
	<div class="relative">
		<h1 class="text-[15vh] leading-[12vh] font-extrabold mb-[3vh] font-['Moga',_sans-serif] text-black absolute top-[0.75vh] left-[-0.5vw] z-[-1]">
			Midnight Gallery
		</h1>
		<h1 class="text-[15vh] leading-[12vh] font-extrabold mb-[3vh] font-['Moga',_sans-serif] text-[#fee1c0]">
			Midnight Gallery
		</h1>
	</div>

	<p class="max-w-[40vw] text-[2.5vh] mb-[5vh] opacity-90 font-['PT_Serif',_sans-serif] font-extrabold">
		Check out featured projects below - or click the red button to generate a new random one!
	</p>

	<div class="grid grid-cols-4 w-full px-[3vw] gap-x-[3vw] gap-y-[6vh] pb-[10vh]">
		{#each visibleProjects as project (project.name)}
			<ProjectCard
				{project}
				onOpen={openProjectPanel}
				onHover={playRandomSound}
			/>
		{/each}
		<div bind:this={sentinel}></div>
	</div>
</main>

<BottomNavigation />
