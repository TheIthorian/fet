export async function request(...args: Parameters<typeof fetch>) {
    const [url, reqInit] = args;
    const method = reqInit?.method ?? 'GET';

    console.log(`${url} -> ${method}`);
    const response = await fetch(...args);

    const hasJsonBody = response.headers.get('content-type')?.includes('application/json');
    if (!response.ok) {
        console.log(`${url} <- ${method} (${response.status})`);
        throw new StatusCodeError({
            statusCode: response.status,
            statusText: response.statusText,
            error: hasJsonBody ? await response.json() : await response.text(),
        });
    }

    console.log(`${url} <- ${method} (${response.status})`);

    return response;
}

export class StatusCodeError {
    public statusCode: number;
    public statusText: string;
    public error: Error;

    constructor(details: { statusCode: number; statusText: string; error: Error }) {
        this.statusCode = details.statusCode;
        this.statusText = details.statusText;
        this.error = details.error;
    }
}
