import type CloudCannonClient from '../index.ts';
import { assertResponse } from './errors.ts';

export class BuildClient {
	#uuid: string;
	#client: CloudCannonClient;

	constructor(uuid: string, client: CloudCannonClient) {
		this.#uuid = uuid;
		this.#client = client;
	}

	async get(): Promise<Response> {
		const url = `/builds/${this.#uuid}` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching build', url, requestInit);
		return resp;
	}
}
