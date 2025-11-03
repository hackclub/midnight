<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let email = '';
	let loading = false;
	let error = '';
	let success = false;

	onMount(async () => {
		if (browser) {
			const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
			try {
				const response = await fetch(`${apiUrl}/admin/session`, {
					credentials: 'include'
				});
				if (response.ok) {
					goto('/admin/dashboard');
				}
			} catch (err) {
			}
		}
	});

	async function handleLogin() {
		error = '';
		loading = true;

		try {
			const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
			const response = await fetch(`${apiUrl}/admin/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include',
				body: JSON.stringify({ email })
			});

			const data = await response.json();

			if (response.ok && data.success) {
				success = true;
				setTimeout(() => {
					goto('/admin/verify?email=' + encodeURIComponent(email));
				}, 1500);
			} else {
				error = data.message || 'Failed to send OTP. Please check your email is whitelisted.';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Admin Login - Midnight</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
	<div class="max-w-md w-full">
		<div class="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 p-8">
			<div class="text-center mb-8">
				<h1 class="text-3xl font-bold text-white mb-2">Admin Portal</h1>
				<p class="text-gray-400">Enter your email to receive an OTP code</p>
			</div>

			{#if success}
				<div class="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
					<p class="text-green-400 text-center">✓ OTP sent! Redirecting...</p>
				</div>
			{/if}

			{#if error}
				<div class="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
					<p class="text-red-400 text-sm">{error}</p>
				</div>
			{/if}

			<form on:submit|preventDefault={handleLogin} class="space-y-6">
				<div>
					<label for="email" class="block text-sm font-medium text-gray-300 mb-2">
						Email Address
					</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						required
						disabled={loading || success}
						placeholder="admin@example.com"
						class="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
					/>
				</div>

				<button
					type="submit"
					disabled={loading || success || !email}
					class="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
				>
					{#if loading}
						Sending OTP...
					{:else if success}
						OTP Sent ✓
					{:else}
						Request OTP Code
					{/if}
				</button>
			</form>

			<p class="text-center text-gray-500 text-sm mt-6">
				Only whitelisted emails can access this portal
			</p>
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>

