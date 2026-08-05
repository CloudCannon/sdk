import type CloudCannonClient from '../index.ts';
import type { EditingSession, EditingSessionFile } from '../index.ts';
import type { operations } from '../schema.js';
import { assertResponse } from './errors.ts';

export type CreateEditingSessionFileOptions =
	operations['EditingSessionsFilesCreate']['requestBody']['content']['application/json'];

export type CommitEditingSessionOptions =
	operations['EditingSessionsIndexCommit']['requestBody']['content']['application/json'];

export type CommitEditingSessionResponse =
	operations['EditingSessionsIndexCommit']['responses']['200']['content']['application/json'];

export type MoveEditingSessionFileOptions = Omit<
	operations['EditingSessionsIndexMovePath']['requestBody']['content']['application/json'],
	'paths'
>;

export type MoveEditingSessionFilesOptions = Omit<
	operations['EditingSessionsIndexMovePath']['requestBody']['content']['application/json'],
	'source' | 'target'
>;

export type CloneEditingSessionFileOptions = Omit<
	operations['EditingSessionsIndexClonePath']['requestBody']['content']['application/json'],
	'paths'
>;

export type CloneEditingSessionFilesOptions = Omit<
	operations['EditingSessionsIndexClonePath']['requestBody']['content']['application/json'],
	'source' | 'target'
>;

export type DeleteEditingSessionFileOptions = Omit<
	operations['EditingSessionsIndexDeletePath']['requestBody']['content']['application/json'],
	'paths'
>;

export type DeleteEditingSessionFilesOptions = Omit<
	operations['EditingSessionsIndexDeletePath']['requestBody']['content']['application/json'],
	'target'
>;

export type RestoreEditingSessionFileOptions = Omit<
	operations['EditingSessionsIndexRestorePath']['requestBody']['content']['application/json'],
	'paths'
>;

export type RestoreEditingSessionFilesOptions = Omit<
	operations['EditingSessionsIndexRestorePath']['requestBody']['content']['application/json'],
	'target'
>;

export type EditingSessionFilesResponse =
	operations['EditingSessionsIndexMovePath']['responses']['200']['content']['application/json'];

export class EditingSessionClient {
	#uuid: string;
	#client: CloudCannonClient;

	constructor(uuid: string, client: CloudCannonClient) {
		this.#uuid = uuid;
		this.#client = client;
	}

	async get(): Promise<EditingSession> {
		const url = `/editing_sessions/${this.#uuid}` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching editing session', url, requestInit);
		const editingSession = await resp.json();
		return editingSession;
	}

	async getFiles(): Promise<EditingSessionFile[]> {
		const url = `/editing_sessions/${this.#uuid}/files` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching editing session files', url, requestInit);
		const files = await resp.json();
		return files;
	}

	async createFile(body: CreateEditingSessionFileOptions): Promise<EditingSessionFile> {
		const url = `/editing_sessions/${this.#uuid}/files` as const;
		const requestInit = { method: 'POST', body } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error creating editing session file', url, requestInit);
		const file = await resp.json();
		return file;
	}

	async moveFile(options: MoveEditingSessionFileOptions): Promise<EditingSessionFilesResponse> {
		const url = `/editing_sessions/${this.#uuid}/move_path` as const;
		const requestInit = { method: 'POST', body: options } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error moving editing session file', url, requestInit);
		const files = await resp.json();
		return files;
	}

	async moveFiles(options: MoveEditingSessionFilesOptions): Promise<EditingSessionFilesResponse> {
		const url = `/editing_sessions/${this.#uuid}/move_path` as const;
		const requestInit = { method: 'POST', body: options } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error moving editing session files', url, requestInit);
		const files = await resp.json();
		return files;
	}

	async cloneFile(options: CloneEditingSessionFileOptions): Promise<EditingSessionFilesResponse> {
		const url = `/editing_sessions/${this.#uuid}/clone_path` as const;
		const requestInit = { method: 'POST', body: options } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error cloning editing session file', url, requestInit);
		const files = await resp.json();
		return files;
	}

	async cloneFiles(options: CloneEditingSessionFilesOptions): Promise<EditingSessionFilesResponse> {
		const url = `/editing_sessions/${this.#uuid}/clone_path` as const;
		const requestInit = { method: 'POST', body: options } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error cloning editing session files', url, requestInit);
		const files = await resp.json();
		return files;
	}

	async deleteFile(options: DeleteEditingSessionFileOptions): Promise<EditingSessionFilesResponse> {
		const url = `/editing_sessions/${this.#uuid}/delete_path` as const;
		const requestInit = { method: 'POST', body: options } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error deleting editing session file', url, requestInit);
		const files = await resp.json();
		return files;
	}

	async deleteFiles(
		options: DeleteEditingSessionFilesOptions
	): Promise<EditingSessionFilesResponse> {
		const url = `/editing_sessions/${this.#uuid}/delete_path` as const;
		const requestInit = { method: 'POST', body: options } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error deleting editing session files', url, requestInit);
		const files = await resp.json();
		return files;
	}

	async restoreFile(
		options: RestoreEditingSessionFileOptions
	): Promise<EditingSessionFilesResponse> {
		const url = `/editing_sessions/${this.#uuid}/restore_path` as const;
		const requestInit = { method: 'POST', body: options } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error restoring editing session file', url, requestInit);
		const files = await resp.json();
		return files;
	}

	async restoreFiles(
		options: RestoreEditingSessionFilesOptions
	): Promise<EditingSessionFilesResponse> {
		const url = `/editing_sessions/${this.#uuid}/restore_path` as const;
		const requestInit = { method: 'POST', body: options } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error restoring editing session files', url, requestInit);
		const files = await resp.json();
		return files;
	}

	async commit(body?: CommitEditingSessionOptions): Promise<CommitEditingSessionResponse> {
		const url = `/editing_sessions/${this.#uuid}/commit` as const;
		const requestInit = { method: 'POST', body } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error committing editing session', url, requestInit);
		const result = await resp.json();
		return result;
	}
}
