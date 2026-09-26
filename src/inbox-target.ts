import type CloudCannonClient from '../index.ts';
import type { InboxTarget } from '../index.ts';
import type { operations } from '../schema.js';
import { assertResponse } from './errors.ts';

export type UpdateInboxTargetOptions =
	operations['InboxTargetsUpdate']['requestBody']['content']['application/json'];

export class InboxTargetClient {
	#uuid: string;
	#client: CloudCannonClient;

	constructor(uuid: string, client: CloudCannonClient) {
		this.#uuid = uuid;
		this.#client = client;
	}

	async get(): Promise<InboxTarget> {
		const url = `/inbox-targets/${this.#uuid}` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching inbox target', url, requestInit);
		const inboxTarget = await resp.json();
		return inboxTarget;
	}

	async update(body: UpdateInboxTargetOptions): Promise<InboxTarget> {
		const url = `/inbox-targets/${this.#uuid}` as const;
		const requestInit = { method: 'PUT', body } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error updating inbox target', url, requestInit);
		const inboxTarget = await resp.json();
		return inboxTarget;
	}

	async delete(): Promise<void> {
		const url = `/inbox-targets/${this.#uuid}` as const;
		const requestInit = { method: 'DELETE' } as const;
		const resp = await this.#client.fetch(url, requestInit);
		await assertResponse(resp, 'Error deleting inbox target', url, requestInit);
	}

	async revalidate(): Promise<InboxTarget> {
		const url = `/inbox-targets/${this.#uuid}/revalidate` as const;
		const requestInit = { method: 'POST' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error revalidating inbox target', url, requestInit);
		const inboxTarget = await resp.json();
		return inboxTarget;
	}
}
