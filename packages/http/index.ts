import { HttpCalloutError } from 'fet-errors';
import { makeLogger } from 'fet-logger';
import { inspect } from 'util';
import { fetch } from 'node-fetch-native';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface CallOptions {
    method?: HttpMethod;
    headers?: Record<string, string>;
    body?: object | Array<object>;
}

const log = makeLogger(module);

const DEFAULT_HEADERS = {};

export class MicroserviceClient {
    constructor(
        public readonly baseUrl: string,
        public readonly apiKey: string
    ) {
        log.info(
            `Created MicroserviceClient using url: ${this.baseUrl} with apiKey: ${this.apiKey}`
        );
    }

    async call<T>(
        url: string,
        { method = 'GET', headers = {}, body = {} }: CallOptions = {}
    ): Promise<T> {
        headers = { ...DEFAULT_HEADERS, ...headers, Authorization: `apikey ${this.apiKey}` };

        const requestBody = body && JSON.stringify(body);
        if (requestBody) {
            headers['content-type'] = 'application/json';
        }

        log.debug('calling service with: ', this.baseUrl + url, {
            method,
            headers,
            body: requestBody,
        });

        const response = await fetch(this.baseUrl + url, {
            method,
            headers,
            body: requestBody,
        });

        const bodyData = await getBodyFromResponse(response);

        if (!response.ok) {
            log.error(`Error calling ${url}` + inspect(bodyData, { depth: null, colors: true }));
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

async function getBodyFromResponse(response: Awaited<ReturnType<typeof fetch>>) {
    const contentType = response.headers.get('content-type');

    if (contentType?.toLowerCase().includes('json')) {
        return await response.json();
    }

    if (contentType?.toLowerCase().includes('text')) {
        return await response.text();
    }

    return await response.blob();
}
