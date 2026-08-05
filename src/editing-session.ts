import type CloudCannonClient from '../index.ts';
import type { EditingSession, EditingSessionFile } from '../index.ts';
import type { operations } from '../schema.js';
import { ApiError } from './errors.ts';

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
		const resp = await this.#client.fetch(`/editing_sessions/${this.#uuid}`);
		if (resp.status === 403) {
			throw new Error('Error fetching editing session. Permission denied');
		}
		if (resp.status === 404) {
			throw new Error('Error fetching editing session. Session not found');
		}
		const editingSession = await resp.json();
		return editingSession;
	}

	async getFiles(): Promise<EditingSessionFile[]> {
		const resp = await this.#client.fetch(`/editing_sessions/${this.#uuid}/files`);
		if (resp.status === 403) {
			throw new Error('Error fetching editing session files. Permission denied');
		}
		if (resp.status === 404) {
			throw new Error('Error fetching editing session files. Session not found');
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
		if (resp.status === 404) {
			throw new Error('Error creating editing session file. Session not found');
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

	async moveFile(options: MoveEditingSessionFileOptions): Promise<EditingSessionFilesResponse> {
		const resp = await this.#client.fetch(`/editing_sessions/${this.#uuid}/move_path`, {
			method: 'POST',
			body: options,
		});
		if (resp.status === 403) {
			throw new Error('Error moving editing session file. Permission denied');
		}
		if (resp.status === 404) {
			throw new Error('Error moving editing session file. File not found');
		}
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error moving editing session file. Invalid request',
				errorResp.errors,
				`/editing_sessions/${this.#uuid}/move_path`,
				{ method: 'POST', body: options },
				resp.status
			);
		}
		const files = await resp.json();
		return files;
	}

	async moveFiles(options: MoveEditingSessionFilesOptions): Promise<EditingSessionFilesResponse> {
		const resp = await this.#client.fetch(`/editing_sessions/${this.#uuid}/move_path`, {
			method: 'POST',
			body: options,
		});
		if (resp.status === 403) {
			throw new Error('Error moving editing session files. Permission denied');
		}
		if (resp.status === 404) {
			throw new Error('Error moving editing session files. File not found');
		}
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error moving editing session files. Invalid request',
				errorResp.errors,
				`/editing_sessions/${this.#uuid}/move_path`,
				{ method: 'POST', body: options },
				resp.status
			);
		}
		const files = await resp.json();
		return files;
	}

	async cloneFile(options: CloneEditingSessionFileOptions): Promise<EditingSessionFilesResponse> {
		const resp = await this.#client.fetch(`/editing_sessions/${this.#uuid}/clone_path`, {
			method: 'POST',
			body: options,
		});
		if (resp.status === 403) {
			throw new Error('Error cloning editing session file. Permission denied');
		}
		if (resp.status === 404) {
			throw new Error('Error cloning editing session file. File not found');
		}
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error cloning editing session file. Invalid request',
				errorResp.errors,
				`/editing_sessions/${this.#uuid}/clone_path`,
				{ method: 'POST', body: options },
				resp.status
			);
		}
		const files = await resp.json();
		return files;
	}

	async cloneFiles(options: CloneEditingSessionFilesOptions): Promise<EditingSessionFilesResponse> {
		const resp = await this.#client.fetch(`/editing_sessions/${this.#uuid}/clone_path`, {
			method: 'POST',
			body: options,
		});
		if (resp.status === 403) {
			throw new Error('Error cloning editing session files. Permission denied');
		}
		if (resp.status === 404) {
			throw new Error('Error cloning editing session files. File not found');
		}
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error cloning editing session files. Invalid request',
				errorResp.errors,
				`/editing_sessions/${this.#uuid}/clone_path`,
				{ method: 'POST', body: options },
				resp.status
			);
		}
		const files = await resp.json();
		return files;
	}

	async deleteFile(options: DeleteEditingSessionFileOptions): Promise<EditingSessionFilesResponse> {
		const resp = await this.#client.fetch(`/editing_sessions/${this.#uuid}/delete_path`, {
			method: 'POST',
			body: options,
		});
		if (resp.status === 403) {
			throw new Error('Error deleting editing session file. Permission denied');
		}
		if (resp.status === 404) {
			throw new Error('Error deleting editing session file. File not found');
		}
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error deleting editing session file. Invalid request',
				errorResp.errors,
				`/editing_sessions/${this.#uuid}/delete_path`,
				{ method: 'POST', body: options },
				resp.status
			);
		}
		const files = await resp.json();
		return files;
	}

	async deleteFiles(
		options: DeleteEditingSessionFilesOptions
	): Promise<EditingSessionFilesResponse> {
		const resp = await this.#client.fetch(`/editing_sessions/${this.#uuid}/delete_path`, {
			method: 'POST',
			body: options,
		});
		if (resp.status === 403) {
			throw new Error('Error deleting editing session files. Permission denied');
		}
		if (resp.status === 404) {
			throw new Error('Error deleting editing session files. File not found');
		}
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error deleting editing session files. Invalid request',
				errorResp.errors,
				`/editing_sessions/${this.#uuid}/delete_path`,
				{ method: 'POST', body: options },
				resp.status
			);
		}
		const files = await resp.json();
		return files;
	}

	async restoreFile(
		options: RestoreEditingSessionFileOptions
	): Promise<EditingSessionFilesResponse> {
		const resp = await this.#client.fetch(`/editing_sessions/${this.#uuid}/restore_path`, {
			method: 'POST',
			body: options,
		});
		if (resp.status === 403) {
			throw new Error('Error restoring editing session file. Permission denied');
		}
		if (resp.status === 404) {
			throw new Error('Error restoring editing session file. File not found');
		}
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error restoring editing session file. Invalid request',
				errorResp.errors,
				`/editing_sessions/${this.#uuid}/restore_path`,
				{ method: 'POST', body: options },
				resp.status
			);
		}
		const files = await resp.json();
		return files;
	}

	async restoreFiles(
		options: RestoreEditingSessionFilesOptions
	): Promise<EditingSessionFilesResponse> {
		const resp = await this.#client.fetch(`/editing_sessions/${this.#uuid}/restore_path`, {
			method: 'POST',
			body: options,
		});
		if (resp.status === 403) {
			throw new Error('Error restoring editing session files. Permission denied');
		}
		if (resp.status === 404) {
			throw new Error('Error restoring editing session files. File not found');
		}
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error restoring editing session files. Invalid request',
				errorResp.errors,
				`/editing_sessions/${this.#uuid}/restore_path`,
				{ method: 'POST', body: options },
				resp.status
			);
		}
		const files = await resp.json();
		return files;
	}

	async commit(body?: CommitEditingSessionOptions): Promise<CommitEditingSessionResponse> {
		const resp = await this.#client.fetch(`/editing_sessions/${this.#uuid}/commit`, {
			method: 'POST',
			body,
		});
		if (resp.status === 403) {
			throw new Error('Error committing editing session. Permission denied');
		}
		if (resp.status === 404) {
			throw new Error('Error committing editing session. Session not found');
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
		return result;
	}
}
