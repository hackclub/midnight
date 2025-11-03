<script lang="ts">
    const { type, fromOnboarding = false } = $props();

    const href = $derived('/app/projects/create?type=' + encodeURIComponent(type) + (fromOnboarding ? '&from=onboarding&return=select' : ''));
</script>

<a href="{href}" class="card-link">
    <img src="/cards/{type}.svg" alt="Personal Website" class="card-svg" />
</a>

<style>
    .card-link {
        display: block;
        transition: all 0.1s ease-in;
    }

    .card-link:hover {
        translate: 0px -8px;
        transition: all 0.1s ease-out;
        cursor: pointer;
    }
</style>
