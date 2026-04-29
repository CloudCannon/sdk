import type CloudCannonClient from '../index.ts';

export class SyncClient {
	#uuid: string;
	#client: CloudCannonClient;

	constructor(uuid: string, client: CloudCannonClient) {
		this.#uuid = uuid;
		this.#client = client;
	}

	async get(): Promise<Response> {
		const resp = await this.#client.fetch(`/syncs/${this.#uuid}`);
		if (resp.status === 401 || resp.status === 403) {
			throw new Error('Error fetching sync. Permission denied');
		}
		return resp;
	}
}
