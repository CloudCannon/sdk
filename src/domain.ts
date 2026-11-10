import type CloudCannonClient from '../index.ts';
import type { BaseDomain, Subdomain } from '../index.ts';
import type { operations } from '../schema.ts';
import { assertResponse } from './errors.ts';
import {
	buildQuery,
	type FilterOptions,
	type PaginatedResponse,
	type PaginationOptions,
	paginatedResponse,
} from './helpers/query.ts';
import { SubdomainClient } from './subdomain.ts';

export type ListSubdomainsOptions = PaginationOptions &
	FilterOptions<operations['BaseDomainsSubdomainsIndex']>;
export type CreateSubdomainOptions =
	operations['BaseDomainsSubdomainsCreate']['requestBody']['content']['application/json'];

export class DomainClient {
	#uuid: string;
	#client: CloudCannonClient;

	constructor(uuid: string, client: CloudCannonClient) {
		this.#uuid = uuid;
		this.#client = client;
	}

	subdomain(uuid: string): SubdomainClient {
		return new SubdomainClient(this.#uuid, uuid, this.#client);
	}

	async get(): Promise<BaseDomain> {
		const url = `/base-domains/${this.#uuid}` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching base domain', url, requestInit);
		const domain = await resp.json();
		return domain;
	}

	async getSubdomains(options: ListSubdomainsOptions = {}): Promise<PaginatedResponse<Subdomain>> {
		const query = buildQuery(options);
		const url = `/base-domains/${this.#uuid}/subdomains${query}` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching subdomains', url, requestInit);
		const subdomains = await resp.json();
		return paginatedResponse(subdomains, resp.headers);
	}

	async addSubdomain(options: CreateSubdomainOptions): Promise<Subdomain> {
		const url = `/base-domains/${this.#uuid}/subdomains` as const;
		const requestInit = { method: 'POST', body: options } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error adding subdomain', url, requestInit);
		const subdomain = await resp.json();
		return subdomain;
	}
}
