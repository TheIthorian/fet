import { ResourceNotFoundError } from 'fet-errors';
import type { Database } from './database';

export interface Journey {
    startTime: Date;
    distance: number;
    userId: number;
    lastPosition?: Coordinates;
    endTime?: Date;
}

export interface Coordinates {
    lat: number;
    long: number;
}

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

    async create(userId: number): Promise<Journey & { id: string }> {
        const journey = {
            startTime: new Date(),
            distance: 0,
            userId,
        };

        const id = await this.database.put(journey);
        return { ...journey, id };
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

        await this.database.put(existingJourney);

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

        journey.endTime = new Date();

        console.log(carId); // Send to db

        return journey;
    }
}

function calculateDistanceChange(
    previousCoordinates: Coordinates,
    currentCoordinates: Coordinates
): number {
    console.log(previousCoordinates, currentCoordinates); // calculate
    return 1;
}
