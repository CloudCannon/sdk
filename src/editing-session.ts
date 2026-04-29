import type CloudCannonClient from '../index.ts';
import type { EditingSession, EditingSessionFile } from '../index.ts';
import type { operations } from '../schema.js';
import { ApiError } from './errors.ts';

export type CreateEditingSessionFileOptions =
	operations['Editing Session Files_Create']['requestBody']['content']['application/json'];

export type CommitEditingSessionOptions =
	operations['Editing Session_Commit']['requestBody']['content']['application/json'];

export type CommitEditingSessionResponse =
	operations['Editing Session_Commit']['responses']['200']['content']['application/json'];

export class EditingSessionClient {
	#uuid: string;
	#client: CloudCannonClient;

	constructor(uuid: string, client: CloudCannonClient) {
		this.#uuid = uuid;
		this.#client = client;
	}

	async get(): Promise<EditingSession> {
		const resp = await this.#client.fetch(`/editing_sessions/${this.#uuid}`);
		if (resp.status === 403) {
			throw new Error('Error fetching editing session. Permission denied');
		}
		const editingSession = await resp.json();
		return editingSession;
	}

	async getFiles(): Promise<EditingSessionFile[]> {
		const resp = await this.#client.fetch(`/editing_sessions/${this.#uuid}/files`);
		if (resp.status === 403) {
			throw new Error('Error fetching editing session files. Permission denied');
		}
		const files = await resp.json();
		return files;
	}

	async createFile(body: CreateEditingSessionFileOptions): Promise<EditingSessionFile> {
		const resp = await this.#client.fetch(`/editing_sessions/${this.#uuid}/files`, {
			method: 'POST',
			body,
		});
		if (resp.status === 403) {
			throw new Error('Error creating editing session file. Permission denied');
		}
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error creating editing session file. Invalid request',
				errorResp.errors,
				`/editing_sessions/${this.#uuid}/files`,
				{ method: 'POST', body },
				resp.status
			);
		}
		const file = await resp.json();
		return file;
	}

	async commit(): Promise<CommitEditingSessionResponse> {
		const resp = await this.#client.fetch(`/editing_sessions/${this.#uuid}/commit`, {
			method: 'POST',
		});
		if (resp.status === 403) {
			throw new Error('Error committing editing session. Permission denied');
		}
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error committing editing session. Invalid request',
				errorResp.errors,
				`/editing_sessions/${this.#uuid}/commit`,
				{ method: 'POST' },
				resp.status
			);
		}
		const result = await resp.json();
		console.log(this.#uuid, result);
		return result;
	}
}
