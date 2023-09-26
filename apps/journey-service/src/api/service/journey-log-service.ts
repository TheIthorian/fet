import type { MicroserviceClient } from 'fet-http';
import { logContext, makeLogger } from 'fet-logger';
import type { CompletedJourney } from '../journey/types';

const log = makeLogger(module);

export class JourneyLogService {
    constructor(private readonly msClient: MicroserviceClient) {}

    public async saveCompletedJourney(completedJourney: CompletedJourney): Promise<void> {
        const ctx = logContext(
            `${logContext(`${JourneyLogService.name}.${this.saveCompletedJourney.name}`)}`,
            {
                id: completedJourney.id,
                ...completedJourney.lastLocation,
            },
            log
        );

        try {
            await this.msClient.post('/iapi/journey', {
                body: completedJourney,
            });
        } catch (error) {
            log.error(`${ctx} Error posting completed journey`, error);
        }
    }
}
