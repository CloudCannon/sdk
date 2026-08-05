import type CloudCannonClient from '../index.ts';
import type { EditingSessionFile, EditingSessionFileContribution } from '../index.ts';
import type { operations } from '../schema.js';
import { assertResponse } from './errors.ts';

export type CreateContributionOptions =
	operations['EditingSessionFilesContributionsCreate']['requestBody']['content']['application/json'];

export type UnlockOptions =
	operations['EditingSessionFilesIndexUnlock']['requestBody']['content']['application/json'];

export class EditingSessionFileClient {
	#uuid: string;
	#client: CloudCannonClient;

	constructor(uuid: string, client: CloudCannonClient) {
		this.#uuid = uuid;
		this.#client = client;
	}

	async get(): Promise<EditingSessionFile> {
		const url = `/editing_session_files/${this.#uuid}` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching editing session file', url, requestInit);
		const file = await resp.json();
		return file;
	}

	async getContributions(): Promise<EditingSessionFileContribution[]> {
		const url = `/editing_session_files/${this.#uuid}/contributions` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(
			resp,
			'Error fetching editing session file contributions',
			url,
			requestInit
		);
		const contributions = await resp.json();
		return contributions;
	}

	async createContribution(
		body: CreateContributionOptions
	): Promise<EditingSessionFileContribution> {
		const url = `/editing_session_files/${this.#uuid}/contributions` as const;
		const requestInit = { method: 'POST', body } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(
			resp,
			'Error creating editing session file contribution',
			url,
			requestInit
		);
		const contribution = await resp.json();
		return contribution;
	}

	async discard(): Promise<Record<string, never>> {
		const url = `/editing_session_files/${this.#uuid}` as const;
		const requestInit = { method: 'DELETE' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error discarding editing session file', url, requestInit);
		const contribution = await resp.json();
		return contribution;
	}

	async unlock(body: UnlockOptions): Promise<EditingSessionFileContribution> {
		const url = `/editing_session_files/${this.#uuid}/unlock` as const;
		const requestInit = { method: 'PUT', body } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error unlocking editing session file', url, requestInit);
		const contribution = await resp.json();
		return contribution;
	}
}
