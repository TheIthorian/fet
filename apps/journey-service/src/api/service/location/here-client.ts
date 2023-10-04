import { request } from 'fet-http';

export interface DiscoverLocationInput {
    lat: number;
    lon: number;
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
    ) {}

    async discoverLocation({ lat, lon, limit = 1 }: DiscoverLocationInput): Promise<DiscoverLocationItem[]> {
        const searchParams = new URLSearchParams({
            at: `${lat},${lon}`,
            limit: String(limit),
        });

        const response = await request(`${this.baseUrl}/discover?${searchParams.toString()}`, {
            method: 'GET',
            headers: { apiKey: this.apiKey },
        });

        return (await response.json()) as DiscoverLocationItem[];
    }
}
