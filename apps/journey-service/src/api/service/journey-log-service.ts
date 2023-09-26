import type { MicroserviceClient } from 'fet-http';
import { logContext, makeLogger } from 'fet-logger';
import type { CompletedJourney } from '../journey/types';

const log = makeLogger(module);

export class JourneyLogService {
    constructor(private readonly msClient: MicroserviceClient) {}

    public async saveCompletedJourney(completedJourney: CompletedJourney): Promise<void> {
        log.info(`${logContext(`${JourneyLogService.name}.${this.saveCompletedJourney.name}`)}`, {
            id: completedJourney.id,
            lastLocation: completedJourney.lastLocation,
        });
        await this.msClient.post('/iapi/journey', {
            body: completedJourney,
        });
    }
}
