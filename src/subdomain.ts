import type CloudCannonClient from '../index.ts';
import type { Subdomain } from '../index.ts';
import type { operations } from '../schema.ts';
import { assertResponse } from './errors.ts';

export type UpdateSubdomainOptions =
	operations['BaseDomainsSubdomainsUpdate']['requestBody']['content']['application/json'];
export type ChangeSubdomainToRedirectOptions =
	operations['BaseDomainsSubdomainsChangeToRedirect']['requestBody']['content']['application/json'];
export type ChangeSubdomainToSiteOptions = NonNullable<
	operations['BaseDomainsSubdomainsChangeToSite']['requestBody']
>['content']['application/json'];
export type AddSubdomainSiteOptions =
	operations['BaseDomainsSubdomainSitesCreate']['requestBody']['content']['application/json'];
export type UpdateSubdomainSiteOptions =
	operations['BaseDomainsSubdomainSitesUpdate']['requestBody']['content']['application/json'];
export type SwapSubdomainSiteOptions =
	operations['BaseDomainsSubdomainSitesSwap']['requestBody']['content']['application/json'];

export class SubdomainClient {
	#baseDomainUuid: string;
	#uuid: string;
	#client: CloudCannonClient;

	constructor(baseDomainUuid: string, uuid: string, client: CloudCannonClient) {
		this.#baseDomainUuid = baseDomainUuid;
		this.#uuid = uuid;
		this.#client = client;
	}

	async get(): Promise<Subdomain> {
		const url = `/base-domains/${this.#baseDomainUuid}/subdomains/${this.#uuid}` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching subdomain', url, requestInit);
		const subdomain = await resp.json();
		return subdomain;
	}

	async update(options: UpdateSubdomainOptions): Promise<Subdomain> {
		const url = `/base-domains/${this.#baseDomainUuid}/subdomains/${this.#uuid}` as const;
		const requestInit = { method: 'PUT', body: options } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error updating subdomain', url, requestInit);
		const subdomain = await resp.json();
		return subdomain;
	}

	async setAsFallback(): Promise<Subdomain> {
		const url =
			`/base-domains/${this.#baseDomainUuid}/subdomains/${this.#uuid}/fallback` as const;
		const requestInit = { method: 'POST' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error setting subdomain as fallback', url, requestInit);
		const subdomain = await resp.json();
		return subdomain;
	}

	async changeToRedirect(options: ChangeSubdomainToRedirectOptions): Promise<Subdomain> {
		const url =
			`/base-domains/${this.#baseDomainUuid}/subdomains/${this.#uuid}/redirect` as const;
		const requestInit = { method: 'POST', body: options } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(
			resp,
			'Error changing subdomain to a redirect',
			url,
			requestInit
		);
		const subdomain = await resp.json();
		return subdomain;
	}

	async changeToSite(options?: ChangeSubdomainToSiteOptions): Promise<Subdomain> {
		const url = `/base-domains/${this.#baseDomainUuid}/subdomains/${this.#uuid}/site` as const;
		const requestInit = options
			? ({ method: 'POST', body: options } as const)
			: ({ method: 'POST' } as const);
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error changing subdomain to a site', url, requestInit);
		const subdomain = await resp.json();
		return subdomain;
	}

	async addSite(options: AddSubdomainSiteOptions): Promise<Subdomain> {
		const url = `/base-domains/${this.#baseDomainUuid}/subdomains/${this.#uuid}/sites` as const;
		const requestInit = { method: 'POST', body: options } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error adding site to subdomain', url, requestInit);
		const subdomain = await resp.json();
		return subdomain;
	}

	async updateSite(
		siteUuid: string,
		options: UpdateSubdomainSiteOptions
	): Promise<Subdomain> {
		const url =
			`/base-domains/${this.#baseDomainUuid}/subdomains/${this.#uuid}/sites/${siteUuid}` as const;
		const requestInit = { method: 'PUT', body: options } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error updating site on subdomain', url, requestInit);
		const subdomain = await resp.json();
		return subdomain;
	}

	async swapSite(siteUuid: string, options: SwapSubdomainSiteOptions): Promise<Subdomain> {
		const url =
			`/base-domains/${this.#baseDomainUuid}/subdomains/${this.#uuid}/sites/${siteUuid}/swap` as const;
		const requestInit = { method: 'PUT', body: options } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error swapping site on subdomain', url, requestInit);
		const subdomain = await resp.json();
		return subdomain;
	}

	async retrySsl(): Promise<Subdomain> {
		const url =
			`/base-domains/${this.#baseDomainUuid}/subdomains/${this.#uuid}/ssl/retry` as const;
		const requestInit = { method: 'POST' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error retrying subdomain SSL', url, requestInit);
		const subdomain = await resp.json();
		return subdomain;
	}
}
