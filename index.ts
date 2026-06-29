import { createHmac, randomUUID } from 'node:crypto';
import type { components, operations, paths } from './schema.ts';
import { BackupClient } from './src/backup.ts';
import { BuildClient } from './src/build.ts';
import {
	type CloneEditingSessionFileOptions,
	type CloneEditingSessionFilesOptions,
	type CommitEditingSessionOptions,
	type CommitEditingSessionResponse,
	type CreateEditingSessionFileOptions,
	type DeleteEditingSessionFileOptions,
	type DeleteEditingSessionFilesOptions,
	EditingSessionClient,
	type MoveEditingSessionFileOptions,
	type MoveEditingSessionFilesOptions,
	type RestoreEditingSessionFileOptions,
	type RestoreEditingSessionFilesOptions,
} from './src/editing-session.ts';
import {
	type CreateContributionOptions,
	EditingSessionFileClient,
	type UnlockOptions,
} from './src/editing-session-file.ts';
import { AuthenticationError } from './src/errors.ts';
import {
	buildQuery,
	type FilterOptions,
	type PaginatedResponse,
	type PaginationOptions,
	paginatedResponse,
	type SortingOptions,
} from './src/helpers/query.ts';
import { InboxClient, type ListInboxSubmissionsOptions } from './src/inbox.ts';
import {
	type ConnectSiteOptions,
	type CreateDamOptions,
	type CreateInboxOptions,
	type ListOrgDamsOptions,
	type ListOrgInboxesOptions,
	type ListOrgSitesOptions,
	OrgClient,
} from './src/org.ts';
import {
	type BuildConfiguration,
	type ConnectDamOptions,
	type ConnectInboxOptions,
	type CopySiteOptions,
	type CreateBackupOptions,
	type ListSiteBackupsOptions,
	type ListSiteBuildsOptions,
	type ListSiteSyncsOptions,
	SiteClient,
	type UpdateSiteOptions,
	type UploadFileOptions,
} from './src/site.ts';
import { SiteInboxClient, type UpdateInboxOptions } from './src/site-inbox.ts';
import { SyncClient } from './src/sync.ts';

export {
	ApiError,
	AuthenticationError,
} from './src/errors.ts';

export type {
	BuildConfiguration,
	CloneEditingSessionFileOptions,
	CloneEditingSessionFilesOptions,
	CommitEditingSessionOptions,
	CommitEditingSessionResponse,
	ConnectDamOptions,
	ConnectInboxOptions,
	ConnectSiteOptions,
	CopySiteOptions,
	CreateBackupOptions,
	CreateContributionOptions,
	CreateDamOptions,
	CreateEditingSessionFileOptions,
	CreateInboxOptions,
	DeleteEditingSessionFileOptions,
	DeleteEditingSessionFilesOptions,
	FilterOptions,
	ListInboxSubmissionsOptions,
	ListOrgDamsOptions,
	ListOrgInboxesOptions,
	ListOrgSitesOptions,
	ListOrgsOptions,
	ListSiteBackupsOptions,
	ListSiteBuildsOptions,
	ListSiteSyncsOptions,
	MoveEditingSessionFileOptions,
	MoveEditingSessionFilesOptions,
	PaginatedResponse,
	PaginationOptions,
	RestoreEditingSessionFileOptions,
	RestoreEditingSessionFilesOptions,
	SortingOptions,
	UnlockOptions,
	UpdateInboxOptions,
	UpdateSiteOptions,
	UploadFileOptions,
};

export type Provider = operations['Providers_Repositories']['parameters']['path']['provider'];

export type Site = components['schemas']['SiteBlueprint'];
export type Backup = components['schemas']['SiteArchiveBlueprint'];
export type Org = components['schemas']['OrgBlueprintFull'];
export type Build = components['schemas']['BuildBlueprint'];
export type Sync = components['schemas']['SyncBlueprint'];
export type SiteScan = components['schemas']['SiteScannerBlueprint'];
export type SiteInbox = components['schemas']['SiteInboxBlueprint'];
export type SiteDam = components['schemas']['SiteDamBlueprint'];
export type FormSubmission = components['schemas']['FormHookBlueprint'];
export type Inbox = components['schemas']['InboxBlueprint'];
export type Dam = components['schemas']['DamBlueprint'];
export type EditingSession = components['schemas']['EditingSessionBlueprint'];
export type EditingSessionFile = components['schemas']['EditingSessionFileBlueprint'];
export type EditingSessionFileContribution =
	components['schemas']['EditingSessionFileContributionBlueprint'];
export type UploadData =
	operations['Index_UploadData']['responses']['200']['content']['application/json'];

export type ProviderDetails = {
	provider: Provider;
	repository: string;
	branch: string;
};

type ListOrgsOptions = PaginationOptions &
	SortingOptions<operations['Organizations_Index']> &
	FilterOptions<operations['Organizations_Index']>;

type ParamToString<S extends string> = S extends `${infer A}/{${string}}/${infer B}`
	? `${A}/${string}/${ParamToString<B>}`
	: S extends `${infer A}/{${string}}`
		? `${A}/${string}`
		: S;

