<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	interface Stats {
		total: number;
		pending: number;
		sent: number;
		failed: number;
	}

	interface EmailJob {
		id: string;
		recipientEmail: string;
		subject: string;
		status: string;
		sentAt: string | null;
		failedAt: string | null;
		errorMessage: string | null;
		createdAt: string;
	}

	interface JobsResponse {
		jobs: EmailJob[];
		pagination: {
			total: number;
			page: number;
			limit: number;
			totalPages: number;
		};
	}

	let stats: Stats = { total: 0, pending: 0, sent: 0, failed: 0 };
	let jobs: EmailJob[] = [];
	let pagination = { total: 0, page: 1, limit: 50, totalPages: 0 };
	let loading = true;
	let error = '';
	let statusFilter = '';
	let currentPage = 1;
	let apiUrl = '';

	onMount(async () => {
		if (browser) {
			apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
			
			try {
				const response = await fetch(`${apiUrl}/admin/session`, {
					credentials: 'include'
				});
				if (!response.ok) {
					goto('/admin');
					return;
				}
			} catch (err) {
				goto('/admin');
				return;
			}
			
			loadDashboard();
		}
	});

	async function loadDashboard() {
		loading = true;
		error = '';
		try {
			await Promise.all([loadStats(), loadJobs()]);
		} catch (err) {
			error = 'Failed to load dashboard';
		} finally {
			loading = false;
		}
	}

	async function loadStats() {
		const response = await fetch(`${apiUrl}/admin/dashboard/stats`, {
			credentials: 'include'
		});

		if (response.status === 401) {
			goto('/admin');
			return;
		}

		if (response.ok) {
			const data = await response.json();
			stats = data.stats;
		}
	}

	async function loadJobs() {
		const params = new URLSearchParams({
			page: currentPage.toString(),
			limit: '50'
		});

		if (statusFilter) {
			params.append('status', statusFilter);
		}

		const response = await fetch(`${apiUrl}/admin/dashboard/email-jobs?${params}`, {
			credentials: 'include'
		});

		if (response.status === 401) {
			goto('/admin');
			return;
		}

		if (response.ok) {
			const data: JobsResponse = await response.json();
			jobs = data.jobs;
			pagination = data.pagination;
		}
	}

	async function handleFilterChange(status: string) {
		statusFilter = status;
		currentPage = 1;
		await loadJobs();
	}

	async function handlePageChange(page: number) {
		currentPage = page;
		await loadJobs();
	}

	async function handleLogout() {
		try {
			await fetch(`${apiUrl}/admin/logout`, {
				method: 'POST',
				credentials: 'include'
			});
		} catch (err) {
		}
		goto('/admin');
	}

	function formatDate(date: string | null) {
		if (!date) return 'N/A';
		return new Date(date).toLocaleString();
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'sent':
				return 'text-green-400 bg-green-500/20 border-green-500/50';
			case 'pending':
				return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
			case 'failed':
				return 'text-red-400 bg-red-500/20 border-red-500/50';
			default:
				return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
		}
	}
</script>

