import type CloudCannonClient from '../index.ts';
import type { Dam, Inbox, Org, Provider, ProviderDetails, Site } from '../index.ts';
import type { operations } from '../schema.js';
import { assertResponse } from './errors.ts';
import {
	buildQuery,
	type FilterOptions,
	type PaginatedResponse,
	type PaginationOptions,
	paginatedResponse,
	type SortingOptions,
} from './helpers/query.ts';

export interface ConnectSiteOptions extends ProviderDetails {
	folder?: string;
}

export type Repository =
	operations['OrgsProvidersRepositories']['responses']['200']['content']['application/json'][number];

export type ListOrgSitesOptions = PaginationOptions &
	SortingOptions<operations['OrgsSitesIndex']> &
	FilterOptions<operations['OrgsSitesIndex']>;
export type ListOrgInboxesOptions = PaginationOptions &
	SortingOptions<operations['OrgsInboxesIndex']> &
	FilterOptions<operations['OrgsInboxesIndex']>;
export type ListOrgDamsOptions = PaginationOptions &
	SortingOptions<operations['OrgsDamsIndex']> &
	FilterOptions<operations['OrgsDamsIndex']>;

export type CreateInboxOptions =
	operations['OrgsInboxesCreate']['requestBody']['content']['application/json'];
export type CreateDamOptions =
	operations['OrgsDamsCreate']['requestBody']['content']['application/json'];

export class OrgClient {
	#uuid: string;
	#client: CloudCannonClient;

	constructor(uuid: string, client: CloudCannonClient) {
		this.#uuid = uuid;
		this.#client = client;
	}

	async sites(options: ListOrgSitesOptions = {}): Promise<PaginatedResponse<Site>> {
		const query = buildQuery(options);
		const url = `/orgs/${this.#uuid}/sites${query}` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching sites', url, requestInit);
		const sites = await resp.json();
		return paginatedResponse(sites, resp.headers);
	}

	async createSite(name: string, stableDomain?: string): Promise<Site> {
		const url = `/orgs/${this.#uuid}/sites` as const;
		const requestInit = {
			method: 'POST',
			body: { site_name: name, stable_domain: stableDomain },
		} as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error creating site', url, requestInit);
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
		const url = `/orgs/${this.#uuid}/sites/connect` as const;
		const requestInit = { method: 'POST', body } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error creating site', url, requestInit);
		const siteResp = await resp.json();
		return siteResp;
	}

	async get(): Promise<Org> {
		const url = `/orgs/${this.#uuid}` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching org', url, requestInit);
		const org = await resp.json();
		return org;
	}

	async getInboxes(options: ListOrgInboxesOptions = {}): Promise<PaginatedResponse<Inbox>> {
		const query = buildQuery(options);
		const url = `/orgs/${this.#uuid}/inboxes${query}` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching inboxes', url, requestInit);
		const inboxes = await resp.json();
		return paginatedResponse(inboxes, resp.headers);
	}

	async createInbox(body: CreateInboxOptions): Promise<Inbox> {
		const url = `/orgs/${this.#uuid}/inboxes` as const;
		const requestInit = { method: 'POST', body } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error creating inbox', url, requestInit);
		const inbox = await resp.json();
		return inbox;
	}

	async getDams(options: ListOrgDamsOptions = {}): Promise<PaginatedResponse<Dam>> {
		const query = buildQuery(options);
		const url = `/orgs/${this.#uuid}/dams${query}` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching dams', url, requestInit);
		const dams = await resp.json();
		return paginatedResponse(dams, resp.headers);
	}

	async createDam(body: CreateDamOptions): Promise<Dam> {
		const url = `/orgs/${this.#uuid}/dams` as const;
		const requestInit = { method: 'POST', body } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error creating dam', url, requestInit);
		const dam = await resp.json();
		return dam;
	}

	async getRepositories(provider: Provider): Promise<Repository[]> {
		const url = `/orgs/${this.#uuid}/providers/${provider}/repositories` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching repositories', url, requestInit);
		const repos = await resp.json();
		return repos;
	}
}
