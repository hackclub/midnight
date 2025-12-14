<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { checkAuthStatus } from '$lib/auth';
	import Button from '$lib/Button.svelte';

	let loading = $state(true);
	let success = $state(false);
	let error = $state('');
	let token = $state('');

	onMount(async () => {
		const urlParams = new URLSearchParams(window.location.search);
		token = urlParams.get('token') || '';

		if (!token) {
			error = 'No token provided. Please use the link from Slack.';
			loading = false;
			return;
		}

		const authStatus = await checkAuthStatus();
		if (!authStatus) {
			error = 'Please log in to your Midnight account first.';
			loading = false;
			return;
		}

		try {
			const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
			const response = await fetch(`${apiUrl}/api/user/slack/link`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token }),
			});

			const data = await response.json();

			if (response.ok && data.success) {
				success = true;
				setTimeout(() => {
					goto('/app');
				}, 2000);
			} else {
				error = data.message || 'Failed to link Slack account.';
			}
		} catch (e) {
			error = 'An error occurred while linking your account.';
		} finally {
			loading = false;
		}
	});
</script>

<div class="link-page">
	<div class="link-container">
		{#if loading}
			<div class="link-content">
				<div class="loading">
					<img src="/loading/crow_fly.gif" alt="Loading..." />
				</div>
				<p class="link-text">Linking your Slack account...</p>
			</div>
		{:else if success}
			<div class="link-content">
				<h1 class="link-title">Successfully Linked!</h1>
				<p class="link-text">Your Slack account is now linked to your Midnight account. You'll receive notifications when your submissions are reviewed.</p>
				<p class="link-text-small">Redirecting to dashboard...</p>
			</div>
		{:else}
			<div class="link-content">
				<h1 class="link-title">Link Failed</h1>
				<p class="link-text">{error}</p>
				<div class="link-buttons">
					<Button label="Log In" onclick={() => goto('/login')} color="red" />
					<Button label="Go to Dashboard" onclick={() => goto('/app')} color="black" />
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.link-page {
		position: relative;
		min-height: 100vh;
		background: #453b61;
		padding: 57px 50px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.link-container {
		max-width: 600px;
		width: 100%;
	}

	.link-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 24px;
	}

	.link-title {
		font-family: "Moga", sans-serif;
		font-size: 90px;
		color: white;
		letter-spacing: -0.99px;
		margin: 0;
		line-height: 1.5;
	}

	.link-text {
		font-family: "PT Sans", sans-serif;
		font-size: 20px;
		font-weight: 400;
		color: white;
		margin: 0;
	}

	.link-text-small {
		font-family: "PT Sans", sans-serif;
		font-size: 16px;
		font-weight: 400;
		color: white;
		margin: 0;
		opacity: 0.8;
	}

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.loading img {
		image-rendering: pixelated;
		width: 250px;
		height: auto;
	}

	.link-buttons {
		display: flex;
		gap: 24px;
		flex-wrap: wrap;
		justify-content: center;
		margin-top: 16px;
	}

	@media (max-width: 768px) {
		.link-page {
			padding: 32px 20px;
		}

		.link-title {
			font-size: 60px;
		}

		.link-text {
			font-size: 18px;
		}

		.link-buttons {
			flex-direction: column;
			width: 100%;
		}

		.link-buttons :global(button) {
			width: 100%;
		}
	}

	@media (max-width: 480px) {
		.link-title {
			font-size: 40px;
		}
	}
</style>


