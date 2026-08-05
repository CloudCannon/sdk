import type CloudCannonClient from '../index.ts';
import type { SiteInbox } from '../index.ts';
import type { operations } from '../schema.js';
import { assertResponse } from './errors.ts';

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
		const url = `/site-inboxes/${this.#uuid}` as const;
		const requestInit = { method: 'PUT', body } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error updating inbox', url, requestInit);
		const siteInbox = await resp.json();
		return siteInbox;
	}
}
