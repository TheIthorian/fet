import { MicroserviceClient } from 'fet-http';
import { PostLocationInput, PostLocationOutput } from './schema';
import { logContext, makeLogger } from 'fet-logger';

const log = makeLogger(module);

export interface IJourneyServiceClient {
    postLocation(input: PostLocationInput): Promise<PostLocationOutput>;
}

export function makeClient(baseUrl: string, apiKey: string): IJourneyServiceClient {
    const msClient = new MicroserviceClient(baseUrl, apiKey);
    const jsClient = new JourneyServiceClient(msClient);
    return jsClient;
}

export class JourneyServiceClient implements IJourneyServiceClient {
    constructor(private readonly microserviceClient: MicroserviceClient) {}

    async postLocation(input: PostLocationInput): Promise<PostLocationOutput> {
        const { userId } = input;
        logContext(`${JourneyServiceClient.name}.${this.postLocation.name}`, { userId }, log);

        return await this.microserviceClient.post(`/api/users/${userId}/location`, {
            body: input,
        });
    }
}
