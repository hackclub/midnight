<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let email = '';
	let otpCode = '';
	let loading = false;
	let error = '';

	onMount(async () => {
		if (browser) {
			email = $page.url.searchParams.get('email') || '';
			if (!email) {
				goto('/admin');
				return;
			}

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

	async function handleVerify() {
		error = '';
		loading = true;

		try {
			const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
			const response = await fetch(`${apiUrl}/admin/verify-otp`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include',
				body: JSON.stringify({ email, otpCode })
			});

			const data = await response.json();

			if (response.ok && data.success) {
				goto('/admin/dashboard');
			} else {
				error = 'Invalid or expired OTP code';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		} finally {
			loading = false;
		}
	}

	function handleOtpInput(e: Event) {
		const target = e.target as HTMLInputElement;
		otpCode = target.value.replace(/\D/g, '').slice(0, 6);
	}
</script>

<svelte:head>
	<title>Verify OTP - Admin Portal</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
	<div class="max-w-md w-full">
		<div class="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 p-8">
			<div class="text-center mb-8">
				<h1 class="text-3xl font-bold text-white mb-2">Enter OTP Code</h1>
				<p class="text-gray-400 mb-4">Check your console logs for the 6-digit code</p>
				<p class="text-sm text-gray-500">sent to {email}</p>
			</div>

			{#if error}
				<div class="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
					<p class="text-red-400 text-sm">{error}</p>
				</div>
			{/if}

			<form on:submit|preventDefault={handleVerify} class="space-y-6">
				<div>
					<label for="otp" class="block text-sm font-medium text-gray-300 mb-2">
						OTP Code
					</label>
				<input
					type="text"
					id="otp"
					bind:value={otpCode}
					on:input={handleOtpInput}
					disabled={loading}
					placeholder="000000"
					maxlength="6"
					inputmode="numeric"
					class="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
				/>
					<p class="text-xs text-gray-500 mt-2 text-center">Enter the 6-digit code</p>
				</div>

				<button
					type="submit"
					disabled={loading || otpCode.length !== 6}
					class="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
				>
					{#if loading}
						Verifying...
					{:else}
						Verify & Login
					{/if}
				</button>
			</form>

			<div class="mt-6 text-center">
				<button
					on:click={() => goto('/admin')}
					class="text-purple-400 hover:text-purple-300 text-sm transition-colors"
				>
					← Back to login
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>

