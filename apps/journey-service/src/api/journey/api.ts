import { ulid } from 'ulid';
import { ResourceNotFoundError } from 'fet-errors';
import { makeLogger } from 'fet-logger';
import type { Database } from './database';
import type { Journey, Coordinates } from './types';

const log = makeLogger(module);

export class JourneyApi {
    constructor(private readonly database: Database<Journey>) {}

    async get(userId: number, journeyId: string): Promise<Journey> {
        const journey = await this.database.get(journeyId);

        if (!journey || journey.userId !== userId) {
            throw new ResourceNotFoundError(`Journey with id ${journeyId} not found`, {
                userId,
                journeyId,
            });
        }

        return journey;
    }

    async create(userId: number): Promise<Journey> {
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

    async updateDistance(input: {
        userId: number;
        newCoordinates: Coordinates;
        journeyId: string;
    }): Promise<number> {
        const { userId, newCoordinates, journeyId } = input;
        const existingJourney = await this.get(userId, journeyId);

        existingJourney.distance += calculateDistanceChange(
            existingJourney.lastPosition ?? newCoordinates,
            newCoordinates
        );

        await this.database.put(journeyId, existingJourney);

        return existingJourney.distance;
    }

    async endJourney(input: {
        carId: number;
        userId: number;
        journeyId: string;
    }): Promise<Journey> {
        const { carId, userId, journeyId } = input;

        const journey = await this.get(userId, journeyId);
        await this.database.pop(journeyId);

        if (!carId) {
            return journey;
        }

        journey.endTime = new Date();

        log.info(`${JourneyApi.name}.${this.endJourney.name}`, journey); // Send to db

        return journey;
    }
}

function calculateDistanceChange(
    previousCoordinates: Coordinates,
    currentCoordinates: Coordinates
): number {
    log.info(`${calculateDistanceChange.name}`, { previousCoordinates, currentCoordinates }); // Send to db
    return 1;
}
