import { MicroserviceClient } from 'fet-http';
import { logContext, makeLogger } from 'fet-logger';
import type { CompletedJourney } from '../journey/types';
import { config } from '../../config';
import type { LocationService } from './location/types';
import { HereLocationService } from './location';
import { makeHereClient } from './location/here-client';

const log = makeLogger(module);

export function makeJourneyLogService(): JourneyLogService {
    const journeyLogMsClient = new MicroserviceClient(config.mainApp.url, config.mainApp.apiKey);

    const hereClient = makeHereClient(config.hereApi.discoverSearchUrl, config.hereApi.apiKey);
    const hereLocationService = new HereLocationService(hereClient);

    return new JourneyLogService(journeyLogMsClient, hereLocationService);
}

export class JourneyLogService {
    constructor(
        private readonly msClient: MicroserviceClient,
        private readonly locationService: LocationService
    ) {}

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
            const completedJourneyWithLocationDetails = await this.enhanceWithLocationDetails(completedJourney);
            const savedJourney = await this.msClient.post<CompletedJourney>('/iapi/journey', {
                body: completedJourneyWithLocationDetails,
            });
            log.info(`${ctx} - saved journey ${savedJourney.id}`);
        } catch (error) {
            log.error(`${ctx} Error posting completed journey`);
            log.error(error);
        }
    }

    private async enhanceWithLocationDetails(
        completedJourney: CompletedJourney
    ): Promise<CompletedJourneyWithLocationDetails> {
        const { isAtPetrolStation } = await this.locationService.getLocationDetails({
            lat: completedJourney.lastLocation.lat,
            lon: completedJourney.lastLocation.lon,
        });

        return {
            ...completedJourney,
            isAtPetrolStation,
        };
    }
}

interface CompletedJourneyWithLocationDetails extends CompletedJourney {
    isAtPetrolStation: boolean;
}
