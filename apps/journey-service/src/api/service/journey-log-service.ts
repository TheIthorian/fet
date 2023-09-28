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
            const savedJourney = await this.msClient.post<CompletedJourney>('/iapi/journey', {
                body: completedJourney,
            });
            log.info(`${ctx} - saved journey ${savedJourney.id}`);
        } catch (error) {
            log.error(`${ctx} Error posting completed journey`, error);
        }
    }
}
