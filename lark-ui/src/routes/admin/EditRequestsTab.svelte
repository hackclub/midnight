<script lang="ts">
	import { onMount } from 'svelte';

	type EditRequest = {
		requestId: number;
		userId: number;
		projectId: number;
		requestType: string;
		currentData: any;
		requestedData: any;
		status: 'pending' | 'approved' | 'rejected';
		reason: string | null;
		reviewedBy: number | null;
		reviewedAt: string | null;
		createdAt: string;
		updatedAt: string;
		user: {
			userId: number;
			firstName: string | null;
			lastName: string | null;
			email: string;
		};
		project: {
			projectId: number;
			projectTitle: string;
			projectType: string;
		};
	};

	let { apiUrl, initialEditRequests = [] }: { apiUrl: string; initialEditRequests?: EditRequest[] } = $props();

	let editRequests = $state<EditRequest[]>(initialEditRequests);
	let loading = $state(false);
	let statusFilter = $state<'all' | 'pending' | 'approved' | 'rejected'>('pending');
	let editRequestBusy = $state<Record<number, boolean>>({});
	let editRequestErrors = $state<Record<number, string>>({});
	let editRequestSuccess = $state<Record<number, string>>({});

	let filteredRequests = $derived(
		editRequests.filter(req => {
			if (statusFilter !== 'all' && req.status !== statusFilter) {
				return false;
			}
			return true;
		})
	);

	async function loadEditRequests() {
		loading = true;
		try {
			const response = await fetch(`${apiUrl}/api/admin/edit-requests`, {
				credentials: 'include',
			});

			if (!response.ok) {
				throw new Error('Failed to load edit requests');
			}

			editRequests = await response.json();
		} catch (err) {
			console.error('Error loading edit requests:', err);
		} finally {
			loading = false;
		}
	}

	async function approveEditRequest(requestId: number) {
		editRequestBusy = { ...editRequestBusy, [requestId]: true };
		editRequestErrors = { ...editRequestErrors, [requestId]: '' };
		editRequestSuccess = { ...editRequestSuccess, [requestId]: '' };

		try {
			const response = await fetch(`${apiUrl}/api/admin/edit-requests/${requestId}/approve`, {
				method: 'PUT',
				credentials: 'include',
			});

			if (!response.ok) {
				const { message } = await response.json().catch(() => ({ message: 'Failed to approve request' }));
				editRequestErrors = { ...editRequestErrors, [requestId]: message ?? 'Failed to approve request' };
				return;
			}

			editRequestSuccess = { ...editRequestSuccess, [requestId]: 'Request approved successfully' };
			await loadEditRequests();
		} catch (err) {
			editRequestErrors = {
				...editRequestErrors,
				[requestId]: err instanceof Error ? err.message : 'Failed to approve request',
			};
		} finally {
			editRequestBusy = { ...editRequestBusy, [requestId]: false };
		}
	}

	async function rejectEditRequest(requestId: number) {
		const reason = prompt('Provide a reason for rejecting this request:');
		if (!reason) return;

		editRequestBusy = { ...editRequestBusy, [requestId]: true };
		editRequestErrors = { ...editRequestErrors, [requestId]: '' };
		editRequestSuccess = { ...editRequestSuccess, [requestId]: '' };

		try {
			const response = await fetch(`${apiUrl}/api/admin/edit-requests/${requestId}/reject`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ reason }),
			});

			if (!response.ok) {
				const { message } = await response.json().catch(() => ({ message: 'Failed to reject request' }));
				editRequestErrors = { ...editRequestErrors, [requestId]: message ?? 'Failed to reject request' };
				return;
			}

			editRequestSuccess = { ...editRequestSuccess, [requestId]: 'Request rejected successfully' };
			await loadEditRequests();
		} catch (err) {
			editRequestErrors = {
				...editRequestErrors,
				[requestId]: err instanceof Error ? err.message : 'Failed to reject request',
			};
		} finally {
			editRequestBusy = { ...editRequestBusy, [requestId]: false };
		}
	}

	function formatDate(value: string) {
		return new Date(value).toLocaleString();
	}

	function fullName(user: { firstName: string | null; lastName: string | null }) {
		const first = user.firstName ?? '';
		const last = user.lastName ?? '';
		const name = `${first} ${last}`.trim();
		return name || 'Unknown';
	}

	function renderValue(value: any): string {
		if (value === null || value === undefined) return '—';
		if (Array.isArray(value)) return value.join(', ');
		if (typeof value === 'object') return JSON.stringify(value, null, 2);
		return String(value);
	}

	function getChangedFields(currentData: any, requestedData: any): string[] {
		const fields = new Set([...Object.keys(currentData || {}), ...Object.keys(requestedData || {})]);
		return Array.from(fields).filter(key => {
			const current = currentData?.[key];
			const requested = requestedData?.[key];
			return JSON.stringify(current) !== JSON.stringify(requested);
		});
	}
</script>

