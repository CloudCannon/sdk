import type CloudCannonClient from '../index.ts';
import type { FormSubmission } from '../index.ts';

export class InboxClient {
	#uuid: string;
	#client: CloudCannonClient;

	constructor(uuid: string, client: CloudCannonClient) {
		this.#uuid = uuid;
		this.#client = client;
	}

	async getSubmissions(): Promise<FormSubmission[]> {
		const resp = await this.#client.fetch(`/inboxes/${this.#uuid}/form-hooks`);
		if (resp.status === 401 || resp.status === 403) {
			throw new Error('Error fetching submissions. Permission denied');
		}
		const submissions = await resp.json();
		return submissions;
	}
}
