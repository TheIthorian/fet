import { request } from 'fet-http';
import { logContext, makeLogger } from 'fet-logger';

const log = makeLogger(module);

export interface DiscoverLocationInput {
    lat: number;
    lon: number;
    q: string;
    limit?: number;
}

interface LocationCategory {
    id: string;
    name: string;
    primary?: boolean;
}

interface LocationChain {
    id: string;
    name: string;
}

export interface DiscoverLocationItem {
    title: string;
    id: string;
    language: string;
    ontologyId: string;
    resultType: string;
    address: {
        label: string;
        countryCode: string;
        countryName: string;
        state: string;
        countyCode: string;
        county: string;
        city: string;
        district: string;
        street: string;
        postalCode: string;
    };
    position: {
        lat: string;
        lng: string;
    };
    distance: number;
    categories: LocationCategory[];
    chains: LocationChain[];
}

export class HereClient {
    constructor(
        private readonly baseUrl: string,
        private readonly apiKey: string
    ) {
        log.info(`Created HereClient with baseUrl: ${this.baseUrl} and apiKey: ${this.apiKey}`);
    }

    async discoverLocation({
        lat,
        lon,
        q,
        limit = 1,
    }: DiscoverLocationInput): Promise<{ items: DiscoverLocationItem[] }> {
        logContext(`${HereClient.name}.${this.discoverLocation.name}`, { lat, lon, limit, q }, log);

        const searchParams = new URLSearchParams({
            at: `${lat},${lon}`,
            limit: String(limit),
            q,
            apiKey: this.apiKey,
        });

        const response = await request(`${this.baseUrl}/discover?${searchParams.toString()}`, {
            method: 'GET',
        });

        return (await response.json()) as { items: DiscoverLocationItem[] };
    }
}
