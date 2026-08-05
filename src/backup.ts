import type CloudCannonClient from '../index.ts';
import { assertResponse } from './errors.ts';

export class BackupClient {
	#uuid: string;
	#client: CloudCannonClient;

	constructor(uuid: string, client: CloudCannonClient) {
		this.#uuid = uuid;
		this.#client = client;
	}

	async download(): Promise<Response> {
		const url = `/site-archives/${this.#uuid}/download` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error downloading backup', url, requestInit);
		return resp;
	}
}
