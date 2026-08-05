export class ApiError extends Error {
	errors: unknown;
	url: string;
	options: unknown;
	status: number | null;

	constructor(
		message: string,
		errors: unknown,
		url: string,
		options: unknown,
		status: number | null
	) {
		super(message);
		this.errors = errors;
		this.url = url;
		this.options = options;
		this.status = status;
	}
}

export class AuthenticationError extends ApiError {
	authHeaders: Record<string, string>;

	constructor(
		message: string,
		errors: unknown,
		url: string,
		options: unknown,
		authHeaders: Record<string, string>
	) {
		super(message, errors, url, options, 401);

		this.authHeaders = authHeaders;
	}
}

export class ForbiddenError extends ApiError {
	constructor(message: string, errors: unknown, url: string, options: unknown) {
		super(message, errors, url, options, 403);
	}
}

export class NotFoundError extends ApiError {
	constructor(message: string, errors: unknown, url: string, options: unknown) {
		super(message, errors, url, options, 404);
	}
}

export class PaymentRequiredError extends ApiError {
	constructor(message: string, errors: unknown, url: string, options: unknown) {
		super(message, errors, url, options, 402);
	}
}

export class UnprocessableEntityError extends ApiError {
	constructor(message: string, errors: unknown, url: string, options: unknown) {
		super(message, errors, url, options, 422);
	}
}

export type ResponseInfo = {
	status: number;
	json: () => Promise<unknown>;
};

async function readError(resp: ResponseInfo): Promise<unknown> {
	try {
		return await resp.json();
	} catch {
		return undefined;
	}
}

export async function assertResponse<R extends ResponseInfo>(
	resp: R,
	message: string,
	url: string,
	options?: unknown
): Promise<Exclude<R, { status: 402 | 403 | 404 | 422 }>> {
	if (resp.status === 402) {
		throw new PaymentRequiredError(message, await readError(resp), url, options);
	}
	if (resp.status === 403) {
		throw new ForbiddenError(message, await readError(resp), url, options);
	}
	if (resp.status === 404) {
		throw new NotFoundError(message, await readError(resp), url, options);
	}
	if (resp.status === 422) {
		const body = (await readError(resp)) as { errors?: unknown };
		throw new UnprocessableEntityError(message, body?.errors, url, options);
	}
	return resp as Exclude<R, { status: 402 | 403 | 404 | 422 }>;
}
