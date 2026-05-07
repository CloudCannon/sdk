import type CloudCannonClient from '../index.ts';

export class BackupClient {
	#uuid: string;
	#client: CloudCannonClient;

	constructor(uuid: string, client: CloudCannonClient) {
		this.#uuid = uuid;
		this.#client = client;
	}

	async download(): Promise<Response> {
		const resp = await this.#client.fetch(`/site-archives/${this.#uuid}/download`);
		if (resp.status === 401 || resp.status === 403) {
			throw new Error('Error downloading backup. Permission denied');
		}
		return resp;
	}
}
