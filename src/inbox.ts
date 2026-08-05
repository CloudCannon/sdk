import type CloudCannonClient from '../index.ts';
import type { FormSubmission } from '../index.ts';
import type { operations } from '../schema.js';
import {
	buildQuery,
	type FilterOptions,
	type PaginatedResponse,
	type PaginationOptions,
	paginatedResponse,
	type SortingOptions,
} from './helpers/query.ts';

export type ListInboxSubmissionsOptions = PaginationOptions &
	SortingOptions<operations['InboxesFormHooksIndex']> &
	FilterOptions<operations['InboxesFormHooksIndex']>;

export class InboxClient {
	#uuid: string;
	#client: CloudCannonClient;

	constructor(uuid: string, client: CloudCannonClient) {
		this.#uuid = uuid;
		this.#client = client;
	}

	async getSubmissions(
		options: ListInboxSubmissionsOptions = {}
	): Promise<PaginatedResponse<FormSubmission>> {
		const query = buildQuery(options);
		const resp = await this.#client.fetch(`/inboxes/${this.#uuid}/form-hooks${query}`);
		if (resp.status === 401 || resp.status === 403) {
			throw new Error('Error fetching submissions. Permission denied');
		}
		const submissions = await resp.json();
		return paginatedResponse(submissions, resp.headers);
	}
}
