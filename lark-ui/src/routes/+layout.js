import posthog from 'posthog-js';
import { browser } from '$app/environment';

let posthogInitialized = false;

export const load = async () => {
	if (browser && !posthogInitialized) {
		posthog.init('phc_B5T0FJzZYK5qPDXnoss4hKtXh8ZyIsHMVlC2ATS2s0y', {
			api_host: 'https://at.leafd.dev',
			defaults: '2025-05-24',
			person_profiles: 'identified_only'
		});
		posthogInitialized = true;
	}
	return {};
};

