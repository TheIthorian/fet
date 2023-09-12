import { ulid } from 'ulid';
import { ResourceNotFoundError } from 'fet-errors';
import { makeLogger } from 'fet-logger';
import type {
    Coordinates,
    CreateJourneyInput,
    CreateJourneyOutput,
    EndJourneyInput,
    EndJourneyOutput,
    GetJourneyInput,
    Journey,
    UpdateDistanceInput,
    UpdateDistanceOutput,
} from 'fet-journey-service-client';
import type { Database } from './database';

const log = makeLogger(module);

export class JourneyApi {
    constructor(private readonly database: Database<Journey>) {}

    async get({ userId, journeyId }: GetJourneyInput): Promise<Journey> {
        const journey = await this.database.get(journeyId);

        if (!journey || journey.userId !== userId) {
            throw new ResourceNotFoundError(`Journey with id ${journeyId} not found`);
        }

        return journey;
    }

    async create({ userId }: CreateJourneyInput): Promise<CreateJourneyOutput> {
        const id = ulid();
        const journey: Journey = {
            id,
            startTime: new Date(),
            distance: 0,
            userId,
        };

        await this.database.put(id, journey);
        return journey;
    }

    async updateDistance(input: UpdateDistanceInput): Promise<UpdateDistanceOutput> {
        const { userId, coordinates, journeyId } = input;
        const existingJourney = await this.get({ userId, journeyId });

        existingJourney.distance += calculateDistanceChange(
            existingJourney.lastPosition ?? coordinates,
            coordinates
        );

        await this.database.put(journeyId, existingJourney);

        return { distance: existingJourney.distance };
    }

    async endJourney(input: EndJourneyInput): Promise<EndJourneyOutput> {
        const { carId, userId, journeyId } = input;

        const journey = await this.get({ userId, journeyId });
        await this.database.pop(journeyId);

        log.info(`${JourneyApi.name}.${this.endJourney.name}`, { journey, carId }); // Send to db
        journey.endTime = new Date();
        journey.carId = carId;

        return journey;
    }
}

function calculateDistanceChange(
    previousCoordinates: Coordinates,
    currentCoordinates: Coordinates
): number {
    log.info(`${calculateDistanceChange.name}`, { previousCoordinates, currentCoordinates }); // Calculate
    return 1;
}
