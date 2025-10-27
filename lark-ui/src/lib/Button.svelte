<script lang="ts">
    const { label, disabled, icon = undefined }: {
        label: string;
        disabled: boolean;
        icon?: string;
    } = $props();
</script>

<button class="submit-button" disabled={disabled}>
    <p>{label}</p>
    {#if icon}
        <img src="/icons/{icon}.svg" alt="icon" />
    {/if}
</button>

<style>
    .submit-button {
        position: relative;
        font-family: "Moga", sans-serif;
        font-size: 48px;
        color: white;

        background: #F24B4B;
        padding: 0 24px;

        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;

        cursor: pointer;
        transition: background 0.2s;

        height: 60px;
    }

    .submit-button p {
        letter-spacing: -0.5px;
        line-height: 60px;
        text-align: center;

        margin: 0;

        translate: 0 3px;
    }

    .submit-button:not(:disabled):hover {
        background: #f07575;
    }

    .submit-button:disabled:hover {
        background: #b0b0b0;
    }    

    .submit-button:disabled {
        cursor: not-allowed;
    }
</style>
