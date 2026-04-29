import type CloudCannonClient from '../index.ts';
import type {
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
import { ApiError } from './errors.ts';

export type BuildConfiguration = Partial<
	Omit<
		operations['Sites_UpdateBuild']['requestBody']['content']['application/json'],
		'build_configuration'
	>
> & {
	compile?: {
		install_command?: string;
		build_command?: string;
		output_path: string;
		environment_variables?: [{ key: string; value: string }];
		hugoVersion?: string;
		denoVersion?: string;
		rubyVersion?: string;
		nodeVersion?: string;
		preserved_paths?: string[];
		preserveOutput?: boolean;
		includeGit?: boolean;
		manually_configure_urls?: boolean;
	};
};

export type UpdateSiteOptions =
	operations['Sites_Update']['requestBody']['content']['application/json'];
export type CopySiteOptions =
	operations['Sites_Copy']['requestBody']['content']['application/json'];

export type ConnectInboxOptions =
	operations['Site Inboxes_Create']['requestBody']['content']['application/json'];
export type ConnectDamOptions =
	operations['Dams_Create']['requestBody']['content']['application/json'];
export type FileListing =
	operations['Files_Index']['responses']['200']['content']['application/json'][number];
export type UploadFileOptions = {
	type?: string;
	overwriteExistingFile?: boolean;
};

export class SiteClient {
	#uuid: string;
	#client: CloudCannonClient;

	constructor(uuid: string, client: CloudCannonClient) {
		this.#uuid = uuid;
		this.#client = client;
	}

	async get(): Promise<Site> {
		const resp = await this.#client.fetch(`/sites/${this.#uuid}`);
		const site = await resp.json();
		return site;
	}

	async update(body: UpdateSiteOptions): Promise<Site> {
		const resp = await this.#client.fetch(`/sites/${this.#uuid}`, {
			method: 'PUT',
			body,
		});
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error updating site. Invalid request',
				errorResp.errors,
				`/sites/${this.#uuid}`,
				{ method: 'PUT', body },
				resp.status
			);
		}
		const site = await resp.json();
		return site;
	}

	async delete(): Promise<void> {
		const resp = await this.#client.fetch(`/sites/${this.#uuid}`, {
			method: 'DELETE',
		});
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error deleting site. Invalid request',
				errorResp.errors,
				`/sites/${this.#uuid}`,
				{ method: 'DELETE' },
				resp.status
			);
		}
	}

	async copy(body: CopySiteOptions): Promise<Site> {
		const resp = await this.#client.fetch(`/sites/${this.#uuid}/copy`, {
			method: 'POST',
			body,
		});
		if (resp.status === 402) {
			throw new Error('Error copying site. Feature not on plan');
		}
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error copying site. Invalid request',
				errorResp.errors,
				`/sites/${this.#uuid}/copy`,
				{ method: 'POST', body },
				resp.status
			);
		}
		const site = await resp.json();
		return site;
	}

	async updateBuildConfig(options: BuildConfiguration): Promise<Site> {
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

		const resp = await this.#client.fetch(`/sites/${this.#uuid}/build`, {
			method: 'PUT',
			body,
		});
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error updating build configuration. Invalid request',
				errorResp.errors,
				`/sites/${this.#uuid}/build`,
				{ method: 'PUT', body },
				resp.status
			);
		}
		const site = await resp.json();
		return site;
	}

	async getBuilds(): Promise<Build[]> {
		const resp = await this.#client.fetch(`/sites/${this.#uuid}/builds`);
		if (resp.status === 401 || resp.status === 403) {
			throw new Error('Error fetching builds. Permission denied');
		}
		const builds = await resp.json();
		return builds;
	}

	async rebuild(): Promise<void> {
		const resp = await this.#client.fetch(`/sites/${this.#uuid}/builds`, {
			method: 'POST',
		});
		if (resp.status === 401 || resp.status === 403) {
			throw new Error('Error creating build. Permission denied');
		}
	}

	async listFiles(): Promise<FileListing[]> {
		const resp = await this.#client.fetch(`/sites/${this.#uuid}/files`);
		if (resp.status === 401) {
			throw new Error('Error fetching files. Permission denied');
		}
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error fetching files. Invalid request',
				errorResp.errors,
				`/sites/${this.#uuid}/files`,
				{},
				resp.status
			);
		}
		const files = await resp.json();
		return files;
	}

	async getFile(path: string): Promise<Response> {
		const resp = await this.#client.fetch(`/sites/${this.#uuid}/files/${encodeURIComponent(path)}`);
		if (resp.status === 401 || resp.status === 403) {
			throw new Error('Error fetching file. Permission denied');
		}
		if (resp.status === 404) {
			throw new Error('Error fetching file. File not found');
		}
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error fetching file. Invalid request',
				errorResp.errors,
				`/sites/${this.#uuid}/files/${encodeURIComponent(path)}`,
				{},
				resp.status
			);
		}
		return resp;
	}

	async getSyncs(): Promise<Sync[]> {
		const resp = await this.#client.fetch(`/sites/${this.#uuid}/syncs`);
		if (resp.status === 401) {
			throw new Error('Error fetching syncs. Permission denied');
		}
		const syncs = await resp.json();
		return syncs;
	}

	async getScan(): Promise<SiteScan> {
		const resp = await this.#client.fetch(`/sites/${this.#uuid}/scans`);
		if (resp.status === 401 || resp.status === 403) {
			throw new Error('Error fetching scans. Permission denied');
		}
		const scan = await resp.json();
		return scan;
	}

	async getScreenshotHashes(): Promise<Record<string, string>> {
		const resp = await this.#client.fetch(`/sites/${this.#uuid}/screenshots`);
		if (resp.status === 401 || resp.status === 403) {
			throw new Error('Error fetching file. Permission denied');
		}
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

		const resp = await this.#client.fetch(`/sites/${this.#uuid}/providers`, {
			method: 'POST',
			body,
		});
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error adding provider. Invalid request',
				errorResp.errors,
				`/sites/${this.#uuid}/providers`,
				{ method: 'POST', body },
				resp.status
			);
		}
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

		const resp = await this.#client.fetch(`/sites/${this.#uuid}/providers`, {
			method: 'PUT',
			body,
		});
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error updating provider. Invalid request',
				errorResp.errors,
				`/sites/${this.#uuid}/providers`,
				{ method: 'PUT', body },
				resp.status
			);
		}
		const site = await resp.json();
		return site;
	}

	async disconnectSourceProvider(): Promise<Site> {
		const resp = await this.#client.fetch(`/sites/${this.#uuid}/providers`, {
			method: 'DELETE',
		});
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error removing provider. Invalid request',
				errorResp.errors,
				`/sites/${this.#uuid}/providers`,
				{ method: 'DELETE' },
				resp.status
			);
		}
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

		const resp = await this.#client.fetch(`/sites/${this.#uuid}/output-providers`, {
			method: 'POST',
			body,
		});
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error adding output provider. Invalid request',
				errorResp.errors,
				`/sites/${this.#uuid}/output-providers`,
				{ method: 'POST', body },
				resp.status
			);
		}
		const site = await resp.json();
		return site;
	}

	async disconnectOutputProvider(): Promise<Site> {
		const resp = await this.#client.fetch(`/sites/${this.#uuid}/output-providers`, {
			method: 'DELETE',
		});
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error removing output provider. Invalid request',
				errorResp.errors,
				`/sites/${this.#uuid}/output-providers`,
				{ method: 'DELETE' },
				resp.status
			);
		}
		const site = await resp.json();
		return site;
	}

	async getInboxConnections(): Promise<SiteInbox[]> {
		const resp = await this.#client.fetch(`/sites/${this.#uuid}/inboxes`);
		if (resp.status === 403) {
			throw new Error('Error fetching inboxes. Permission denied');
		}
		const inboxes = await resp.json();
		return inboxes;
	}

	async connectInbox(body: ConnectInboxOptions): Promise<SiteInbox> {
		const resp = await this.#client.fetch(`/sites/${this.#uuid}/inboxes`, {
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
				`/sites/${this.#uuid}/inboxes`,
				{ method: 'POST', body },
				resp.status
			);
		}
		const inbox = await resp.json();
		return inbox;
	}

	async getDamConnections(): Promise<SiteDam[]> {
		const resp = await this.#client.fetch(`/sites/${this.#uuid}/dams`);
		if (resp.status === 403) {
			throw new Error('Error fetching dams. Permission denied');
		}
		const dams = await resp.json();
		return dams;
	}

	async connectDam(body: ConnectDamOptions): Promise<SiteDam> {
		const resp = await this.#client.fetch(`/sites/${this.#uuid}/dams`, {
			method: 'POST',
			body,
		});
		if (resp.status === 401 || resp.status === 403) {
			throw new Error('Error creating dam. Permission denied');
		}
		if (resp.status === 422) {
      const errorResp = await resp.json();
			throw new ApiError(
				'Error creating dam. Invalid request',
				errorResp.errors,
				`/sites/${this.#uuid}/dams`,
				{ method: 'POST', body },
				resp.status
			);
		}
		const dam = await resp.json();
		return dam;
	}

	async getEditingSessions(): Promise<EditingSession[]> {
		const resp = await this.#client.fetch(`/sites/${this.#uuid}/editing_sessions`);
		if (resp.status === 403) {
			throw new Error('Error fetching editing sessions. Permission denied');
		}
		const editingSessions = await resp.json();
		return editingSessions;
	}

	async createEditingSession(): Promise<EditingSession> {
		const resp = await this.#client.fetch(`/sites/${this.#uuid}/editing_sessions`, {
			method: 'POST',
		});
		if (resp.status === 401 || resp.status === 403) {
			throw new Error('Error creating editing session. Permission denied');
		}
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error creating editing session. Invalid request',
				errorResp.errors,
				`/sites/${this.#uuid}/editing_sessions`,
				{ method: 'POST' },
				resp.status
			);
		}
		const editingSession = await resp.json();
		return editingSession;
	}

	async getLatestEditingSession(): Promise<EditingSession> {
		const resp = await this.#client.fetch(`/sites/${this.#uuid}/editing_sessions/latest`);
		if (resp.status === 403) {
			throw new Error('Error fetching latest editing session. Permission denied');
		}
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
		if (existingFile && !options.overwriteExistingFile) {
			throw new Error('File already exists and overwriteExistingFile is not set');
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

		if (latestContribution && !options.overwriteExistingFile) {
			throw new Error('File already exists and overwriteExistingFile is not set');
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
}
