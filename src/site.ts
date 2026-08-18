import type CloudCannonClient from '../index.ts';
import type {
	Backup,
	Build,
	EditingSession,
	ProviderDetails,
	Site,
	SiteDam,
	SiteInbox,
	SiteScan,
	Sync,
} from '../index.ts';
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

export type CompilerConfiguration = {
	install_command?: string;
	build_command?: string;
	output_path: string;
	environment_variables?: { key: string; value: string }[];
	hugoVersion?: string;
	denoVersion?: string;
	rubyVersion?: string;
	nodeVersion?: string;
	preserved_paths?: string[];
	preserveOutput?: boolean;
	includeGit?: boolean;
	manually_configure_urls?: boolean;
};

export type UpdateBuildConfigOptions = Partial<
	Omit<
		operations['SitesIndexUpdateBuild']['requestBody']['content']['application/json'],
		'build_configuration'
	>
> & {
	compile?: CompilerConfiguration;
};

export type UpdateSiteOptions =
	operations['SitesIndexUpdate']['requestBody']['content']['application/json'];
export type CopySiteOptions =
	operations['SitesIndexCopy']['requestBody']['content']['application/json'];
export type ListSiteBuildsOptions = PaginationOptions &
	SortingOptions<operations['SitesBuildsIndex']> &
	FilterOptions<operations['SitesBuildsIndex']>;
export type ListSiteBackupsOptions = PaginationOptions &
	SortingOptions<operations['SitesArchivesIndex']> &
	FilterOptions<operations['SitesArchivesIndex']>;
export type ListSiteSyncsOptions = PaginationOptions &
	SortingOptions<operations['SitesSyncsIndex']> &
	FilterOptions<operations['SitesSyncsIndex']>;

export type CreateBackupOptions =
	operations['SitesArchivesCreate']['requestBody']['content']['application/json'];

export type ConnectInboxOptions =
	operations['SitesInboxesCreate']['requestBody']['content']['application/json'];
export type ConnectDamOptions =
	operations['SitesDamsCreate']['requestBody']['content']['application/json'];
export type FileListing =
	operations['SitesFilesIndex']['responses']['200']['content']['application/json'][number];
export type UploadFileOptions = {
	type?: string;
	allow_overwrite?: boolean;
};

export class SiteClient {
	#uuid: string;
	#client: CloudCannonClient;

	constructor(uuid: string, client: CloudCannonClient) {
		this.#uuid = uuid;
		this.#client = client;
	}

	async get(): Promise<Site> {
		const url = `/sites/${this.#uuid}` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching site', url, requestInit);
		const site = await resp.json();
		return site;
	}

	async update(body: UpdateSiteOptions): Promise<Site> {
		const url = `/sites/${this.#uuid}` as const;
		const requestInit = { method: 'PUT', body } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error updating site', url, requestInit);
		const site = await resp.json();
		return site;
	}

	async delete(): Promise<void> {
		const url = `/sites/${this.#uuid}` as const;
		const requestInit = { method: 'DELETE' } as const;
		const resp = await this.#client.fetch(url, requestInit);
		await assertResponse(resp, 'Error deleting site', url, requestInit);
	}

	async copy(body: CopySiteOptions): Promise<Site> {
		const url = `/sites/${this.#uuid}/copy` as const;
		const requestInit = { method: 'POST', body } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error copying site', url, requestInit);
		const site = await resp.json();
		return site;
	}

	async updateBuildConfig(options: UpdateBuildConfigOptions): Promise<Site> {
		const buildConfiguration = {
			compile: {
				...options.compile,
				preserved_paths: options.compile?.preserved_paths?.join(','),
			},
		};

		const body = {
			...options,
			uses_i18n: !!options.uses_i18n,
			build_configuration: JSON.stringify(buildConfiguration),
		};

		const url = `/sites/${this.#uuid}/build` as const;
		const requestInit = { method: 'PUT', body } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error updating build configuration', url, requestInit);
		const site = await resp.json();
		return site;
	}

