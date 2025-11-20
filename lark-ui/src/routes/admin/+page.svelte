<script lang="ts">
	import type { PageData } from './$types';

	type AdminLightUser = {
		userId: number;
		firstName: string | null;
		lastName: string | null;
		email: string;
		birthday: string | null;
		addressLine1: string | null;
		addressLine2: string | null;
		city: string | null;
		state: string | null;
		country: string | null;
		zipCode: string | null;
		hackatimeAccount: string | null;
		createdAt: string;
		updatedAt: string;
	};

	type AdminSubmission = {
		submissionId: number;
		approvalStatus: string;
		approvedHours: number | null;
		hoursJustification: string | null; // User feedback - what user submits with their submission
		description: string | null;
		playableUrl: string | null;
		repoUrl: string | null;
		screenshotUrl: string | null;
		createdAt: string;
		updatedAt: string;
		project: {
			projectId: number;
			projectTitle: string;
			projectType: string;
			description: string | null;
			playableUrl: string | null;
			repoUrl: string | null;
			screenshotUrl: string | null;
			nowHackatimeHours: number | null;
			nowHackatimeProjects: string[] | null;
			approvedHours: number | null;
			hoursJustification: string | null; // Admin's justification - synced to Airtable
			user: AdminLightUser;
		};
	};

	type AdminProject = {
		projectId: number;
		projectTitle: string;
		description: string | null;
		projectType: string;
		nowHackatimeHours: number | null;
		nowHackatimeProjects: string[] | null;
		playableUrl: string | null;
		repoUrl: string | null;
		screenshotUrl: string | null;
		approvedHours: number | null;
		hoursJustification: string | null; // Admin's justification - synced to Airtable
		isLocked: boolean;
		createdAt: string;
		updatedAt: string;
		user: AdminLightUser;
		submissions: {
			submissionId: number;
			approvalStatus: string;
			approvedHours: number | null;
			createdAt: string;
		}[];
	};

	type AdminUser = AdminLightUser & {
		role: string;
		onboardComplete: boolean;
		projects: AdminProject[];
	};

type AdminMetrics = {
	totalHackatimeHours: number;
	totalApprovedHours: number;
	totalUsers: number;
	totalProjects: number;
	totalSubmittedHackatimeHours: number;
};

	type Tab = 'submissions' | 'projects' | 'users';
	type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';
	type SortField = 'createdAt' | 'projectTitle' | 'userName' | 'approvalStatus' | 'nowHackatimeHours' | 'approvedHours';
	type SortDirection = 'asc' | 'desc';

	const projectTypes = ['personal_website', 'platformer_game', 'website', 'game', 'terminal_cli', 'desktop_app', 'mobile_app', 'wildcard'] as const;
	const statusOptions = ['pending', 'approved', 'rejected'] as const;

	let { data }: { data: PageData } = $props();

const toSubmissionDraft = (submission: AdminSubmission) => ({
	approvalStatus: submission.approvalStatus,
	approvedHours: submission.project.approvedHours !== null
		? submission.project.approvedHours.toString()
		: (submission.project.nowHackatimeHours !== null ? submission.project.nowHackatimeHours.toFixed(1) : ''),
	// User feedback - what admin sends to user via email
	userFeedback: submission.hoursJustification ?? '',
	// Hours justification - admin's internal notes for Airtable
	hoursJustification: submission.project.hoursJustification ?? '',
	sendEmailNotification: false
});

const buildSubmissionDrafts = (list: AdminSubmission[]) => {
	const drafts: Record<number, { approvalStatus: string; approvedHours: string; userFeedback: string; hoursJustification: string; sendEmailNotification: boolean }> = {};
	for (const submission of list) {
		drafts[submission.submissionId] = toSubmissionDraft(submission);
	}
	return drafts;
};

let activeTab = $state<Tab>('submissions');
let submissions = $state<AdminSubmission[]>(data.submissions ?? []);
let projects = $state<AdminProject[]>(data.projects ?? []);
let users = $state<AdminUser[]>(data.users ?? []);
let metrics = $state<AdminMetrics>(
	data.metrics ?? {
		totalHackatimeHours: 0,
		totalApprovedHours: 0,
		totalUsers: 0,
		totalProjects: 0,
		totalSubmittedHackatimeHours: 0,
	}
);

let submissionsLoaded = $state((data.submissions?.length ?? 0) > 0);
let projectsLoaded = $state((data.projects?.length ?? 0) > 0);
let usersLoaded = $state((data.users?.length ?? 0) > 0);

let searchQuery = $state('');
let selectedStatuses = $state<Set<string>>(new Set());
let selectedProjectTypes = $state<Set<string>>(new Set());
let sortField = $state<SortField>('createdAt');
let sortDirection = $state<SortDirection>('desc');

function getDefaultDateRange() {
	const today = new Date();
	const defaultStart = new Date('2025-10-10');
	return {
		startDate: defaultStart.toISOString().split('T')[0],
		endDate: today.toISOString().split('T')[0],
	};
}

function loadDateRangeFromStorage() {
	if (typeof window === 'undefined') return getDefaultDateRange();
	const stored = localStorage.getItem('admin-submissions-date-range');
	if (stored) {
		try {
			const parsed = JSON.parse(stored);
			return {
				startDate: parsed.startDate || getDefaultDateRange().startDate,
				endDate: parsed.endDate || getDefaultDateRange().endDate,
			};
		} catch {
			return getDefaultDateRange();
		}
	}
	return getDefaultDateRange();
}

function saveDateRangeToStorage(startDate: string, endDate: string) {
	if (typeof window !== 'undefined') {
		localStorage.setItem('admin-submissions-date-range', JSON.stringify({ startDate, endDate }));
	}
}

const defaultDateRange = loadDateRangeFromStorage();
let dateRangeStart = $state(defaultDateRange.startDate);
let dateRangeEnd = $state(defaultDateRange.endDate);

$effect(() => {
	saveDateRangeToStorage(dateRangeStart, dateRangeEnd);
});

function generateBillyLink(hackatimeAccount: string | null): string | null {
	if (!hackatimeAccount || hackatimeAccount.trim() === '') return null;
	const start = dateRangeStart || getDefaultDateRange().startDate;
	const end = dateRangeEnd || getDefaultDateRange().endDate;
	return `https://billy.3kh0.net/?u=${hackatimeAccount}&d=${start}-${end}`;
}

const statusIdFor = (submissionId: number) => `submission-${submissionId}-status`;
const hoursIdFor = (submissionId: number) => `submission-${submissionId}-hours`;
const userFeedbackIdFor = (submissionId: number) => `submission-${submissionId}-user-feedback`;
const justificationIdFor = (submissionId: number) => `submission-${submissionId}-justification`;

const apiUrl = data.apiUrl;

let submissionsLoading = $state(false);
let projectsLoading = $state(false);
let usersLoading = $state(false);
let metricsLoading = $state(false);

