<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import "../app.css";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />

	<style>
		@font-face {
			font-family: 'Moga';
			src: url('/font/Moga.ttf') format('truetype');
			font-weight: normal;
			font-style: normal;
		}
		@font-face {
			font-family: 'PT Sans';
			src: url('/font/PTSans-Regular.ttf') format('truetype');
			font-weight: normal;
			font-style: normal;
		}
		@font-face {
			font-family: 'PT Serif';
			src: url('/font/PTSerif-Regular.ttf') format('truetype');
			font-weight: normal;
			font-style: normal;
		}
		@font-face {
			font-family: 'Ws Paradose';
			src: url('/font/Ws Paradose.ttf') format('truetype');
			font-weight: normal;
			font-style: normal;
		}
		@font-face {
			font-family: 'Ws Paradose';
			src: url('/font/Ws Paradose Italic.ttf') format('truetype');
			font-weight: normal;
			font-style: italic;
		}
	</style>
</svelte:head>

{@render children?.()}
