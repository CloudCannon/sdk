import type CloudCannonClient from '../index.ts';
import type { FormSubmission, Inbox, InboxTarget } from '../index.ts';
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

export type ListInboxTargetsOptions = FilterOptions<operations['InboxesInboxTargetsIndex']>;

export type UpdateInboxSettingsOptions =
	operations['InboxesIndexUpdate']['requestBody']['content']['application/json'];

export type CreateInboxTargetOptions =
	operations['InboxesInboxTargetsCreate']['requestBody']['content']['application/json'];

export class InboxClient {
	#uuid: string;
	#client: CloudCannonClient;

	constructor(uuid: string, client: CloudCannonClient) {
		this.#uuid = uuid;
		this.#client = client;
	}

	async get(): Promise<Inbox> {
		const url = `/inboxes/${this.#uuid}` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching inbox', url, requestInit);
		const inbox = await resp.json();
		return inbox;
	}

	async update(body: UpdateInboxSettingsOptions): Promise<Inbox> {
		const url = `/inboxes/${this.#uuid}` as const;
		const requestInit = { method: 'PUT', body } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error updating inbox', url, requestInit);
		const inbox = await resp.json();
		return inbox;
	}

	async delete(): Promise<void> {
		const url = `/inboxes/${this.#uuid}` as const;
		const requestInit = { method: 'DELETE' } as const;
		const resp = await this.#client.fetch(url, requestInit);
		await assertResponse(resp, 'Error deleting inbox', url, requestInit);
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

	async getTargets(options: ListInboxTargetsOptions = {}): Promise<InboxTarget[]> {
		const query = buildQuery(options);
		const url = `/inboxes/${this.#uuid}/targets${query}` as const;
		const requestInit = { method: 'GET' } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error fetching inbox targets', url, requestInit);
		const targets = await resp.json();
		return targets;
	}

	async createTarget(body: CreateInboxTargetOptions): Promise<InboxTarget> {
		const url = `/inboxes/${this.#uuid}/targets` as const;
		const requestInit = { method: 'POST', body } as const;
		let resp = await this.#client.fetch(url, requestInit);
		resp = await assertResponse(resp, 'Error creating inbox target', url, requestInit);
		const target = await resp.json();
		return target;
	}
}
