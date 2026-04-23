import type CloudCannonClient from '../index.ts';
import type { Dam, Inbox, Org, Provider, ProviderDetails, Site } from '../index.ts';
import type { operations } from '../schema.js';
import { ApiError } from './errors.ts';

export interface ConnectSiteOptions extends ProviderDetails {
	folder?: string;
}

export type Repository =
	operations['Providers_Repositories']['responses']['200']['content']['application/json'][number];

export type CreateInboxOptions =
	operations['Organization Inboxes_Create']['requestBody']['content']['application/json'];
export type CreateDamOptions =
	operations['DAMs_Create']['requestBody']['content']['application/json'];

export class OrgClient {
	#uuid: string;
	#client: CloudCannonClient;

	constructor(uuid: string, client: CloudCannonClient) {
		this.#uuid = uuid;
		this.#client = client;
	}

	async sites(): Promise<Site[]> {
		const resp = await this.#client.fetch(`/orgs/${this.#uuid}/sites`);
		if (resp.status === 401 || resp.status === 403) {
			throw new Error('Error fetching sites. Permission denied');
		}
		const sites = await resp.json();
		return sites;
	}

	async createSite(name: string, stableDomain?: string): Promise<Site> {
		const resp = await this.#client.fetch(`/orgs/${this.#uuid}/sites`, {
			method: 'POST',
			body: { site_name: name, stable_domain: stableDomain },
		});
		if (resp.status === 401) {
			throw new Error('Error creating site. Permission denied');
		}
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error creating site. Invalid request',
				errorResp.errors,
				`/orgs/${this.#uuid}/sites`,
				{ name, stableDomain },
				422
			);
		}
		const siteResp = await resp.json();
		if (!siteResp) {
			throw new Error('Invalid response');
		}
		return siteResp;
	}

	async connectSite(
		name: string,
		providerDetails: ConnectSiteOptions,
		stableDomain?: string
	): Promise<Site> {
		const body = {
			site_name: name,
			stable_domain: stableDomain,
			provider: providerDetails.provider,
			repo: providerDetails.repository,
			branch: providerDetails.branch,
			folder: providerDetails.folder,
		};
		const resp = await this.#client.fetch(`/orgs/${this.#uuid}/sites/connect`, {
			method: 'POST',
			body,
		});
		if (resp.status === 401 || resp.status === 403) {
			throw new Error('Error creating site. Permission denied');
		}
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error creating site. Invalid request',
				errorResp.errors,
				`/orgs/${this.#uuid}/sites/connect`,
				body,
				422
			);
		}
		const siteResp = await resp.json();
		return siteResp;
	}

	async get(): Promise<Org> {
		const resp = await this.#client.fetch(`/orgs/${this.#uuid}`);
		if (resp.status === 403) {
			throw new Error('Error fetching org. Permission denied');
		}
		const org = await resp.json();
		return org;
	}

	async getInboxes(): Promise<Inbox[]> {
		const resp = await this.#client.fetch(`/orgs/${this.#uuid}/inboxes`);
		if (resp.status === 403) {
			throw new Error('Error fetching inboxes. Permission denied');
		}
		const inboxes = await resp.json();
		return inboxes;
	}

	async createInbox(body: CreateInboxOptions): Promise<Inbox> {
		const resp = await this.#client.fetch(`/orgs/${this.#uuid}/inboxes`, {
			method: 'POST',
			body,
		});
		if (resp.status === 401 || resp.status === 403) {
			throw new Error('Error creating inbox. Permission denied');
		}
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error creating inbox. Invalid request',
				errorResp.errors,
				`/orgs/${this.#uuid}/inboxes`,
				body,
				422
			);
		}
		const inbox = await resp.json();
		return inbox;
	}

	async getDams(): Promise<Dam[]> {
		const resp = await this.#client.fetch(`/orgs/${this.#uuid}/dams`);
		const dams = await resp.json();
		return dams;
	}

	async createDam(body: CreateDamOptions): Promise<Dam> {
		const resp = await this.#client.fetch(`/orgs/${this.#uuid}/dams`, {
			method: 'POST',
			body,
		});
		if (resp.status === 401) {
			throw new Error('Error creating dam. Permission denied');
		}
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error creating dam. Invalid request',
				errorResp.errors,
				`/orgs/${this.#uuid}/dams`,
				body,
				422
			);
		}
		const dam = await resp.json();
		return dam;
	}

	async getRepositories(provider: Provider): Promise<Repository[]> {
		const resp = await this.#client.fetch(`/orgs/${this.#uuid}/providers/${provider}/repositories`);
		if (resp.status === 401 || resp.status === 403) {
			throw new Error('Error fetching repositories. Permission denied');
		}
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error fetching repositories. Invalid request',
				errorResp.errors,
				`/orgs/${this.#uuid}/providers/${provider}/repositories`,
				null,
				422
			);
		}
		const repos = await resp.json();
		return repos;
	}
}
