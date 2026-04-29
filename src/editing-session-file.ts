import type CloudCannonClient from '../index.ts';
import type { EditingSessionFile, EditingSessionFileContribution } from '../index.ts';
import type { operations } from '../schema.js';
import { ApiError } from './errors.ts';

export type CreateContributionOptions =
	operations['Editing Session Contributions_Create']['requestBody']['content']['application/json'];

export type UnlockOptions =
	operations['Editing Session File_Unlock']['requestBody']['content']['application/json'];

export class EditingSessionFileClient {
	#uuid: string;
	#client: CloudCannonClient;

	constructor(uuid: string, client: CloudCannonClient) {
		this.#uuid = uuid;
		this.#client = client;
	}

	async get(): Promise<EditingSessionFile> {
		const resp = await this.#client.fetch(`/editing_session_files/${this.#uuid}`);
		if (resp.status === 403) {
			throw new Error('Error fetching editing session file. Permission denied');
		}
		const file = await resp.json();
		return file;
	}

	async getContributions(): Promise<EditingSessionFileContribution[]> {
		const resp = await this.#client.fetch(`/editing_session_files/${this.#uuid}/contributions`);
		if (resp.status === 403) {
			throw new Error('Error fetching editing session file contributions. Permission denied');
		}
		const contributions = await resp.json();
		return contributions;
	}

	async createContribution(
		body: CreateContributionOptions
	): Promise<EditingSessionFileContribution> {
		const resp = await this.#client.fetch(`/editing_session_files/${this.#uuid}/contributions`, {
			method: 'POST',
			body,
		});
		if (resp.status === 401 || resp.status === 403) {
			throw new Error('Error creating editing session file contribution. Permission denied');
		}
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error creating editing session file contribution. Invalid request',
				errorResp.errors,
				`/editing_session_files/${this.#uuid}/contributions`,
				{ method: 'POST', body },
				resp.status
			);
		}
		const contribution = await resp.json();
		return contribution;
	}

	async unlock(body: UnlockOptions): Promise<EditingSessionFileContribution> {
		const resp = await this.#client.fetch(`/editing_session_files/${this.#uuid}/unlock`, {
			method: 'PUT',
			body,
		});
		if (resp.status === 403) {
			throw new Error('Error unlocking editing session file. Permission denied');
		}
		if (resp.status === 404) {
			throw new Error('Error unlocking editing session file. File not found');
		}
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error unlocking editing session file. Invalid request',
				errorResp.errors,
				`/editing_session_files/${this.#uuid}/unlock`,
				{ method: 'PUT', body },
				resp.status
			);
		}
		const contribution = await resp.json();
		return contribution;
	}
}