type StripPrefix<S extends string> = S extends `/api/v0${infer Rest}` ? Rest : never;
type StripParams<S extends string> = S extends `${infer Path}?${string}` ? Path : S;

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
		SegmentMatch<Split<StripParams<U>>, Split<ParamToString<StripPrefix<K & string>>>>,
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

type BaseCloudCannonClientConfig = {
	apiOrigin?: string;
	getCustomAuthHeaders?: () => Record<string, string>;
};

export type CloudCannonClientConfig =
	| ({
			key: string;
	  } & BaseCloudCannonClientConfig)
	| ({
			userAccessKey: UserAccessKey;
	  } & BaseCloudCannonClientConfig);

export type UserAccessKey = { id: string; secret: string };

export default class CloudCannonClient {
	#apiKey?: string;
	#userAccessKey?: UserAccessKey;

	#appDomain: string;
	#getCustomAuthHeaders?: () => Record<string, string>;

	constructor(config: CloudCannonClientConfig) {
		if ('userAccessKey' in config) {
			this.#userAccessKey = config.userAccessKey;
		} else {
			this.#apiKey = config.key;
		}
		this.#appDomain = config.apiOrigin ?? 'app.cloudcannon.com';
		this.#getCustomAuthHeaders = config.getCustomAuthHeaders;
	}

	async getAuthHeaders(url: string, body?: string): Promise<Record<string, string>> {
		if (this.#getCustomAuthHeaders) {
			return this.#getCustomAuthHeaders();
		}

		if (this.#userAccessKey) {
			return this.signRequest(this.#userAccessKey, url, body);
		}

		return {
			'X-API-KEY': `${this.#apiKey}`,
		};
	}

	async signRequest(
		userAccessKey: UserAccessKey,
		url: string,
		body?: string | null
	): Promise<Record<string, string>> {
		const signedAtISO = new Date().toISOString();

		const nonce = randomUUID();
		const key = Buffer.from(userAccessKey.secret, 'base64');
		const message = JSON.stringify({ url, signed_at: signedAtISO, body: body ?? '', nonce });
		const digest = createHmac('sha256', key).update(message).digest('hex');

		return {
			'X-CC-ACCESS-KEY': userAccessKey.id,
			'X-CC-SIGNED-AT': signedAtISO,
			'X-CC-CHECKSUM': digest,
			'X-CC-NONCE': nonce,
		};
	}

	async fetch<const U extends string, const M extends Uppercase<keyof paths[keyof paths]> = 'GET'>(
		url: ValidURL<Lowercase<M>, U>,
		options?: Omit<RequestInit, keyof RequestMixin<M, MatchURL<Lowercase<M>, U>[Lowercase<M>]>> &
			RequestMixin<M, MatchURL<Lowercase<M>, U>[Lowercase<M>]>
	): Promise<APIResponse<MatchURL<Lowercase<M>, U>[Lowercase<M>]>> {
		const fullUrl = `https://${this.#appDomain}/api/v0${url}`;

		let body: string | undefined;
		if (options?.body) {
			if (typeof options?.body !== 'string') {
				body = JSON.stringify(options.body);
			} else {
				body = options.body;
			}
		}

		const authHeaders = await this.getAuthHeaders(fullUrl, body);
		const requestInit = {
			...options,
			headers: {
				...authHeaders,
				'Content-Type': 'application/json',
				'X-Requested-With': 'XMLHttpRequest',
				...options?.headers,
			},
			body,
		} as RequestInit;

		const resp = (await fetch(fullUrl, requestInit)) as APIResponse<
			MatchURL<Lowercase<M>, U>[Lowercase<M>]
		>;

		if (resp.status === 401) {
			let error: unknown;
			try {
				error = await resp.text();
				({ error } = JSON.parse(error as string));
			} catch {
				// Error intentionally ignored
			}
			throw new AuthenticationError(
				'Failed to authenticate with the CloudCannon API.',
				error,
				fullUrl,
				options,
				authHeaders
			);
		}

		return resp;
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

	editingSession(uuid: string): EditingSessionClient {
		return new EditingSessionClient(uuid, this);
	}

	editingSessionFile(uuid: string): EditingSessionFileClient {
		return new EditingSessionFileClient(uuid, this);
	}

	build(uuid: string): BuildClient {
		return new BuildClient(uuid, this);
	}

	backup(uuid: string): BackupClient {
		return new BackupClient(uuid, this);
	}

	sync(uuid: string): SyncClient {
		return new SyncClient(uuid, this);
	}

	async orgs(options: ListOrgsOptions = {}): Promise<PaginatedResponse<Org>> {
		const query = buildQuery(options);
		const resp = await this.fetch(`/orgs${query}`);
		if (resp.status === 403) {
			throw new Error('Error fetching orgs. Permission denied');
		}
		const orgs = await resp.json();
		return paginatedResponse(orgs, resp.headers);
	}

	async getUploadData(): Promise<UploadData> {
		const resp = await this.fetch('/upload-data');
		if (resp.status === 403) {
			throw new Error('Error fetching upload data. Permission denied');
		}
		if (resp.status === 422) {
			throw new Error('Error fetching upload data. Invalid request');
		}
		const uploadData = await resp.json();
		return uploadData;
	}
}
