<script lang="ts">
    import BottomNavigation from '$lib/BottomNavigation.svelte';

	let { children } = $props();
</script>

{@render children?.()}

<BottomNavigation />