	async getBuilds(options: ListSiteBuildsOptions = {}): Promise<PaginatedResponse<Build>> {
		const query = buildQuery(options);
		const url = `/sites/${this.#uuid}/builds${query}` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching builds', url, requestInit);
		const builds = await resp.json();
		return paginatedResponse(builds, resp.headers);
	}

	async rebuild(): Promise<void> {
		const url = `/sites/${this.#uuid}/builds` as const;
		const requestInit = { method: 'POST' } as const;
		const resp = await this.#client.fetch(url, requestInit);
		await assertResponse(resp, 'Error creating build', url, requestInit);
	}

	async listBackups(options: ListSiteBackupsOptions = {}): Promise<PaginatedResponse<Backup>> {
		const query = buildQuery(options);
		const url = `/sites/${this.#uuid}/archives${query}` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching backups', url, requestInit);
		const items = await resp.json();
		return paginatedResponse(items, resp.headers);
	}

	async createBackup(body: CreateBackupOptions = {}): Promise<{ socket_message_id?: string }> {
		const url = `/sites/${this.#uuid}/archives` as const;
		const requestInit = { method: 'POST', body } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error creating backup', url, requestInit);
		const result = await resp.json();
		return result;
	}

	async listFiles(): Promise<FileListing[]> {
		const url = `/sites/${this.#uuid}/files` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching files', url, requestInit);
		const files = await resp.json();
		return files;
	}

	async getFile(path: string): Promise<Response> {
		const url = `/sites/${this.#uuid}/files/${encodeURIComponent(path)}` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching file', url, requestInit);
		return resp;
	}

	async getSyncs(options: ListSiteSyncsOptions = {}): Promise<PaginatedResponse<Sync>> {
		const query = buildQuery(options);
		const url = `/sites/${this.#uuid}/syncs${query}` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching syncs', url, requestInit);
		const syncs = await resp.json();
		return paginatedResponse(syncs, resp.headers);
	}

	async getScan(): Promise<SiteScan> {
		const url = `/sites/${this.#uuid}/scans` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching scans', url, requestInit);
		const scan = await resp.json();
		return scan;
	}

	async getScreenshotHashes(): Promise<Record<string, string>> {
		const url = `/sites/${this.#uuid}/screenshots` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching screenshots', url, requestInit);
		const screenshots = await (resp as Response).json();
		return screenshots;
	}

