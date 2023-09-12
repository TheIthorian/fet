import { MicroserviceClient } from 'fet-http';
import {
    CreateJourneyInput,
    CreateJourneyOutput,
    EndJourneyInput,
    EndJourneyOutput,
    GetJourneyInput,
    GetJourneyOutput,
    UpdateDistanceInput,
    UpdateDistanceOutput,
} from './schema';
import { logContext, makeLogger } from 'fet-logger';

const log = makeLogger(module);

export interface IJourneyServiceClient {
    get(input: GetJourneyInput): Promise<GetJourneyOutput>;
    create(input: CreateJourneyInput): Promise<CreateJourneyOutput>;
    updateDistance(input: UpdateDistanceInput): Promise<UpdateDistanceOutput>;
    endJourney(input: EndJourneyInput): Promise<EndJourneyOutput>;
}

export function makeClient(baseUrl: string, apiKey: string): IJourneyServiceClient {
    const msClient = new MicroserviceClient(baseUrl, apiKey);
    const jsClient = new JourneyServiceClient(msClient);
    return jsClient;
}

export class JourneyServiceClient implements IJourneyServiceClient {
    constructor(private readonly microserviceClient: MicroserviceClient) {}

    async get(input: GetJourneyInput): Promise<GetJourneyOutput> {
        const { userId, journeyId } = input;
        logContext(`${JourneyServiceClient.name}.${this.get.name}`, { userId, journeyId }, log);

        return await this.microserviceClient.get(`/api/users/${userId}/journey/${journeyId}`);
    }

    async create(input: CreateJourneyInput): Promise<CreateJourneyOutput> {
        const { userId } = input;
        logContext(`${JourneyServiceClient.name}.${this.create.name}`, { userId }, log);

        return await this.microserviceClient.post(`/api/users/${userId}/journey/`);
    }

    async updateDistance(input: UpdateDistanceInput): Promise<UpdateDistanceOutput> {
        const { userId, journeyId, coordinates } = input;
        logContext(
            `${JourneyServiceClient.name}.${this.updateDistance.name}`,
            { userId, journeyId },
            log
        );

        return await this.microserviceClient.post(
            `/api/users/${userId}/journey/${journeyId}/position`,
            { body: { coordinates } }
        );
    }

    async endJourney(input: EndJourneyInput): Promise<EndJourneyOutput> {
        const { userId, journeyId, carId } = input;
        logContext(
            `${JourneyServiceClient.name}.${this.endJourney.name}`,
            { userId, journeyId, carId },
            log
        );

        return await this.microserviceClient.post(`/api/users/${userId}/journey/${journeyId}/end`, {
            body: { carId },
        });
    }
}
