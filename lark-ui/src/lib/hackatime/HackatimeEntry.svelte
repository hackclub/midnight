<script lang="ts">
    const {
        projectName,
        action,
        actionFn,
        variant = "default",
    }: {
        projectName: string;
        action?: 'add' | 'remove' | 'none';
        actionFn?: () => void;
        variant?: "default" | "empty";
    } = $props();
</script>

<svelte:head>
    <style>
        @font-face {
            font-family: "Moga";
            src: url("/font/Moga.ttf") format("truetype");
            font-weight: normal;
            font-style: normal;
        }
        @font-face {
            font-family: "PT Sans";
            src: url("/font/PTSans-Regular.ttf") format("truetype");
            font-weight: normal;
            font-style: normal;
        }
    </style>
</svelte:head>

<div class="hackatime-entry" class:empty={variant === "empty"}>
    {#if variant === "empty"}
        <div class="project-details">
            <h2 class="project-name">{projectName}</h2>
        </div>
    {:else}
        <div class="project-details">
            <h2 class="project-name">{projectName}</h2>

            <p class="project-hours">
                2 HOURS ALL TIME
            </p>

            <p class="project-path">/path/ • githubUrl</p>
        </div>

        {#if action === 'add'}
            <button class="action" onclick={actionFn} tabindex="0" aria-label="add_project">
                <img src="/icons/add.svg" alt="add" />
            </button>
        {/if}
        {#if action === 'remove'}
            <button class="action" onclick={actionFn} tabindex="0" aria-label="remove_project">
                <img src="/icons/remove.svg" alt="remove" />
            </button>
        {/if}
    {/if}
</div>

<style>
    .hackatime-entry {
        position: relative;

        width: 620px;
        min-height: 160px;
        height: 160px;

        margin: 4px;

        background-color: #FFBB31;

        mask-image: url('/shapes/shape-bg-1.svg');

    }

    .project-details {
        position: absolute;
        left: 30px;
        top: 40px;

        display: flex;
        flex-direction: column;
    }

    .project-name {
        font-family: "Moga", sans-serif;
        font-size: 64px;
        color: #453b61;
        letter-spacing: -0.7px;
        line-height: 0.8;
        margin: 0;
    }

    .project-hours {
        font-family: "Moga", sans-serif;
        font-size: 24px;
        color: #453b61;
        letter-spacing: -0.1px;
        line-height: normal;
        margin: 0;
    }

    .project-path {
        font-family: "PT Sans", sans-serif;
        font-size: 16px;
        color: #453b61;
        letter-spacing: -0.1;
        line-height: normal;
        margin: 0;
    }

    .action {
        cursor: pointer;
        position: absolute;
        right: 24px;
        top: 24px;
        width: 32px;
        height: 32px;
    }

    .empty {
        background-color: #c0c0c0;
    }

    .empty .project-details {
        left: 0;
        width: 100%;
        top: 50%;
        transform: translate(0, -50%);
        text-align: center;
    }
</style>
