import type CloudCannonClient from '../index.ts';
import type { Build, ProviderDetails, Site, SiteDam, SiteInbox, SiteScan, Sync } from '../index.ts';
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
}