<svelte:head>
	<title>Admin Dashboard - Midnight</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
	<div class="max-w-7xl mx-auto">
		<div class="flex justify-between items-center mb-8">
			<div>
				<h1 class="text-4xl font-bold text-white mb-2">Email Job Dashboard</h1>
				<p class="text-gray-400">Monitor and track all email jobs</p>
			</div>
			<button
				on:click={handleLogout}
				class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
			>
				Logout
			</button>
		</div>

		{#if error}
			<div class="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
				<p class="text-red-400">{error}</p>
			</div>
		{/if}

		<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
			<div class="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6">
				<div class="text-gray-400 text-sm mb-2">Total Jobs</div>
				<div class="text-3xl font-bold text-white">{stats.total}</div>
			</div>
			<div class="bg-green-900/20 backdrop-blur-lg rounded-xl border border-green-700/50 p-6">
				<div class="text-green-400 text-sm mb-2">Sent</div>
				<div class="text-3xl font-bold text-green-300">{stats.sent}</div>
			</div>
			<div class="bg-yellow-900/20 backdrop-blur-lg rounded-xl border border-yellow-700/50 p-6">
				<div class="text-yellow-400 text-sm mb-2">Pending</div>
				<div class="text-3xl font-bold text-yellow-300">{stats.pending}</div>
			</div>
			<div class="bg-red-900/20 backdrop-blur-lg rounded-xl border border-red-700/50 p-6">
				<div class="text-red-400 text-sm mb-2">Failed</div>
				<div class="text-3xl font-bold text-red-300">{stats.failed}</div>
			</div>
		</div>

		<div class="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6">
			<div class="flex justify-between items-center mb-6">
				<h2 class="text-2xl font-bold text-white">Email Jobs</h2>
				<div class="flex gap-2">
					<button
						on:click={() => handleFilterChange('')}
						class="px-4 py-2 rounded-lg transition-colors {statusFilter === ''
							? 'bg-purple-600 text-white'
							: 'bg-gray-700 text-gray-300 hover:bg-gray-600'}"
					>
						All
					</button>
					<button
						on:click={() => handleFilterChange('sent')}
						class="px-4 py-2 rounded-lg transition-colors {statusFilter === 'sent'
							? 'bg-green-600 text-white'
							: 'bg-gray-700 text-gray-300 hover:bg-gray-600'}"
					>
						Sent
					</button>
					<button
						on:click={() => handleFilterChange('pending')}
						class="px-4 py-2 rounded-lg transition-colors {statusFilter === 'pending'
							? 'bg-yellow-600 text-white'
							: 'bg-gray-700 text-gray-300 hover:bg-gray-600'}"
					>
						Pending
					</button>
					<button
						on:click={() => handleFilterChange('failed')}
						class="px-4 py-2 rounded-lg transition-colors {statusFilter === 'failed'
							? 'bg-red-600 text-white'
							: 'bg-gray-700 text-gray-300 hover:bg-gray-600'}"
					>
						Failed
					</button>
				</div>
			</div>

			{#if loading}
				<div class="text-center py-12">
					<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
					<p class="text-gray-400 mt-4">Loading jobs...</p>
				</div>
			{:else if jobs.length === 0}
				<div class="text-center py-12">
					<p class="text-gray-400">No email jobs found</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead>
							<tr class="text-left border-b border-gray-700">
								<th class="pb-3 text-gray-400 font-medium">Recipient</th>
								<th class="pb-3 text-gray-400 font-medium">Subject</th>
								<th class="pb-3 text-gray-400 font-medium">Status</th>
								<th class="pb-3 text-gray-400 font-medium">Created</th>
								<th class="pb-3 text-gray-400 font-medium">Sent/Failed</th>
							</tr>
						</thead>
						<tbody>
							{#each jobs as job}
								<tr class="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
									<td class="py-4 text-white">{job.recipientEmail}</td>
									<td class="py-4 text-gray-300">{job.subject}</td>
									<td class="py-4">
										<span class="px-2 py-1 rounded text-xs border {getStatusColor(job.status)}">
											{job.status.toUpperCase()}
										</span>
									</td>
									<td class="py-4 text-gray-400 text-sm">{formatDate(job.createdAt)}</td>
									<td class="py-4 text-gray-400 text-sm">
										{formatDate(job.sentAt || job.failedAt)}
									</td>
								</tr>
								{#if job.errorMessage}
									<tr class="border-b border-gray-700/50">
										<td colspan="5" class="py-2 pl-8">
											<p class="text-red-400 text-xs">Error: {job.errorMessage}</p>
										</td>
									</tr>
								{/if}
							{/each}
						</tbody>
					</table>
				</div>

				<div class="flex justify-between items-center mt-6">
					<div class="text-gray-400 text-sm">
						Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(
							pagination.page * pagination.limit,
							pagination.total
						)} of {pagination.total} jobs
					</div>
					<div class="flex gap-2">
						<button
							on:click={() => handlePageChange(currentPage - 1)}
							disabled={currentPage === 1}
							class="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
						>
							Previous
						</button>
						<button
							on:click={() => handlePageChange(currentPage + 1)}
							disabled={currentPage >= pagination.totalPages}
							class="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
						>
							Next
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>