let submissionDrafts = $state<Record<number, { approvalStatus: string; approvedHours: string; userFeedback: string; hoursJustification: string; sendEmailNotification: boolean }>>(
	buildSubmissionDrafts(data.submissions ?? [])
);
let submissionSaving = $state<Record<number, boolean>>({});
let submissionErrors = $state<Record<number, string>>({});
let submissionSuccess = $state<Record<number, string>>({});
let submissionRecalculating = $state<Record<number, boolean>>({});
let addressExpanded = $state<Record<number, boolean>>({});
let selectedSubmissionByProject = $state<Record<number, number>>({});
let submissionCountFilter = $state<string>('all');

let projectBusy = $state<Record<number, boolean>>({});
let projectErrors = $state<Record<number, string>>({});
let projectSuccess = $state<Record<number, string>>({});
let recalcAllBusy = $state(false);
let bulkProjectMessage = $state('');
let bulkProjectError = $state('');

function setSubmissionDraft(entry: AdminSubmission, force = false) {
	if (!force && submissionDrafts[entry.submissionId]) {
		return;
	}

	submissionDrafts = {
		...submissionDrafts,
		[entry.submissionId]: toSubmissionDraft(entry),
	};
}

	function formatDate(value: string) {
		return new Date(value).toLocaleString();
	}

	function formatHours(value: number | null) {
		if (value === null || value === undefined) {
			return '—';
		}
		return value.toFixed(1);
	}

	function fullName(user: AdminLightUser) {
		const first = user.firstName ?? '';
		const last = user.lastName ?? '';
		const name = `${first} ${last}`.trim();
		return name || 'Unknown';
	}

