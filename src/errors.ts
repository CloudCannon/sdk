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
