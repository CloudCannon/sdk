import type { components, operations, paths } from './schema.ts';
import { InboxClient } from './src/inbox.ts';
import { OrgClient } from './src/org.ts';
import { type BuildConfiguration, SiteClient } from './src/site.ts';
import { SiteInboxClient } from './src/site-inbox.ts';

export type { BuildConfiguration };

export type Provider = operations['Providers_Repositories']['parameters']['path']['provider'];

export type Site = components['schemas']['SiteBlueprint'];
export type Org = components['schemas']['OrgBlueprintFull'];
export type Build = components['schemas']['BuildBlueprint'];
export type Sync = components['schemas']['SyncBlueprint'];
export type SiteScan = components['schemas']['SiteScannerBlueprint'];
export type SiteInbox = components['schemas']['SiteInboxBlueprint'];
export type SiteDam = components['schemas']['SiteDamBlueprint'];
export type FormSubmission = components['schemas']['FormHookBlueprint'];
export type Inbox = components['schemas']['InboxBlueprint'];
export type Dam = components['schemas']['DamBlueprint'];

export type ProviderDetails = {
	provider: Provider;
	repository: string;
	branch: string;
};

type ParamToString<S extends string> = S extends `${infer A}/{${string}}/${infer B}`
	? `${A}/${string}/${ParamToString<B>}`
	: S extends `${infer A}/{${string}}`
		? `${A}/${string}`
		: S;

type StripPrefix<S extends string> = S extends `/api/v0${infer Rest}` ? Rest : never;

type RequestBody<T> = T extends { requestBody: { content: { 'application/json': infer B } } }
	? B
	: never;

type RequestParams<T> = T extends { parameters: infer P } ? P : never;

type ResponseMixin<S, R> = {
	status: S;
	json: R extends { content: { 'application/json': infer J } } ? () => Promise<J> : never;
};

type RequestMixin<M, Op> = {
	method?: M;
	body?: RequestBody<Op>;
};

type APIResponse<Op> = Op extends { responses: infer R }
	? {
			[status in keyof R]: Omit<Response, keyof ResponseMixin<status, R[status]>> &
				ResponseMixin<status, R[status]>;
		}[keyof R]
	: never;

type Split<S extends string> = S extends `${infer Head}/${infer Tail}`
	? [Head, ...Split<Tail>]
	: [S];

type SegmentMatch<A extends string[], B extends string[]> = A['length'] extends B['length']
	? A extends [infer AH extends string, ...infer AT extends string[]]
		? B extends [infer BH extends string, ...infer BT extends string[]]
			? AH extends BH
				? SegmentMatch<AT, BT>
				: never
			: never
		: true
	: never;

type MatchURL<M extends keyof paths[keyof paths], U extends string> = {
	[K in keyof paths]: [
		SegmentMatch<Split<U>, Split<ParamToString<StripPrefix<K & string>>>>,
	] extends [never]
		? never
		: RequestParams<paths[K][M]> extends never
			? never
			: paths[K];
}[keyof paths];

type ValidURL<M extends keyof paths[keyof paths], U extends string> =
	MatchURL<M, U> extends never
		? {
				[K in keyof paths]: RequestParams<paths[K][M]> extends never ? never : StripPrefix<K>;
			}[keyof paths]
		: U;

export type CloudCannonClientConfig = {
	key: string;

	apiOrigin?: string;
	getCustomAuthHeaders?: () => Record<string, string>;
};

export default class CloudCannonClient {
	#apiKey: string;
	#appDomain: string;
	#getCustomAuthHeaders?: () => Record<string, string>;

	constructor(config: CloudCannonClientConfig) {
		this.#apiKey = config.key;
		this.#appDomain = config.apiOrigin ?? 'app.cloudcannon.com';
		this.#getCustomAuthHeaders = config.getCustomAuthHeaders;
	}

	getAuthHeaders(): Record<string, string> {
		if (this.#getCustomAuthHeaders) {
			return {
				...this.#getCustomAuthHeaders(),
			};
		}
		return {
			'X-API-KEY': `${this.#apiKey}`,
		};
	}

	async fetch<const U extends string, const M extends Uppercase<keyof paths[keyof paths]> = 'GET'>(
		url: ValidURL<Lowercase<M>, U>,
		options?: Omit<RequestInit, keyof RequestMixin<M, MatchURL<Lowercase<M>, U>[Lowercase<M>]>> &
			RequestMixin<M, MatchURL<Lowercase<M>, U>[Lowercase<M>]>
	): Promise<APIResponse<MatchURL<Lowercase<M>, U>[Lowercase<M>]>> {
		const requestInit = {
			...options,
			headers: {
				...this.getAuthHeaders(),
				'Content-Type': 'application/json',
				...options?.headers,
			},
		} as RequestInit;
		if (options?.body) {
			if (typeof options?.body !== 'string') {
				requestInit.body = JSON.stringify(options.body);
			} else {
				requestInit.body = options.body;
			}
		}
		return fetch(`https://${this.#appDomain}/api/v0${url}`, requestInit) as Promise<
			APIResponse<MatchURL<Lowercase<M>, U>[Lowercase<M>]>
		>;
	}

	org(uuid: string): OrgClient {
		return new OrgClient(uuid, this);
	}

	site(uuid: string): SiteClient {
		return new SiteClient(uuid, this);
	}

	inbox(uuid: string): InboxClient {
		return new InboxClient(uuid, this);
	}

	siteInbox(uuid: string): SiteInboxClient {
		return new SiteInboxClient(uuid, this);
	}

	async orgs(): Promise<Org[]> {
		const resp = await this.fetch('/orgs');
		const orgs = await resp.json();
		return orgs;
	}
}
