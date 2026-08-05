import type CloudCannonClient from '../index.ts';
import type { SiteInbox } from '../index.ts';
import type { operations } from '../schema.js';
import { ApiError } from './errors.ts';

export type UpdateInboxOptions =
	operations['SiteInboxesUpdate']['requestBody']['content']['application/json'];

export class SiteInboxClient {
	#uuid: string;
	#client: CloudCannonClient;

	constructor(uuid: string, client: CloudCannonClient) {
		this.#uuid = uuid;
		this.#client = client;
	}

	async update(body: UpdateInboxOptions): Promise<SiteInbox> {
		const resp = await this.#client.fetch(`/site-inboxes/${this.#uuid}`, {
			method: 'PUT',
			body,
		});
		if (resp.status === 401 || resp.status === 403) {
			throw new Error('Error updating inbox. Permission denied');
		}
		if (resp.status === 422) {
			const errorResp = await resp.json();
			throw new ApiError(
				'Error updating inbox. Invalid request',
				errorResp.errors,
				`/site-inboxes/${this.#uuid}`,
				{ method: 'PUT', body },
				resp.status
			);
		}
		const siteInbox = await resp.json();
		return siteInbox;
	}
}