function formatTotalHoursValue(value: number) {
	return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function formatCount(value: number) {
	return value.toLocaleString();
}

	async function loadSubmissions(autoRecalculate = false) {
		submissionsLoading = true;
		try {
			const response = await fetch(`${apiUrl}/api/admin/submissions`, {
				credentials: 'include',
			});
			if (response.ok) {
			const next: AdminSubmission[] = await response.json();
			submissions = next;
			submissionDrafts = buildSubmissionDrafts(next);
				submissionErrors = {};
				submissionSuccess = {};
				submissionsLoaded = true;

				if (autoRecalculate) {
					const pendingSubmissions = next.filter(s => s.approvalStatus === 'pending');
					for (const submission of pendingSubmissions) {
						recalculateSubmissionHours(submission.submissionId, submission.project.projectId);
					}
				}
			}
		} finally {
			submissionsLoading = false;
		}
	}

	async function loadProjects() {
		projectsLoading = true;
		try {
			const response = await fetch(`${apiUrl}/api/admin/projects`, {
				credentials: 'include',
			});
			if (response.ok) {
				projects = await response.json();
				projectErrors = {};
				projectSuccess = {};
				projectsLoaded = true;
			}
		} finally {
			projectsLoading = false;
		}
	}

	async function loadUsers() {
		usersLoading = true;
		try {
			const response = await fetch(`${apiUrl}/api/admin/users`, {
				credentials: 'include',
			});
			if (response.ok) {
				users = await response.json();
				usersLoaded = true;
			}
		} finally {
			usersLoading = false;
		}
	}

async function loadMetrics() {
	metricsLoading = true;
	try {
		const response = await fetch(`${apiUrl}/api/admin/metrics`, {
			credentials: 'include',
		});

		if (response.ok) {
			const result = await response.json();
			metrics = result.totals ?? result;
		}
	} finally {
		metricsLoading = false;
	}
}

async function recalculateAllProjectsHours() {
	if (recalcAllBusy) {
		return;
	}

	recalcAllBusy = true;
	bulkProjectMessage = '';
	bulkProjectError = '';

	try {
		const response = await fetch(`${apiUrl}/api/admin/projects/recalculate-all`, {
			method: 'POST',
			credentials: 'include',
		});

		if (!response.ok) {
			const { message } = await response.json().catch(() => ({ message: 'Failed to recalculate projects' }));
			bulkProjectError = message ?? 'Failed to recalculate projects';
			return;
		}

		const body = await response.json().catch(() => ({}));
		const updatedCount = typeof body?.updated === 'number' ? body.updated : 0;
		bulkProjectMessage = `Recalculated ${updatedCount} project${updatedCount === 1 ? '' : 's'}.`;

		await loadProjects();
		await loadSubmissions();
		await loadUsers();
		await loadMetrics();
	} catch (err) {
		bulkProjectError = err instanceof Error ? err.message : 'Failed to recalculate projects';
	} finally {
		recalcAllBusy = false;
	}
}

	async function saveSubmission(submissionId: number, sendEmail?: boolean) {
		const draft = submissionDrafts[submissionId];
		if (!draft) {
			return;
		}

		submissionSaving = { ...submissionSaving, [submissionId]: true };
		submissionErrors = { ...submissionErrors, [submissionId]: '' };
		submissionSuccess = { ...submissionSuccess, [submissionId]: '' };

		// Use the sendEmail parameter if provided, otherwise use the toggle state
		const shouldSendEmail = sendEmail !== undefined ? sendEmail : draft.sendEmailNotification;

		const payload = {
			approvalStatus: draft.approvalStatus,
			approvedHours: draft.approvedHours === '' ? null : parseFloat(draft.approvedHours),
			userFeedback: draft.userFeedback === '' ? null : draft.userFeedback,
			hoursJustification: draft.hoursJustification === '' ? null : draft.hoursJustification,
			sendEmail: shouldSendEmail,
		};

		try {
			const response = await fetch(`${apiUrl}/api/admin/submissions/${submissionId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const { message } = await response.json().catch(() => ({ message: 'Failed to update submission' }));
				submissionErrors = { ...submissionErrors, [submissionId]: message ?? 'Failed to update submission' };
				return;
			}

			submissionSuccess = { ...submissionSuccess, [submissionId]: 'Submission updated' };
			await loadSubmissions();
			await loadProjects();
			await loadMetrics();
		} catch (err) {
			submissionErrors = {
				...submissionErrors,
				[submissionId]: err instanceof Error ? err.message : 'Failed to update submission',
			};
		} finally {
			submissionSaving = { ...submissionSaving, [submissionId]: false };
		}
	}

	async function quickApprove(submission: AdminSubmission) {
		submissionSaving = { ...submissionSaving, [submission.submissionId]: true };
		submissionErrors = { ...submissionErrors, [submission.submissionId]: '' };
		submissionSuccess = { ...submissionSuccess, [submission.submissionId]: '' };

		const draft = submissionDrafts[submission.submissionId];
		const userFeedback = draft?.userFeedback || '';
		const hoursJustification = draft?.hoursJustification || '';
		const approvedHours = draft?.approvedHours ? parseFloat(draft.approvedHours) : null;

		try {
			const response = await fetch(`${apiUrl}/api/admin/submissions/${submission.submissionId}/quick-approve`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ userFeedback, hoursJustification, approvedHours }),
			});

			if (!response.ok) {
				const { message } = await response.json().catch(() => ({ message: 'Failed to quick approve submission' }));
				submissionErrors = { ...submissionErrors, [submission.submissionId]: message ?? 'Failed to quick approve submission' };
				return;
			}

			submissionSuccess = { ...submissionSuccess, [submission.submissionId]: 'Submission quick approved and synced to Airtable' };
			await loadSubmissions();
			await loadProjects();
			await loadMetrics();
		} catch (err) {
			submissionErrors = {
				...submissionErrors,
				[submission.submissionId]: err instanceof Error ? err.message : 'Failed to quick approve submission',
			};
		} finally {
			submissionSaving = { ...submissionSaving, [submission.submissionId]: false };
		}
	}

	async function quickDeny(submissionId: number) {
		submissionDrafts[submissionId] = {
			...submissionDrafts[submissionId],
			approvalStatus: 'rejected',
			approvedHours: '0',
		};
		// Quick Deny always sends email if the toggle is on, or uses toggle state
		const shouldSendEmail = submissionDrafts[submissionId].sendEmailNotification;
		await saveSubmission(submissionId, shouldSendEmail);
	}

	async function recalculateSubmissionHours(submissionId: number, projectId: number) {
		submissionRecalculating = { ...submissionRecalculating, [submissionId]: true };

		try {
			const response = await fetch(`${apiUrl}/api/admin/projects/${projectId}/recalculate`, {
				method: 'POST',
				credentials: 'include',
			});

			if (response.ok) {
				await loadSubmissions();
				const updatedSubmission = submissions.find(s => s.submissionId === submissionId);
				if (updatedSubmission) {
					submissionDrafts[submissionId] = {
						...submissionDrafts[submissionId],
						approvedHours: updatedSubmission.project.nowHackatimeHours?.toFixed(1) ?? ''
					};
				}
			}
		} catch (err) {
			console.error('Failed to recalculate hours:', err);
		} finally {
			submissionRecalculating = { ...submissionRecalculating, [submissionId]: false };
		}
	}

	async function recalculateProject(projectId: number) {
		projectBusy = { ...projectBusy, [projectId]: true };
		projectErrors = { ...projectErrors, [projectId]: '' };
		projectSuccess = { ...projectSuccess, [projectId]: '' };

		try {
			const response = await fetch(`${apiUrl}/api/admin/projects/${projectId}/recalculate`, {
				method: 'POST',
				credentials: 'include',
			});

			if (!response.ok) {
				const { message } = await response.json().catch(() => ({ message: 'Failed to recalculate hours' }));
				projectErrors = { ...projectErrors, [projectId]: message ?? 'Failed to recalculate hours' };
				return;
			}

			projectSuccess = { ...projectSuccess, [projectId]: 'Hours recalculated' };
			await loadProjects();
			await loadSubmissions();
			await loadUsers();
			await loadMetrics();
		} catch (err) {
			projectErrors = {
				...projectErrors,
				[projectId]: err instanceof Error ? err.message : 'Failed to recalculate hours',
			};
		} finally {
			projectBusy = { ...projectBusy, [projectId]: false };
		}
	}

	async function deleteProject(projectId: number) {
		const confirmDelete = typeof window !== 'undefined' ? window.confirm('Delete this project? This cannot be undone.') : true;
		if (!confirmDelete) {
			return;
		}

		projectBusy = { ...projectBusy, [projectId]: true };
		projectErrors = { ...projectErrors, [projectId]: '' };
		projectSuccess = { ...projectSuccess, [projectId]: '' };

		try {
			const response = await fetch(`${apiUrl}/api/admin/projects/${projectId}`, {
				method: 'DELETE',
				credentials: 'include',
			});

			if (!response.ok) {
				const { message } = await response.json().catch(() => ({ message: 'Failed to delete project' }));
				projectErrors = { ...projectErrors, [projectId]: message ?? 'Failed to delete project' };
				return;
			}

			projectSuccess = { ...projectSuccess, [projectId]: 'Project removed' };
			await loadProjects();
			await loadSubmissions();
			await loadUsers();
			await loadMetrics();
		} catch (err) {
			projectErrors = {
				...projectErrors,
				[projectId]: err instanceof Error ? err.message : 'Failed to delete project',
			};
		} finally {
			projectBusy = { ...projectBusy, [projectId]: false };
		}
	}

	async function showSubmissionsTab() {
		activeTab = 'submissions';
		if (!submissionsLoaded && !submissionsLoading) {
			await loadSubmissions(true);
		}
	}

	async function showProjectsTab() {
		activeTab = 'projects';
		if (!projectsLoaded && !projectsLoading) {
			await loadProjects();
		}
	}

	async function showUsersTab() {
		activeTab = 'users';
		if (!usersLoaded && !usersLoading) {
			await loadUsers();
		}
	}

$effect(() => {
	if (submissions.length === 0) {
		return;
	}

	submissionsLoaded = true;

	let updated = false;
	const drafts = { ...submissionDrafts };
	const selected = { ...selectedSubmissionByProject };

	const groups = groupedSubmissions;
	for (const projectId in groups) {
		const projectIdNum = Number(projectId);
		if (!selected[projectIdNum] && groups[projectIdNum]?.length > 0) {
			selected[projectIdNum] = groups[projectIdNum][0].submissionId;
			updated = true;
		}
	}

	for (const submission of submissions) {
		if (!drafts[submission.submissionId]) {
			drafts[submission.submissionId] = toSubmissionDraft(submission);
			updated = true;
		}
	}

	if (updated) {
		submissionDrafts = drafts;
		selectedSubmissionByProject = selected;
	}
});

$effect(() => {
	if (projects.length > 0) {
		projectsLoaded = true;
	}
});

$effect(() => {
	if (users.length > 0) {
		usersLoaded = true;
	}
});

function matchesSearch(submission: AdminSubmission, query: string): boolean {
	if (!query.trim()) return true;
	const lowerQuery = query.toLowerCase();
	const fullName = `${submission.project.user.firstName ?? ''} ${submission.project.user.lastName ?? ''}`.trim().toLowerCase();
	return (
		submission.project.projectTitle.toLowerCase().includes(lowerQuery) ||
		fullName.includes(lowerQuery) ||
		submission.project.user.email.toLowerCase().includes(lowerQuery) ||
		(submission.project.description?.toLowerCase().includes(lowerQuery) ?? false) ||
		(submission.description?.toLowerCase().includes(lowerQuery) ?? false)
	);
}

function matchesStatusFilters(submission: AdminSubmission): boolean {
	if (selectedStatuses.size === 0) return true;
	return selectedStatuses.has(submission.approvalStatus);
}

function matchesProjectTypeFilters(submission: AdminSubmission): boolean {
	if (selectedProjectTypes.size === 0) return true;
	return selectedProjectTypes.has(submission.project.projectType);
}

function compareSubmissions(a: AdminSubmission, b: AdminSubmission): number {
	let comparison = 0;
	
	switch (sortField) {
		case 'createdAt':
			comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
			break;
		case 'projectTitle':
			comparison = a.project.projectTitle.localeCompare(b.project.projectTitle);
			break;
		case 'userName': {
			const nameA = `${a.project.user.firstName ?? ''} ${a.project.user.lastName ?? ''}`.trim();
			const nameB = `${b.project.user.firstName ?? ''} ${b.project.user.lastName ?? ''}`.trim();
			comparison = nameA.localeCompare(nameB);
			break;
		}
		case 'approvalStatus':
			comparison = a.approvalStatus.localeCompare(b.approvalStatus);
			break;
		case 'nowHackatimeHours':
			comparison = (a.project.nowHackatimeHours ?? 0) - (b.project.nowHackatimeHours ?? 0);
			break;
		case 'approvedHours':
			comparison = (a.project.approvedHours ?? 0) - (b.project.approvedHours ?? 0);
			break;
	}
	
	return sortDirection === 'asc' ? comparison : -comparison;
}

let groupedSubmissions = $derived.by(() => {
	const groups: Record<number, AdminSubmission[]> = {};
	
	for (const submission of submissions) {
		if (!groups[submission.project.projectId]) {
			groups[submission.project.projectId] = [];
		}
		groups[submission.project.projectId].push(submission);
	}
	
	for (const projectId in groups) {
		groups[Number(projectId)].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	}
	
	return groups;
});

let filteredGroupedSubmissions = $derived.by(() => {
	const filtered: Record<number, AdminSubmission[]> = {};
	const groups = groupedSubmissions;
	
	for (const projectId in groups) {
		const projectIdNum = Number(projectId);
		const projectSubmissions = groups[projectIdNum].filter((s: AdminSubmission) => 
			matchesSearch(s, searchQuery) &&
			matchesStatusFilters(s) &&
			matchesProjectTypeFilters(s)
		);
		
		if (projectSubmissions.length > 0) {
			const count = projectSubmissions.length;
			if (submissionCountFilter === 'all' ||
				(submissionCountFilter === 'single' && count === 1) ||
				(submissionCountFilter === 'multiple' && count > 1)) {
				filtered[projectIdNum] = projectSubmissions;
			}
		}
	}
	
	return filtered;
});

let filteredSubmissions = $derived(
	submissions
		.filter((s) => matchesSearch(s, searchQuery))
		.filter((s) => matchesStatusFilters(s))
		.filter((s) => matchesProjectTypeFilters(s))
		.sort(compareSubmissions)
);

let statusCounts = $derived({
	all: submissions.length,
	pending: submissions.filter((s) => s.approvalStatus === 'pending').length,
	approved: submissions.filter((s) => s.approvalStatus === 'approved').length,
	rejected: submissions.filter((s) => s.approvalStatus === 'rejected').length,
});

function toggleStatus(status: string) {
	const newSet = new Set(selectedStatuses);
	if (newSet.has(status)) {
		newSet.delete(status);
	} else {
		newSet.add(status);
	}
	selectedStatuses = newSet;
}

function toggleProjectType(projectType: string) {
	const newSet = new Set(selectedProjectTypes);
	if (newSet.has(projectType)) {
		newSet.delete(projectType);
	} else {
		newSet.add(projectType);
	}
	selectedProjectTypes = newSet;
}

function formatProjectType(type: string): string {
	return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function normalizeUrl(url: string | null): string | null {
	if (!url) return null;
	const trimmed = url.trim();
	if (!trimmed) return null;
	if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
		return trimmed;
	}
	return `https://${trimmed}`;
}
</script>

<svelte:head>
	<title>Admin Panel - Midnight</title>
</svelte:head>

<div class="min-h-screen bg-gray-950 text-white p-6">
	<div class="max-w-7xl mx-auto space-y-8">
		<header class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
			<div>
				<h1 class="text-4xl font-bold">Admin Panel</h1>
				<p class="text-gray-300">Signed in as {data.user.email}</p>
			</div>
			<div class="flex gap-2">
				<button
					class={`px-4 py-2 rounded-lg border transition-colors ${activeTab === 'submissions' ? 'bg-purple-600 border-purple-400' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}
					onclick={showSubmissionsTab}
				>
					Submissions
				</button>
				<button
					class={`px-4 py-2 rounded-lg border transition-colors ${activeTab === 'projects' ? 'bg-purple-600 border-purple-400' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}
					onclick={showProjectsTab}
				>
					Projects
				</button>
				<button
					class={`px-4 py-2 rounded-lg border transition-colors ${activeTab === 'users' ? 'bg-purple-600 border-purple-400' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}
					onclick={showUsersTab}
				>
					Users
				</button>
			</div>
		</header>

		<section class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
			<div class="rounded-2xl border border-gray-700 bg-gray-900/70 backdrop-blur p-6 space-y-2">
				<p class="text-sm text-gray-400 uppercase tracking-wide">Total Hackatime Hours</p>
				<p class="text-3xl font-bold text-white">{formatTotalHoursValue(metrics.totalHackatimeHours)}</p>
			</div>
			<div class="rounded-2xl border border-gray-700 bg-gray-900/70 backdrop-blur p-6 space-y-2">
				<p class="text-sm text-gray-400 uppercase tracking-wide">Total Approved Hours</p>
				<p class="text-3xl font-bold text-white">{formatTotalHoursValue(metrics.totalApprovedHours)}</p>
			</div>
			<div class="rounded-2xl border border-gray-700 bg-gray-900/70 backdrop-blur p-6 space-y-2">
				<p class="text-sm text-gray-400 uppercase tracking-wide">Submitted Projects Hours</p>
				<p class="text-3xl font-bold text-white">{formatTotalHoursValue(metrics.totalSubmittedHackatimeHours)}</p>
			</div>
			<div class="rounded-2xl border border-gray-700 bg-gray-900/70 backdrop-blur p-6 space-y-2">
				<p class="text-sm text-gray-400 uppercase tracking-wide">Projects</p>
				<p class="text-3xl font-bold text-white">{formatCount(metrics.totalProjects)}</p>
			</div>
			<div class="rounded-2xl border border-gray-700 bg-gray-900/70 backdrop-blur p-6 space-y-2">
				<p class="text-sm text-gray-400 uppercase tracking-wide">Users</p>
				<p class="text-3xl font-bold text-white">{formatCount(metrics.totalUsers)}</p>
			</div>
		</section>

		<div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
			<div class="flex gap-2">
				<button
					class="px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
					onclick={loadMetrics}
					disabled={metricsLoading}
				>
					{metricsLoading ? 'Refreshing totals...' : 'Refresh totals'}
				</button>
				<button
					class="px-4 py-2 rounded-lg border border-purple-500 bg-purple-600 hover:bg-purple-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
					onclick={recalculateAllProjectsHours}
					disabled={recalcAllBusy}
				>
					{recalcAllBusy ? 'Recalculating projects...' : 'Recalculate all projects'}
				</button>
			</div>
			<div class="text-sm">
				{#if bulkProjectError}
					<span class="text-red-400">{bulkProjectError}</span>
				{:else if bulkProjectMessage}
					<span class="text-green-400">{bulkProjectMessage}</span>
				{/if}
			</div>
		</div>

		{#if activeTab === 'submissions'}
			<section class="space-y-4">
				<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<h2 class="text-2xl font-semibold">Submission Review Platform</h2>
					<button
						class="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
						onclick={() => loadSubmissions(false)}
					>
						Refresh
					</button>
				</div>

				<div class="rounded-2xl border border-gray-700 bg-gray-900/70 backdrop-blur p-6 space-y-6">
					<div class="grid gap-4 md:grid-cols-2">
						<div>
							<div class="text-sm font-medium text-gray-300 mb-2">Date Range for Billy Links</div>
							<div class="flex flex-col gap-3 md:flex-row md:items-end md:gap-4">
								<div class="flex-1">
									<label for="date-range-start" class="block text-xs text-gray-400 mb-1">Start Date</label>
									<input
										id="date-range-start"
										type="date"
										class="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
										bind:value={dateRangeStart}
									/>
								</div>
								<div class="flex-1">
									<label for="date-range-end" class="block text-xs text-gray-400 mb-1">End Date</label>
									<input
										id="date-range-end"
										type="date"
										class="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
										bind:value={dateRangeEnd}
									/>
								</div>
								<div>
									<button
										class="px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-gray-400 text-sm hover:bg-gray-700 transition-colors whitespace-nowrap"
										onclick={() => {
											const defaultRange = getDefaultDateRange();
											dateRangeStart = defaultRange.startDate;
											dateRangeEnd = defaultRange.endDate;
										}}
									>
										Reset
									</button>
								</div>
							</div>
						</div>

						<div>
							<label for="search-submissions" class="block text-sm font-medium text-gray-300 mb-2">Search</label>
							<input
								id="search-submissions"
								type="text"
								placeholder="Search by project title, user name, email, or description..."
								class="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
								bind:value={searchQuery}
							/>
						</div>
					</div>

					<div class="grid gap-4 md:grid-cols-4">
						<div>
							<div class="block text-sm font-medium text-gray-300 mb-2">Filter by Submission Count</div>
							<div class="flex flex-wrap gap-2">
								<button
									class={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
										submissionCountFilter === 'all'
											? 'bg-purple-600 border-purple-400 text-white'
											: 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
									}`}
									onclick={() => submissionCountFilter = 'all'}
								>
									All
								</button>
								<button
									class={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
										submissionCountFilter === 'single'
											? 'bg-purple-600 border-purple-400 text-white'
											: 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
									}`}
									onclick={() => submissionCountFilter = 'single'}
								>
									Single
								</button>
								<button
									class={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
										submissionCountFilter === 'multiple'
											? 'bg-purple-600 border-purple-400 text-white'
											: 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
									}`}
									onclick={() => submissionCountFilter = 'multiple'}
								>
									Multiple
								</button>
							</div>
						</div>
						<div>
							<div class="block text-sm font-medium text-gray-300 mb-2">Filter by Status</div>
							<div class="flex flex-wrap gap-2">
								{#each statusOptions as status}
									<button
										class={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
											selectedStatuses.has(status)
												? status === 'pending'
													? 'bg-yellow-600 border-yellow-400 text-white'
													: status === 'approved'
													? 'bg-green-600 border-green-400 text-white'
													: 'bg-red-600 border-red-400 text-white'
												: 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
										}`}
										onclick={() => toggleStatus(status)}
									>
										{status.charAt(0).toUpperCase() + status.slice(1)}
										{#if selectedStatuses.has(status)}
											<span class="ml-1">✓</span>
										{/if}
									</button>
								{/each}
								{#if selectedStatuses.size > 0}
									<button
										class="px-3 py-1.5 rounded-lg border border-gray-600 bg-gray-800 text-gray-400 text-sm hover:bg-gray-700 transition-colors"
										onclick={() => selectedStatuses = new Set()}
									>
										Clear
									</button>
								{/if}
							</div>
						</div>

						<div>
							<div class="block text-sm font-medium text-gray-300 mb-2">Filter by Project Type</div>
							<div class="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
								{#each projectTypes as projectType}
									<button
										class={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
											selectedProjectTypes.has(projectType)
												? 'bg-purple-600 border-purple-400 text-white'
												: 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
										}`}
										onclick={() => toggleProjectType(projectType)}
									>
										{formatProjectType(projectType)}
										{#if selectedProjectTypes.has(projectType)}
											<span class="ml-1">✓</span>
										{/if}
									</button>
								{/each}
								{#if selectedProjectTypes.size > 0}
									<button
										class="px-3 py-1.5 rounded-lg border border-gray-600 bg-gray-800 text-gray-400 text-sm hover:bg-gray-700 transition-colors"
										onclick={() => selectedProjectTypes = new Set()}
									>
										Clear
									</button>
								{/if}
							</div>
						</div>

						<div>
							<div class="block text-sm font-medium text-gray-300 mb-2">Sort By</div>
							<div class="flex gap-2">
								<select
									class="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
									bind:value={sortField}
								>
									<option value="createdAt">Date Created</option>
									<option value="projectTitle">Project Title</option>
									<option value="userName">User Name</option>
									<option value="approvalStatus">Status</option>
									<option value="nowHackatimeHours">Hackatime Hours</option>
									<option value="approvedHours">Approved Hours</option>
								</select>
								<button
									class="px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-white transition-colors"
									onclick={() => sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'}
									title={sortDirection === 'asc' ? 'Sort ascending' : 'Sort descending'}
								>
									{sortDirection === 'asc' ? '↑' : '↓'}
								</button>
							</div>
						</div>
					</div>

					<div class="text-sm text-gray-400">
						Showing {Object.keys(filteredGroupedSubmissions).length} project{Object.keys(filteredGroupedSubmissions).length === 1 ? '' : 's'} with {Object.values(filteredGroupedSubmissions).reduce((sum, subs) => sum + subs.length, 0)} submission{Object.values(filteredGroupedSubmissions).reduce((sum, subs) => sum + subs.length, 0) === 1 ? '' : 's'} of {submissions.length} total
					</div>
				</div>

				{#if submissionsLoading}
					<div class="py-12 text-center text-gray-300">Loading submissions...</div>
				{:else if Object.keys(filteredGroupedSubmissions).length === 0}
					<div class="py-12 text-center text-gray-300">
						No submissions match your filters.
					</div>
				{:else}
					<div class="grid gap-6">
						{#each Object.entries(filteredGroupedSubmissions) as [projectIdStr, projectSubmissions]}
							{@const projectId = Number(projectIdStr)}
							{@const selectedSubmissionId = selectedSubmissionByProject[projectId] ?? projectSubmissions[0].submissionId}
							{@const selectedSubmission = projectSubmissions.find((s: AdminSubmission) => s.submissionId === selectedSubmissionId) ?? projectSubmissions[0]}
							<div class="rounded-2xl border border-gray-700 bg-gray-900/70 backdrop-blur p-6 space-y-4">
								{#if projectSubmissions.length > 1}
									<div class="mb-4 pb-4 border-b border-gray-700">
										<h4 class="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">Submissions ({projectSubmissions.length})</h4>
										<div class="flex flex-wrap gap-2">
											{#each projectSubmissions as sub}
												<button
													class={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
														selectedSubmissionId === sub.submissionId
															? 'bg-purple-600 border-purple-400 text-white'
															: 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
													}`}
													onclick={() => selectedSubmissionByProject = { ...selectedSubmissionByProject, [projectId]: sub.submissionId }}
												>
													{formatDate(sub.createdAt)}
													<span class={`ml-2 px-1.5 py-0.5 rounded text-xs ${
														sub.approvalStatus === 'approved'
															? 'bg-green-500/20 text-green-300'
															: sub.approvalStatus === 'rejected'
															? 'bg-red-500/20 text-red-300'
															: 'bg-yellow-500/20 text-yellow-300'
													}`}>
														{sub.approvalStatus}
													</span>
												</button>
											{/each}
										</div>
									</div>
								{/if}
								<div class="flex flex-col gap-4 md:flex-row md:gap-6">
									{#if selectedSubmission.screenshotUrl || selectedSubmission.project.screenshotUrl}
										<div class="w-full md:w-64 flex-shrink-0">
											<h4 class="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-2">Screenshot Preview</h4>
											<a href={selectedSubmission.screenshotUrl || selectedSubmission.project.screenshotUrl} target="_blank" rel="noreferrer">
												<img 
													src={selectedSubmission.screenshotUrl || selectedSubmission.project.screenshotUrl} 
													alt="Project screenshot" 
													class="w-full h-48 object-cover rounded-lg border border-gray-700 hover:border-purple-500 transition-colors cursor-pointer"
												/>
											</a>
										</div>
									{/if}

									<div class="flex-1 space-y-4">
										<div class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
											<div>
												<h3 class="text-2xl font-semibold">{selectedSubmission.project.projectTitle}</h3>
												<p class="text-sm text-gray-400">Submitted {formatDate(selectedSubmission.createdAt)}</p>
											</div>
											<span
												class={`px-3 py-1 rounded-full text-sm border self-start ${
													selectedSubmission.approvalStatus === 'approved'
														? 'bg-green-500/20 border-green-400 text-green-300'
														: selectedSubmission.approvalStatus === 'rejected'
														? 'bg-red-500/20 border-red-400 text-red-300'
														: 'bg-yellow-500/20 border-yellow-400 text-yellow-200'
												}`}
											>
												{selectedSubmission.approvalStatus.toUpperCase()}
											</span>
										</div>

										<div class="grid gap-4 md:grid-cols-2">
											<div class="space-y-2">
												<h4 class="text-sm font-semibold uppercase tracking-wide text-gray-400">User Info</h4>
												<p class="text-lg font-medium">{fullName(selectedSubmission.project.user)}</p>
												<p class="text-sm text-gray-300">{selectedSubmission.project.user.email}</p>
												{#if selectedSubmission.project.user.hackatimeAccount}
													<p class="text-sm text-purple-300">
														🕐 Hackatime: <span class="font-mono">{selectedSubmission.project.user.hackatimeAccount}</span>
													</p>
												{/if}
												<p class="text-sm text-gray-400">
													{selectedSubmission.project.user.city ? `${selectedSubmission.project.user.city}, ` : ''}{selectedSubmission.project.user.state}
												</p>
												<button
													class="text-xs text-left text-blue-400 hover:text-blue-300 transition-colors"
													onclick={() => addressExpanded[selectedSubmission.submissionId] = !addressExpanded[selectedSubmission.submissionId]}
												>
													{addressExpanded[selectedSubmission.submissionId] ? '▼' : '▶'} Full Address
												</button>
												{#if addressExpanded[selectedSubmission.submissionId]}
													<div class="mt-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-xs text-gray-300 space-y-1">
														{#if selectedSubmission.project.user.addressLine1}
															<p>{selectedSubmission.project.user.addressLine1}</p>
														{/if}
														{#if selectedSubmission.project.user.addressLine2}
															<p>{selectedSubmission.project.user.addressLine2}</p>
														{/if}
														<p>
															{[selectedSubmission.project.user.city, selectedSubmission.project.user.state, selectedSubmission.project.user.zipCode].filter(Boolean).join(', ')}
														</p>
														{#if selectedSubmission.project.user.country}
															<p>{selectedSubmission.project.user.country}</p>
														{/if}
														{#if selectedSubmission.project.user.birthday}
															<p class="pt-2 border-t border-gray-700">Birthday: {formatDate(selectedSubmission.project.user.birthday)}</p>
														{/if}
													</div>
												{/if}
											</div>
											<div class="space-y-2">
												<h4 class="text-sm font-semibold uppercase tracking-wide text-gray-400">Project Info</h4>
												<div class="flex items-center gap-2">
													<p class="text-sm text-gray-300">
														Hackatime hours: <span class="font-semibold text-purple-300">{formatHours(selectedSubmission.project.nowHackatimeHours)}</span>
													</p>
													<button
														class="px-2 py-1 text-xs rounded bg-purple-700 hover:bg-purple-600 border border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
														onclick={() => recalculateSubmissionHours(selectedSubmission.submissionId, selectedSubmission.project.projectId)}
														disabled={submissionRecalculating[selectedSubmission.submissionId]}
													>
														{submissionRecalculating[selectedSubmission.submissionId] ? '⟳ Calculating...' : '⟳ Recalc'}
													</button>
												</div>
												{#if selectedSubmission.project.nowHackatimeProjects?.length}
													<p class="text-sm text-gray-400">
														Projects: {selectedSubmission.project.nowHackatimeProjects.join(', ')}
													</p>
												{/if}
												{#if selectedSubmission.project.approvedHours !== null}
													<p class="text-sm text-green-300">
														Approved hours: <span class="font-semibold">{formatHours(selectedSubmission.project.approvedHours)}</span>
													</p>
												{/if}
											</div>
										</div>

										{#if selectedSubmission.description || selectedSubmission.project.description}
											<div class="space-y-2">
												<h4 class="text-sm font-semibold uppercase tracking-wide text-gray-400">Description</h4>
												<p class="text-sm text-gray-300">{selectedSubmission.description || selectedSubmission.project.description}</p>
											</div>
										{/if}

										{#if selectedSubmission.hoursJustification}
											<div class="space-y-2 bg-blue-950/30 border border-blue-800 rounded-lg p-4">
												<h4 class="text-sm font-semibold uppercase tracking-wide text-blue-300">User Feedback</h4>
												<p class="text-sm text-gray-300">{selectedSubmission.hoursJustification}</p>
											</div>
										{/if}

										{#if selectedSubmission.project.hoursJustification}
											<div class="space-y-2 bg-purple-950/30 border border-purple-800 rounded-lg p-4">
												<h4 class="text-sm font-semibold uppercase tracking-wide text-purple-300">Hours Justification (Admin Only)</h4>
												<p class="text-sm text-gray-300">{selectedSubmission.project.hoursJustification}</p>
											</div>
										{/if}

										<div class="flex flex-wrap gap-2">
											<h4 class="text-sm font-semibold uppercase tracking-wide text-gray-400 w-full">Quick Actions</h4>
											{#if selectedSubmission.playableUrl || selectedSubmission.project.playableUrl}
												{@const normalizedPlayableUrl = normalizeUrl(selectedSubmission.playableUrl || selectedSubmission.project.playableUrl)}
												{#if normalizedPlayableUrl}
													<a 
														href={normalizedPlayableUrl} 
														target="_blank" 
														rel="noreferrer"
														class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 border border-blue-400 text-white text-sm transition-colors"
													>
														🎮 View Live Demo
													</a>
												{/if}
											{/if}
											{#if selectedSubmission.repoUrl || selectedSubmission.project.repoUrl}
												<a 
													href={selectedSubmission.repoUrl || selectedSubmission.project.repoUrl} 
													target="_blank" 
													rel="noreferrer"
													class="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 border border-gray-500 text-white text-sm transition-colors"
												>
													💻 View Repository
												</a>
											{/if}
											{#if selectedSubmission.screenshotUrl || selectedSubmission.project.screenshotUrl}
												<a 
													href={selectedSubmission.screenshotUrl || selectedSubmission.project.screenshotUrl} 
													target="_blank" 
													rel="noreferrer"
													class="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 border border-purple-500 text-white text-sm transition-colors"
												>
													📸 Full Screenshot
												</a>
											{/if}
											{#if generateBillyLink(selectedSubmission.project.user.hackatimeAccount)}
												{@const billyLinkResult = generateBillyLink(selectedSubmission.project.user.hackatimeAccount)}
												<a 
													href={billyLinkResult} 
													target="_blank" 
													rel="noreferrer"
													class="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 border border-green-400 text-white text-sm transition-colors"
												>
													Billy
												</a>
											{:else}
												<span 
													class="px-4 py-2 rounded-lg bg-gray-600 border border-gray-500 text-gray-400 text-sm cursor-not-allowed"
													title="Hackatime account not available"
												>
													Billy
												</span>
											{/if}
										</div>
									</div>
								</div>

								<div class="border-t border-gray-700 pt-4 space-y-4">
									<h4 class="text-sm font-semibold uppercase tracking-wide text-gray-400">Review Controls</h4>
									
									<div class="grid gap-4 md:grid-cols-3">
										<div class="space-y-2">
											<label class="text-sm font-medium text-gray-300" for={statusIdFor(selectedSubmission.submissionId)}>Status</label>
											<select
												id={statusIdFor(selectedSubmission.submissionId)}
												class="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
												bind:value={submissionDrafts[selectedSubmission.submissionId].approvalStatus}
											>
												{#each statusOptions as option}
													<option value={option}>{option}</option>
												{/each}
											</select>
										</div>
										<div class="space-y-2">
											<label class="text-sm font-medium text-gray-300" for={hoursIdFor(selectedSubmission.submissionId)}>Approved Hours</label>
											<input
												id={hoursIdFor(selectedSubmission.submissionId)}
												type="number"
												step="0.1"
												min="0"
												class="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
												bind:value={submissionDrafts[selectedSubmission.submissionId].approvedHours}
											/>
										</div>
										<div class="space-y-2">
											<label class="text-sm font-medium text-gray-300" for={userFeedbackIdFor(selectedSubmission.submissionId)}>User Feedback (sent via email)</label>
											<textarea
												id={userFeedbackIdFor(selectedSubmission.submissionId)}
												class="w-full rounded-lg border border-blue-600 bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
												rows="2"
												placeholder="Feedback to send to the user..."
												bind:value={submissionDrafts[selectedSubmission.submissionId].userFeedback}></textarea>
										</div>
										<div class="space-y-2">
											<label class="text-sm font-medium text-gray-300" for={justificationIdFor(selectedSubmission.submissionId)}>Hours Justification (admin only, synced to Airtable)</label>
											<textarea
												id={justificationIdFor(selectedSubmission.submissionId)}
												class="w-full rounded-lg border border-purple-600 bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
												rows="2"
												placeholder="Internal justification for Airtable..."
												bind:value={submissionDrafts[selectedSubmission.submissionId].hoursJustification}></textarea>
										</div>
									</div>

									<div class="flex items-center gap-3 py-3">
										<label class="flex items-center gap-2 cursor-pointer">
											<input
												type="checkbox"
												class="w-4 h-4 rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-gray-900"
												bind:checked={submissionDrafts[selectedSubmission.submissionId].sendEmailNotification}
											/>
											<span class="text-sm font-medium text-gray-300">Send email notification on status change</span>
										</label>
									</div>

									<div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
										<div class="flex flex-wrap gap-2">
											{#if selectedSubmission.approvalStatus !== 'approved'}
												<button
													class="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 border border-green-400 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
													onclick={() => quickApprove(selectedSubmission)}
													disabled={submissionSaving[selectedSubmission.submissionId]}
												>
													✓ Quick Approve
												</button>
											{/if}
											{#if selectedSubmission.approvalStatus !== 'rejected'}
												<button
													class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 border border-red-400 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
													onclick={() => quickDeny(selectedSubmission.submissionId)}
													disabled={submissionSaving[selectedSubmission.submissionId]}
												>
													✕ Quick Deny
												</button>
											{/if}
											<button
												class="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
												onclick={() => saveSubmission(selectedSubmission.submissionId)}
												disabled={submissionSaving[selectedSubmission.submissionId]}
											>
												{submissionSaving[selectedSubmission.submissionId] ? 'Saving...' : '💾 Save Changes'}
											</button>
											<button
												class="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
												onclick={() => setSubmissionDraft(selectedSubmission, true)}
											>
												↺ Reset
											</button>
										</div>
										<div class="text-sm">
											{#if submissionErrors[selectedSubmission.submissionId]}
												<span class="text-red-400">{submissionErrors[selectedSubmission.submissionId]}</span>
											{:else if submissionSuccess[selectedSubmission.submissionId]}
												<span class="text-green-400">{submissionSuccess[selectedSubmission.submissionId]}</span>
											{/if}
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		{:else if activeTab === 'projects'}
			<section class="space-y-4">
				<div class="flex items-center justify-between">
					<h2 class="text-2xl font-semibold">Projects</h2>
					<button
						class="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
						onclick={async () => {
							await loadProjects();
							await loadUsers();
						}}
					>
						Refresh
					</button>
				</div>

				{#if projectsLoading}
					<div class="py-12 text-center text-gray-300">Loading projects...</div>
				{:else if projects.length === 0}
					<div class="py-12 text-center text-gray-300">No projects available.</div>
				{:else}
					<div class="grid gap-6">
						{#each projects as project (project.projectId)}
							<div class="rounded-2xl border border-gray-700 bg-gray-900/70 backdrop-blur p-6 space-y-4">
								<div class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
									<div>
										<h3 class="text-xl font-semibold">{project.projectTitle}</h3>
										<p class="text-sm text-gray-400">Owner: {fullName(project.user)} ({project.user.email})</p>
									</div>
									<div class="flex flex-wrap gap-2 text-sm text-gray-300">
										<span class="rounded-full border border-gray-600 px-3 py-1">Type: {project.projectType}</span>
										<span class="rounded-full border border-gray-600 px-3 py-1">Hackatime: {formatHours(project.nowHackatimeHours)}</span>
										<span class="rounded-full border border-gray-600 px-3 py-1">{project.isLocked ? 'Locked' : 'Unlocked'}</span>
									</div>
								</div>

								{#if project.description}
									<p class="text-sm text-gray-300 leading-relaxed">{project.description}</p>
								{/if}

								<div class="grid gap-4 md:grid-cols-3">
									<div class="space-y-2">
										<h4 class="text-sm font-semibold uppercase tracking-wide text-gray-400">Hackatime projects</h4>
										{#if project.nowHackatimeProjects?.length}
											<ul class="text-sm text-gray-300 list-disc list-inside space-y-1">
												{#each project.nowHackatimeProjects as name}
													<li>{name}</li>
												{/each}
											</ul>
										{:else}
											<p class="text-sm text-gray-500">No projects linked.</p>
										{/if}
									</div>
									<div class="space-y-2">
										<h4 class="text-sm font-semibold uppercase tracking-wide text-gray-400">Latest submission</h4>
										{#if project.submissions.length > 0}
											<p class="text-sm text-gray-300">
												{project.submissions[0].approvalStatus} • {formatDate(project.submissions[0].createdAt)}
											</p>
											<p class="text-sm text-gray-400">
												Approved hours: {formatHours(project.submissions[0].approvedHours)}
											</p>
										{:else}
											<p class="text-sm text-gray-500">No submissions yet.</p>
										{/if}
									</div>
									<div class="space-y-2">
										<h4 class="text-sm font-semibold uppercase tracking-wide text-gray-400">Links</h4>
										{#if project.playableUrl}
											{@const normalizedPlayableUrl = normalizeUrl(project.playableUrl)}
											{#if normalizedPlayableUrl}
												<a class="text-purple-300 hover:text-purple-200 text-sm break-words" href={normalizedPlayableUrl} target="_blank" rel="noreferrer">Playable</a>
											{/if}
										{/if}
										{#if project.repoUrl}
											<a class="text-purple-300 hover:text-purple-200 text-sm break-words" href={project.repoUrl} target="_blank" rel="noreferrer">Repository</a>
										{/if}
										{#if project.screenshotUrl}
											<a class="text-purple-300 hover:text-purple-200 text-sm break-words" href={project.screenshotUrl} target="_blank" rel="noreferrer">Screenshot</a>
										{/if}
									</div>
								</div>

								<div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
									<div class="flex gap-3">
										<button
											class="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
												onclick={() => recalculateProject(project.projectId)}
											disabled={projectBusy[project.projectId]}
										>
											{projectBusy[project.projectId] ? 'Processing...' : 'Recalculate hours'}
										</button>
										<button
											class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
												onclick={() => deleteProject(project.projectId)}
											disabled={projectBusy[project.projectId]}
										>
											Delete project
										</button>
									</div>
									<div class="text-sm">
										{#if projectErrors[project.projectId]}
											<span class="text-red-400">{projectErrors[project.projectId]}</span>
										{:else if projectSuccess[project.projectId]}
											<span class="text-green-400">{projectSuccess[project.projectId]}</span>
										{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		{:else}
			<section class="space-y-4">
				<div class="flex items-center justify-between">
					<h2 class="text-2xl font-semibold">Users</h2>
					<button
						class="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
						onclick={loadUsers}
					>
						Refresh
					</button>
				</div>

				{#if usersLoading}
					<div class="py-12 text-center text-gray-300">Loading users...</div>
				{:else if users.length === 0}
					<div class="py-12 text-center text-gray-300">No users available.</div>
				{:else}
					<div class="grid gap-6">
						{#each users as user (user.userId)}
							<div class="rounded-2xl border border-gray-700 bg-gray-900/70 backdrop-blur p-6 space-y-4">
								<div class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
									<div>
										<h3 class="text-xl font-semibold">{fullName(user)}</h3>
										<p class="text-sm text-gray-300">{user.email}</p>
									</div>
									<div class="flex flex-wrap gap-2 text-sm text-gray-300">
										<span class="rounded-full border border-gray-600 px-3 py-1 capitalize">{user.role}</span>
										<span class="rounded-full border border-gray-600 px-3 py-1">{user.onboardComplete ? 'Onboarding complete' : 'Onboarding pending'}</span>
										<span class="rounded-full border border-gray-600 px-3 py-1">
											Projects: {user.projects.length}
										</span>
									</div>
								</div>

								<div class="grid gap-4 md:grid-cols-3 text-sm text-gray-300">
									<div>
										<p>Joined {formatDate(user.createdAt)}</p>
										<p>Updated {formatDate(user.updatedAt)}</p>
									</div>
									<div>
										<p>{user.addressLine1}</p>
										<p>{user.addressLine2}</p>
										<p>{[user.city, user.state, user.zipCode].filter(Boolean).join(', ')}</p>
										<p>{user.country}</p>
									</div>
									<div>
										<p>Hackatime: {user.hackatimeAccount ?? 'Not linked'}</p>
									</div>
								</div>

								{#if user.projects.length > 0}
									<div class="space-y-3">
										<h4 class="text-sm font-semibold uppercase tracking-wide text-gray-400">Projects</h4>
										<div class="grid gap-3">
											{#each user.projects as project (project.projectId)}
												<div class="rounded-xl border border-gray-700 bg-gray-800/60 p-4 space-y-2">
													<div class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
														<div>
															<p class="font-medium">{project.projectTitle}</p>
															<p class="text-xs uppercase tracking-wide text-gray-400">{project.projectType}</p>
														</div>
														<div class="flex flex-wrap gap-2 text-xs text-gray-300">
															<span class="rounded-full border border-gray-600 px-2 py-1">Hackatime {formatHours(project.nowHackatimeHours)}</span>
															<span class="rounded-full border border-gray-600 px-2 py-1">{project.isLocked ? 'Locked' : 'Unlocked'}</span>
														</div>
													</div>
													{#if project.submissions.length > 0}
														<p class="text-xs text-gray-400">
															Latest submission: {project.submissions[0].approvalStatus} • {formatDate(project.submissions[0].createdAt)}
														</p>
													{:else}
														<p class="text-xs text-gray-500">No submissions yet.</p>
													{/if}
												</div>
											{/each}
										</div>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</section>
		{/if}
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>

