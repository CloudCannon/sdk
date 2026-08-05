import type CloudCannonClient from '../index.ts';
import { assertResponse } from './errors.ts';

export class SyncClient {
	#uuid: string;
	#client: CloudCannonClient;

	constructor(uuid: string, client: CloudCannonClient) {
		this.#uuid = uuid;
		this.#client = client;
	}

	async get(): Promise<Response> {
		const url = `/syncs/${this.#uuid}` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching sync', url, requestInit);
		return resp;
	}
}
