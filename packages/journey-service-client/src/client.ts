import { MicroserviceClient } from 'fet-http';
import {
    CreateJourneyInput,
    CreateJourneyOutput,
    GetJourneyInput,
    GetJourneyOutput,
} from './schema';
import { logContext, makeLogger } from 'fet-logger';

const log = makeLogger(module);

export class JourneyServiceClient {
    constructor(private readonly microserviceClient: MicroserviceClient) {}

    async get(input: GetJourneyInput): Promise<GetJourneyOutput> {
        const { userId, journeyId } = input;
        logContext(`${JourneyServiceClient.name}.${this.get.name}`, { userId, journeyId }, log);

        return await this.microserviceClient.get<GetJourneyOutput>(
            `/api/user/${userId}journey/${journeyId}`
        );
    }

    async create(input: CreateJourneyInput) {
        const { userId } = input;
        logContext(`${JourneyServiceClient.name}.${this.create.name}`, { userId }, log);

        return await this.microserviceClient.post<CreateJourneyOutput>(
            `/api/user/${userId}journey/`
        );
    }
}
