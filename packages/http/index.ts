import { HttpCalloutError } from 'fet-errors';
import { makeLogger } from 'fet-logger';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface CallOptions {
    method?: HttpMethod;
    headers?: Record<string, string>;
    body?: object | Array<object>;
}

const log = makeLogger(module);

export class MicroserviceClient {
    constructor(
        public readonly baseUrl: string,
        private readonly apiKey: string
    ) {}

    async call<T>(
        url: string,
        { method = 'GET', headers = {}, body = {} }: CallOptions = {}
    ): Promise<T> {
        const response = await fetch(url, {
            method,
            headers: { ...headers, apiKey: this.apiKey },
            body: body ? JSON.stringify(body) : null,
        });

        const bodyData = await getBodyFromResponse(response);

        if (!response.ok) {
            log.error(`Error calling ${url}`, bodyData);
            throw new HttpCalloutError(bodyData);
        }

        return bodyData as T;
    }

    async get<T>(url: string, options?: Omit<CallOptions, 'method'>): Promise<T> {
        return this.call(url, { method: 'GET', ...options });
    }

    async post<T>(url: string, options?: Omit<CallOptions, 'method'>): Promise<T> {
        return this.call(url, { method: 'POST', ...options });
    }

    async put<T>(url: string, options?: Omit<CallOptions, 'method'>): Promise<T> {
        return this.call(url, { method: 'PUT', ...options });
    }

    async delete<T>(url: string, options?: Omit<CallOptions, 'method'>): Promise<T> {
        return this.call(url, { method: 'DELETE', ...options });
    }
}

async function getBodyFromResponse(response: Response) {
    const contentType = response.headers.get('content-type');

    if (contentType?.toLowerCase().includes('json')) {
        return await response.json();
    }

    if (contentType?.toLowerCase().includes('text')) {
        return await response.text();
    }

    return await response.blob();
}