	async getScreenshot(device: 'desktop' | 'mobile', path: string): Promise<Response> {
		return this.#client.fetch(
			`/sites/${this.#uuid}/screenshots/${device}?path=${encodeURIComponent(path)}`
		);
	}

	async connectSourceProvider(options: ProviderDetails): Promise<Site> {
		const body = {
			storage_provider: options.provider,
			custom_data: {
				branch: options.branch,
				full_name: options.repository,
			},
		};

		const url = `/sites/${this.#uuid}/providers` as const;
		const requestInit = { method: 'POST', body } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error adding provider', url, requestInit);
		const site = await resp.json();
		return site;
	}

	async updateSourceProvider(options: Omit<ProviderDetails, 'provider'>): Promise<Site> {
		const body = {
			custom_data: {
				branch: options.branch,
				full_name: options.repository,
			},
		};

		const url = `/sites/${this.#uuid}/providers` as const;
		const requestInit = { method: 'PUT', body } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error updating provider', url, requestInit);
		const site = await resp.json();
		return site;
	}

	async disconnectSourceProvider(): Promise<Site> {
		const url = `/sites/${this.#uuid}/providers` as const;
		const requestInit = { method: 'DELETE' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error removing provider', url, requestInit);
		const site = await resp.json();
		return site;
	}

	async connectOutputProvider(options: ProviderDetails): Promise<Site> {
		const body = {
			storage_provider: options.provider,
			custom_data: {
				branch: options.branch,
				full_name: options.repository,
			},
		};

		const url = `/sites/${this.#uuid}/output-providers` as const;
		const requestInit = { method: 'POST', body } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error adding output provider', url, requestInit);
		const site = await resp.json();
		return site;
	}

	async disconnectOutputProvider(): Promise<Site> {
		const url = `/sites/${this.#uuid}/output-providers` as const;
		const requestInit = { method: 'DELETE' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error removing output provider', url, requestInit);
		const site = await resp.json();
		return site;
	}

	async getInboxConnections(): Promise<SiteInbox[]> {
		const url = `/sites/${this.#uuid}/inboxes` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching inboxes', url, requestInit);
		const inboxes = await resp.json();
		return inboxes;
	}

	async connectInbox(body: ConnectInboxOptions): Promise<SiteInbox> {
		const url = `/sites/${this.#uuid}/inboxes` as const;
		const requestInit = { method: 'POST', body } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error creating inbox', url, requestInit);
		const inbox = await resp.json();
		return inbox;
	}

	async getDamConnections(): Promise<SiteDam[]> {
		const url = `/sites/${this.#uuid}/dams` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching dams', url, requestInit);
		const dams = await resp.json();
		return dams;
	}

	async connectDam(body: ConnectDamOptions): Promise<SiteDam> {
		const url = `/sites/${this.#uuid}/dams` as const;
		const requestInit = { method: 'POST', body } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error creating dam', url, requestInit);
		const dam = await resp.json();
		return dam;
	}

	async getEditingSessions(): Promise<EditingSession[]> {
		const url = `/sites/${this.#uuid}/editing_sessions` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching editing sessions', url, requestInit);
		const editingSessions = await resp.json();
		return editingSessions;
	}

	async createEditingSession(): Promise<EditingSession> {
		const url = `/sites/${this.#uuid}/editing_sessions` as const;
		const requestInit = { method: 'POST' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error creating editing session', url, requestInit);
		const editingSession = await resp.json();
		return editingSession;
	}

	async getLatestEditingSession(): Promise<EditingSession> {
		const url = `/sites/${this.#uuid}/editing_sessions/latest` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching latest editing session', url, requestInit);
		const editingSession = await resp.json();
		return editingSession;
	}

	async uploadFile(
		path: string,
		content: BlobPart,
		options: UploadFileOptions = {}
	): Promise<void> {
		if (!path.startsWith('/')) {
			path = `/${path}`;
		}

		const files = await this.listFiles();
		const existingFile = files.find((file) => file.sitePath === path);
		if (existingFile && !options.allow_overwrite) {
			throw new Error('File already exists and allow_overwrite is not set');
		}

		const uploadData = await this.#client.getUploadData();

		const editingSession = await this.createEditingSession();

		const file = await this.#client.editingSession(editingSession.uuid).createFile({
			path,
			source_path: existingFile ? path : undefined,
			edit_type: 'update',
		});

		const contributions = await this.#client.editingSessionFile(file.uuid).getContributions();
		contributions.sort((a, b) => a.updated_at.localeCompare(b.updated_at));
		const latestContribution = contributions.at(-1);

		if (latestContribution && !options.allow_overwrite) {
			throw new Error('File already exists and allow_overwrite is not set');
		}

		const s3Key = `${uploadData.prefix}/${Date.now()}${path}`;
		const formData = new FormData();
		formData.append('key', s3Key);
		Object.keys(uploadData.fields).forEach((field) => {
			if (field !== 'key') {
				formData.append(field, uploadData.fields[field]);
			}
		});
		formData.append('file', new Blob([content], { type: options.type ?? 'text/plain' }));

		const uploadResp = await fetch(uploadData.url, {
			method: 'POST',
			body: formData,
		});

		const etag = uploadResp.headers.get('ETag');
		if (!etag) {
			throw new Error('ETag not found in upload response');
		}

		const contentHash = etag.slice(1, -1);

		await this.#client.editingSessionFile(file.uuid).createContribution({
			s3_key: s3Key,
			content_hash: contentHash,
			previous_content_hash: latestContribution?.content_hash ?? existingFile?.md5,
		});

		await this.#client.editingSessionFile(file.uuid).unlock({
			previous_content_hash: contentHash,
		});
	}

	async triggerPull(): Promise<void> {
		const url = `/sites/${this.#uuid}/providers/sync` as const;
		const requestInit = { method: 'POST' } as const;
		const resp = await this.#client.fetch(url, requestInit);
		await assertResponse(resp, 'Error triggering pull on site', url, requestInit);
	}
}
