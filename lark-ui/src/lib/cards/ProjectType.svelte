<script lang="ts">
    const { type, fromOnboarding = false } = $props();

    const href = $derived('/app/projects/create?type=' + encodeURIComponent(type) + (fromOnboarding ? '&from=onboarding&return=select' : ''));

    let randRot = $state(Math.random() > 0.5 ? 1 : -1);
</script>

<a href="{href}" class="card-link" style="--rand-rot: {randRot}deg">
    <img src="/cards/{type}.svg" alt="Personal Website" class="card-svg" />
</a>

<style>
    .card-link {
        display: block;

        transition: all 250ms cubic-bezier(0.3, 0.7, 0.4, 1);
    }

    .card-link:hover {
        scale: 1.035;
        rotate: var(--rand-rot);
        transition: all 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5);
        cursor: pointer;
    }
</style>