<section class="space-y-4">
	<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<h2 class="text-2xl font-semibold">Edit Requests</h2>
		<button
			class="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
			onclick={loadEditRequests}
			disabled={loading}
		>
			{loading ? 'Loading...' : 'Refresh'}
		</button>
	</div>

	<div class="rounded-2xl border border-gray-700 bg-gray-900/70 backdrop-blur p-6 space-y-6">
		<div class="flex gap-2">
			<button
				class={`px-4 py-2 rounded-lg border transition-colors ${statusFilter === 'all' ? 'bg-purple-600 border-purple-400' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}
				onclick={() => (statusFilter = 'all')}
			>
				All
			</button>
			<button
				class={`px-4 py-2 rounded-lg border transition-colors ${statusFilter === 'pending' ? 'bg-purple-600 border-purple-400' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}
				onclick={() => (statusFilter = 'pending')}
			>
				Pending
			</button>
			<button
				class={`px-4 py-2 rounded-lg border transition-colors ${statusFilter === 'approved' ? 'bg-purple-600 border-purple-400' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}
				onclick={() => (statusFilter = 'approved')}
			>
				Approved
			</button>
			<button
				class={`px-4 py-2 rounded-lg border transition-colors ${statusFilter === 'rejected' ? 'bg-purple-600 border-purple-400' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}
				onclick={() => (statusFilter = 'rejected')}
			>
				Rejected
			</button>
		</div>

		{#if filteredRequests.length === 0}
			<div class="text-center py-12 text-gray-400">
				No {statusFilter !== 'all' ? statusFilter : ''} edit requests found
			</div>
		{:else}
			<div class="space-y-4">
				{#each filteredRequests as request (request.requestId)}
					{@const changedFields = getChangedFields(request.currentData, request.requestedData)}
					<div class="rounded-xl border border-gray-700 bg-gray-800/50 p-6 space-y-4">
						<div class="flex justify-between items-start">
							<div>
								<h3 class="text-xl font-semibold text-white">{request.project.projectTitle}</h3>
								<p class="text-sm text-gray-400">
									{fullName(request.user)} ({request.user.email})
								</p>
								<p class="text-xs text-gray-500 mt-1">
									Requested: {formatDate(request.createdAt)}
								</p>
							</div>
							<div class="flex flex-col items-end gap-2">
								<span
									class={`px-3 py-1 rounded-full text-xs font-semibold ${
										request.status === 'pending'
											? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
											: request.status === 'approved'
												? 'bg-green-500/20 text-green-400 border border-green-500/30'
												: 'bg-red-500/20 text-red-400 border border-red-500/30'
									}`}
								>
									{request.status.toUpperCase()}
								</span>
								<span class="text-xs text-gray-500">ID: {request.requestId}</span>
							</div>
						</div>

						{#if request.reason}
							<div class="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
								<p class="text-sm text-gray-400 font-semibold mb-1">Reason for Changes:</p>
								<p class="text-white whitespace-pre-wrap">{request.reason}</p>
							</div>
						{/if}

						<div class="space-y-3">
							<h4 class="text-sm font-semibold text-gray-400 uppercase tracking-wide">Requested Changes:</h4>
							{#each changedFields as field}
								<div class="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
									<p class="text-sm text-gray-400 font-semibold mb-2">{field}</p>
									<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<p class="text-xs text-gray-500 mb-1">Current:</p>
											<pre class="text-sm text-red-400 bg-red-900/20 p-2 rounded border border-red-500/30 overflow-x-auto">{renderValue(request.currentData?.[field])}</pre>
										</div>
										<div>
											<p class="text-xs text-gray-500 mb-1">Requested:</p>
											<pre class="text-sm text-green-400 bg-green-900/20 p-2 rounded border border-green-500/30 overflow-x-auto">{renderValue(request.requestedData?.[field])}</pre>
										</div>
									</div>
								</div>
							{/each}
						</div>

						{#if editRequestErrors[request.requestId]}
							<div class="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
								{editRequestErrors[request.requestId]}
							</div>
						{/if}

						{#if editRequestSuccess[request.requestId]}
							<div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-sm text-green-400">
								{editRequestSuccess[request.requestId]}
							</div>
						{/if}

						{#if request.status === 'pending'}
							<div class="flex gap-3">
								<button
									class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
									onclick={() => approveEditRequest(request.requestId)}
									disabled={editRequestBusy[request.requestId]}
								>
									{editRequestBusy[request.requestId] ? 'Approving...' : 'Approve'}
								</button>
								<button
									class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
									onclick={() => rejectEditRequest(request.requestId)}
									disabled={editRequestBusy[request.requestId]}
								>
									{editRequestBusy[request.requestId] ? 'Rejecting...' : 'Reject'}
								</button>
							</div>
						{:else if request.reviewedAt}
							<p class="text-sm text-gray-400">
								Reviewed: {formatDate(request.reviewedAt)}
							</p>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>