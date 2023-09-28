import { fetch } from 'undici';

export async function request(...args: Parameters<typeof fetch>) {
    const response = await fetch(...args);

    const hasJsonBody = response.headers.get('content-type')?.includes('application/json');
    if (!response.ok) {
        throw new StatusCodeError({
            statusCode: response.status,
            statusText: response.statusText,
            error: hasJsonBody ? await response.json() : await response.text(),
        });
    }

    return response;
}

export class StatusCodeError {
    public statusCode: number;
    public statusText: string;
    public error: any;

    constructor(details: { statusCode: number; statusText: string; error: any }) {
        this.statusCode = details.statusCode;
        this.statusText = details.statusText;
        this.error = details.error;
    }
}
