import posthog from 'posthog-js';
import { browser } from '$app/environment';

let posthogInitialized = false;
const posthogKey = 'phc_B5T0FJzZYK5qPDXnoss4hKtXh8ZyIsHMVlC2ATS2s0y';
const posthogHost = 'https://at.leafd.dev';

export const load = async () => {
	if (browser) {
		if (!posthogInitialized && posthogKey) {
			posthog.init(posthogKey, {
				api_host: posthogHost,
				defaults: '2025-05-24',
				person_profiles: 'identified_only'
			});
			posthogInitialized = true;
			console.log('PostHog initialized', { host: posthogHost });
		} else if (!posthogKey) {
			console.warn('PostHog key missing');
		} else if (posthogInitialized) {
			console.log('PostHog already initialized');
		}
	}
	return {};
};

