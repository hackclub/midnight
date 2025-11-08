<script lang="ts">
    import { onMount } from "svelte";
    import {
    getLinkedHackatimeProjects,
    getUnlinkedHackatimeProjects,
        linkHackatimeProjects,
        type HackatimeProject,
    } from "$lib/auth";
    import Button from "../Button.svelte";
    import HackatimeEntry from "./HackatimeEntry.svelte";

    const {
        onClose,
        projectId,
    }: {
        onClose: () => void;
        projectId: string;
    } = $props();

    let page: number = $state(0);

    let submitting: boolean = $state(false);
    let error: string = $state("");

    function nextPage() {
        page++;
    }

    function backPage() {
        page--;
    }

    function skipPage(newPage: number) {
        page = newPage;
    }

    let unlinkedHackatimeProjects: HackatimeProject[] = $state([]);
    let linkedHackatimeProjects: HackatimeProject[] = $state([]);

    function trackProject(project: HackatimeProject) {
        linkedHackatimeProjects.push(project);
        unlinkedHackatimeProjects = unlinkedHackatimeProjects.filter((p) => p.name !== project.name);

        skipPage(1);
    }

    function removeProject(project: HackatimeProject) {
        linkedHackatimeProjects = linkedHackatimeProjects.filter((p) => p.name !== project.name);
        unlinkedHackatimeProjects.push(project);

        skipPage(1);
    }

    async function linkProjects() {
        submitting = true;
        const response = await linkHackatimeProjects(projectId, linkedHackatimeProjects.map((project) => project.name));

        if (!response.ok) {
            error = (await response.json())?.error || 'Failed to link hackatime project';
            submitting = false;
            return;
        }

        onClose();
    }

    onMount(async () => {
        unlinkedHackatimeProjects = (await getUnlinkedHackatimeProjects())?.projects || [];
        linkedHackatimeProjects = (await getLinkedHackatimeProjects(projectId))?.projects || [];

        nextPage();
    });
</script>

<div class="modal-overlay">
    <div class="modal-box" onclick={(e) => e.stopPropagation()} role="none">
        <div class="modal-content">
            <h2 class="modal-title">Link a hackatime project</h2>
            {#if page == 0}
                <p class="modal-text">
                    grepping your projects...
                </p>
                <div></div>
            {/if}
            {#if page == 1}
                {#if linkedHackatimeProjects.length > 0}
                    <div class="hackatime-projects">
                        {#each linkedHackatimeProjects as project}
                            <HackatimeEntry
                                action="remove"
                                actionFn={() => removeProject(project)}

                                projectName={project.name}
                                projectHours={(project.total_duration / 60 / 60).toFixed(1)}
                                projectRepo={project.repo}
                            />
                        {/each}
                    </div>
                {:else}
                    <HackatimeEntry
                        variant="empty"
                        projectName="No projects selected"
                    />
                {/if}
                <div class="multi-button">
                    <Button
                        label={linkedHackatimeProjects.length > 0 ? "+ Another Project" : "+ Add Project"}
                        onclick={nextPage}
                        disabled={submitting}
                        color="blue"
                    />
                    <Button
                        label={submitting ? 'loading...' : "FINISH →" }
                        disabled={linkedHackatimeProjects.length === 0 || submitting}
                        onclick={linkProjects}
                    />
                </div>
                {#if error} 
                    <p class="modal-text error">{error}</p>
                {/if}
            {/if}
            {#if page == 2}
                {#await unlinkedHackatimeProjects}
                    <p class="modal-text">getting hackatime projects...</p>
                    <div></div>
                {:then projects}
                    {#if projects && projects.length}
                        <div class="hackatime-projects-select">
                            {#each projects as project}
                                <HackatimeEntry
                                    projectName={project.name}
                                    action="add"
                                    actionFn={() => trackProject(project)}
                                    projectHours={(project.total_duration / 60 / 60).toFixed(1)}
                                    projectRepo={project.repo}
                                />
                            {/each}
                        </div>
                    {:else}
                        <HackatimeEntry
                            variant="empty"
                            projectName="No projects found"
                        />
                        <Button
                            label="Back"
                            onclick={() => skipPage(1)}
                        />
                    {/if}
                {/await}
            {/if}
            <!-- <button onclick={onClose} class="close">
                <img src="/icons/remove.svg" alt="close" />
            </button> -->
        </div>
    </div>
</div>

<style>
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal-box {
        position: relative;
        background-image: url("/shapes/shape-bg-1.svg");
        background-size: 100% 100%;
        background-repeat: no-repeat;
        width: 795px;
        height: 490px;
        max-width: 90vw;
        padding: 30px 37px;

        gap: 175px;
    }

    .modal-content {
        position: relative;
        width: 100%;
        height: 100%;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
    }

    .modal-title {
        font-family: "Moga", sans-serif;
        font-size: 44px;
        color: #453b61;
        text-align: left;
        letter-spacing: -0.352px;
        line-height: 1.5;
    }

    .modal-text {
        font-family: "PT Sans", sans-serif;
        font-size: 24px;
        color: #453b61;
        text-align: left;
        letter-spacing: -0.264px;
        line-height: 1.5;
        margin: 0;
    }

    .close {
        position: absolute;
        top: 10px;
        right: 10px;
        cursor: pointer;
    }

    .modal-text.error {
        padding: 8px;
        background-color: #ff6b6b;
        color: white;
    }

    .multi-button {
        display: flex;
        gap: 32px;
    }

    .hackatime-projects {
        display: flex;
        flex-direction: column;
        gap: 0;
        overflow-y: scroll;
        padding-bottom: 20px;
        height: 280px;
        border: 1px solid #453b61;
    }

    .hackatime-projects-select {
        display: flex;
        flex-direction: column;
        gap: 0;
        overflow-y: scroll;
        padding-bottom: 20px;
        height: 400px;
    }

    @media (max-width: 820px) {
        .modal-content {
            width: 90vw;
            height: auto;
            aspect-ratio: 795 / 490;
            padding: 25px 30px;
            gap: 120px;
        }

        .modal-title {
            font-size: 26px;
        }

        .modal-text {
            font-size: 20px;
        }
    }

    @media (max-width: 480px) {
        .modal-content {
            padding: 20px 25px;
            gap: 80px;
        }

        .modal-title {
            font-size: 20px;
        }

        .modal-text {
            font-size: 16px;
        }
    }
</style>
