export type PaginationOptions = {
	page?: number;
	items?: number;
};

export type SortingOptions<Op> = Op extends { parameters: { query?: infer Q } }
	? Pick<NonNullable<Q>, Extract<keyof NonNullable<Q>, 'sort_attribute' | 'sort_direction'>>
	: never;

export type FilterOptions<Op> = Op extends { parameters: { query?: infer Q } }
	? {
			filters?: Omit<NonNullable<Q>, 'page' | 'items' | 'sort_attribute' | 'sort_direction'>;
		}
	: never;

export type PaginatedResponse<T> = {
	items: T[];
	current_page?: number;
	total_items?: number;
	total_pages?: number;
};

export function buildQuery(
	options: PaginationOptions & {
		sort_attribute?: string;
		sort_direction?: 'ASC' | 'DESC';
		filters?: Record<string, unknown>;
	} = {}
): `?${string}` | '' {
	const params = new URLSearchParams();
	if (options.page !== undefined) params.set('page', String(options.page));
	if (options.items !== undefined) params.set('items', String(options.items));
	if (options.sort_attribute !== undefined) params.set('sort_attribute', options.sort_attribute);
	if (options.sort_direction !== undefined) params.set('sort_direction', options.sort_direction);
	if (options.filters) {
		for (const [key, value] of Object.entries(options.filters)) {
			if (value !== undefined) {
				params.set(key, String(value));
			}
		}
	}

	const result = params.toString();
	if (result.length > 0) {
		return `?${result}`;
	}
	return '';
}

export function paginatedResponse<T>(items: T[], headers: Headers): PaginatedResponse<T> {
	const parse = (name: string): number | undefined => {
		const value = headers.get(name);
		if (value === null) return undefined;
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : undefined;
	};
	return {
		items,
		current_page: parse('current_page'),
		total_items: parse('total_items'),
		total_pages: parse('total_pages'),
	};
}
