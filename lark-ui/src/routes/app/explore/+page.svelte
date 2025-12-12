<script lang="ts">
	import { onMount } from "svelte";
	import ProjectCard from "./ProjectCard.svelte";
	import ProjectPanel from "./ProjectPanel.svelte";
	import Leaderboard from "./Leaderboard.svelte";
	import { getApprovedProjects, getLeaderboard, type ApprovedProject, type LeaderboardEntry } from "$lib/auth";

	/* Sounds */
	const soundFiles = Array.from({ length: 7 }, (_, i) => `/sounds/sound${i + 1}.mp3`);

	function playRandomSound() {
		const randomSound = new Audio(soundFiles[Math.floor(Math.random() * soundFiles.length)]);
		randomSound.volume = 0.4;
		randomSound.play().catch(() => {});
	}

	/* Panel & Drag  */
	let open = $state(false);
	let isRandomMode = $state(true);
	let pointerId: number | null = null;
	let dragging = $state(false);
	let panelHeight = $state(0);
	let currentTranslate = $state(0);
	let startOffset = 0;
	let ready = $state(false);

	let allProjects = $state<Array<{
		id: number;
		name: string;
		desc: string;
		img: string;
		repoUrl?: string | null;
		playableUrl?: string | null;
	}>>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	let visibleCount = $state(32);
	let visibleProjects = $derived(allProjects.slice(0, visibleCount));
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

	function mapProject(project: ApprovedProject) {
		return {
			id: project.projectId,
			name: project.projectTitle,
			desc: project.description || "",
			img: project.screenshotUrl || "/placeholder.png",
			repoUrl: project.repoUrl,
			playableUrl: project.playableUrl,
			approvedHours: project.approvedHours,
		};
	}

	onMount(async () => {
		panelHeight = window.innerHeight * 0.7;
		currentTranslate = -panelHeight;
		
		try {
			const approvedProjects = await getApprovedProjects();
			allProjects = approvedProjects.map(mapProject);
			visibleProjects = allProjects.slice(0, visibleCount);
			if (allProjects.length > 0) {
				selectedProject = allProjects[Math.floor(Math.random() * allProjects.length)];
			}
			error = null;
		} catch (err) {
			console.error("Failed to load approved projects:", err);
			error = err instanceof Error ? err.message : "Failed to load projects";
			allProjects = [];
		} finally {
			loading = false;
			setupObserver();
			ready = true;
		}

		try {
			const [hoursData, approvedData] = await Promise.all([
				getLeaderboard('hours'),
				getLeaderboard('approved')
			]);
			leaderboardHours = hoursData;
			leaderboardApproved = approvedData;
			leaderboardError = null;
		} catch (err) {
			console.error("Failed to load leaderboard:", err);
			leaderboardError = err instanceof Error ? err.message : "Failed to load leaderboard";
			leaderboardHours = [];
			leaderboardApproved = [];
		} finally {
			leaderboardLoading = false;
		}
	});

	/* Project Select */
	let selectedProject = $state<{
		name: string;
		desc: string;
		img: string;
		repoUrl?: string | null;
		playableUrl?: string | null;
		approvedHours?: number | null;
	} | null>(null);

	function generateRandomProject() {
		if (allProjects.length > 0) {
			selectedProject = allProjects[Math.floor(Math.random() * allProjects.length)];
			isRandomMode = true;
		}
	}

	function openProjectPanel(project: any) {
		selectedProject = project;
		isRandomMode = false;
		open = true;
		currentTranslate = 0;
	}

	/* Draging */
	let dragStartY = 0;
	let hasDragged = false;

	function handlePointerDown(e: PointerEvent) {
		if (e.pointerType === "mouse" && e.button !== 0) return;
		const target = e.currentTarget as HTMLElement;
		target.setPointerCapture(e.pointerId);
		pointerId = e.pointerId;
		startOffset = e.clientY - currentTranslate;
		dragStartY = e.clientY;
		hasDragged = false;
		dragging = true;
	}

	function handlePointerMove(e: PointerEvent) {
		if (!dragging || pointerId !== e.pointerId) return;
		const deltaY = Math.abs(e.clientY - dragStartY);
		if (deltaY > 5) {
			hasDragged = true;
		}
		currentTranslate = e.clientY - startOffset;
		currentTranslate = Math.min(0, Math.max(currentTranslate, -panelHeight));
	}

	function handlePointerUp(e: PointerEvent) {
		if (pointerId !== e.pointerId) return;
		const target = e.currentTarget as HTMLElement;
		target.releasePointerCapture(e.pointerId);
		pointerId = null;
		dragging = false;

		if (!hasDragged) {
			open = !open;
			currentTranslate = open ? 0 : -panelHeight;
			if (open && isRandomMode) generateRandomProject();
		} else {
			const midpoint = -panelHeight / 2;
			open = currentTranslate > midpoint;
			currentTranslate = open ? 0 : -panelHeight;

			if (open && isRandomMode) generateRandomProject();
		}
	}

	/* Leaderboard */
	let leaderboardHours = $state<LeaderboardEntry[]>([]);
	let leaderboardApproved = $state<LeaderboardEntry[]>([]);
	let leaderboardLoading = $state(true);
	let leaderboardError = $state<string | null>(null);

</script>

<Leaderboard hoursLeaderboard={leaderboardHours} approvedLeaderboard={leaderboardApproved} />

{#if selectedProject}
	<ProjectPanel
		{open}
		selectedProject={selectedProject}
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
{/if}

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

	{#if loading}
		<div class="flex justify-center items-center py-[10vh]">
			<p class="text-[3vh]">Loading projects...</p>
		</div>
	{:else if error}
		<div class="flex flex-col justify-center items-center py-[10vh] gap-[2vh]">
			<p class="text-[3vh] text-red-400">Error loading projects</p>
			<p class="text-[2vh] opacity-75">{error}</p>
		</div>
	{:else if allProjects.length === 0}
		<div class="flex justify-center items-center py-[10vh]">
			<p class="text-[3vh]">No approved projects yet. Check back soon!</p>
		</div>
	{:else}
		<div class="grid w-full px-[3vw] gap-x-[3vw] gap-y-[6vh] pb-[10vh]" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));">
			{#each visibleProjects as project (project.id)}
				<ProjectCard
					{project}
					onOpen={openProjectPanel}
					onHover={playRandomSound}
				/>
			{/each}
			<div bind:this={sentinel}></div>
		</div>
	{/if}
</main>
