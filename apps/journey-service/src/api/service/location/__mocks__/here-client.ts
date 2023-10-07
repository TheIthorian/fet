import type { IHereClient } from '../here-client';

export const mockHereClient: IHereClient = { discoverLocation: jest.fn().mockResolvedValue({ items: [] }) };

export function makeHereClient(): IHereClient {
    return mockHereClient;
}
