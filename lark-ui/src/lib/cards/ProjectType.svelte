<script lang="ts">
    const { type } = $props();

    function createLink(projectType: string) {
        return '/app/projects/create?type=' + encodeURIComponent(projectType);
    }
</script>

<a href="{createLink(type)}" class="card-link">
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
