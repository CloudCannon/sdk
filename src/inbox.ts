import type CloudCannonClient from '../index.ts';
import type { FormSubmission } from '../index.ts';
import type { operations } from '../schema.js';
import { assertResponse } from './errors.ts';
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
		const url = `/inboxes/${this.#uuid}/form-hooks${query}` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching submissions', url, requestInit);
		const submissions = await resp.json();
		return paginatedResponse(submissions, resp.headers);
	}
}
