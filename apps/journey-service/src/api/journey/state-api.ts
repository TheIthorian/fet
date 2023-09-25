import { ulid } from 'ulid';
import { logContext, makeLogger } from 'fet-logger';
import type { PostLocationInput } from 'fet-journey-service-client';
import type { Database } from './database';
import type {
    CompletedJourney,
    Coordinates,
    InProgressJourney,
    Journey,
    NewJourney,
} from './types';

const log = makeLogger(module);

const MINIMUM_VELOCITY_TO_START_JOURNEY_IN_METERS_PER_SECOND = 7;
const MAXIMUM_VELOCITY_TO_STOP_JOURNEY_IN_METERS_PER_SECOND = 1;

const MINIMUM_STATIONARY_TIME_BEFORE_END_IN_MILLISECONDS = 3 * 60 * 1000; // 3 min

export class JourneyStateApi {
    constructor(
        private readonly database: Database<NewJourney | InProgressJourney | CompletedJourney>
    ) {}

    public async handlePostLocation({
        userId,
        lat,
        lon,
        created_at,
        velocity,
        distance,
    }: PostLocationInput): Promise<Journey | undefined> {
        const createdAtDate = new Date(created_at);

        const ctx = logContext(
            `${JourneyStateApi.name}.${this.handlePostLocation.name}`,
            { createdAtDate, userId },
            log
        );

        const activeJourney = await this.database.search('userId', userId);

        if (!activeJourney) {
            log.info(`${ctx} No active journey found`);

            if (this.shouldStartNewJourney({ velocity, lat, lon })) {
                log.info(
                    `${ctx} Velocity (${
                        velocity ?? 'undefined'
                    }) high enough to start a new journey`
                );

                return this.startNewJourney({
                    userId,
                    startTime: new Date(created_at),
                    startLocation: { lat, lon },
                });
            }

            // Ignore. Velocity not high enough
            log.info(
                `${ctx} Velocity (${
                    velocity ?? 'undefined'
                }) not high enough to start a new journey`
            );
            return;
        }

        // Shouldn't happen?
        if (activeJourney.status === 'completed') {
            log.info(`${ctx} Journey ${activeJourney.id} is completed. Skipping`);
            return activeJourney;
        }

        if (activeJourney.status === 'new') {
            const delta =
                distance ?? calculateDistanceChange(activeJourney.startLocation, { lat, lon });
            const newDistance = activeJourney.distance + delta;

            log.info(
                `${ctx} Journey ${activeJourney.id} is new. Setting distance to ${newDistance}`
            );

            const inProgressJourney: InProgressJourney = {
                ...activeJourney,
                status: 'inProgress',
                lastLocation: activeJourney.startLocation,
                lastReadingDate: new Date(createdAtDate),
                distance: newDistance,
            };
            await this.database.put(activeJourney.id, inProgressJourney);
            return inProgressJourney;
        }

        const timeSinceLastReading =
            new Date(createdAtDate).getTime() - new Date(activeJourney.lastReadingDate).getTime();
        const actualDistance =
            distance ?? calculateDistanceChange(activeJourney.lastLocation, { lon, lat });
        const actualVelocity = velocity ?? (1000 * actualDistance) / timeSinceLastReading;

        log.info(`${ctx} Journey ${activeJourney.id} is in progress.`);
        if (this.shouldStopJourney({ velocity: actualVelocity, timeSinceLastReading })) {
            log.info(`Stopping journey ${activeJourney.id}.`, {
                actualVelocity,
                timeSinceLastReading,
            });
            return this.stopJourney(activeJourney, createdAtDate);
        }

        // update distance
        const newDistance = activeJourney.distance + actualDistance;

        log.info(
            `${ctx} Journey ${activeJourney.id} is in progress. Updating distance by ${actualDistance} to ${newDistance}`
        );
        const updatedJourney: InProgressJourney = {
            ...activeJourney,
            lastLocation: { lat, lon },
            lastReadingDate: createdAtDate,
            distance: newDistance,
        };
        await this.database.put(updatedJourney.id, updatedJourney);
        return updatedJourney;
    }

    public async startNewJourney({
        userId,
        startTime,
        startLocation,
    }: {
        userId: number;
        startTime: Date;
        startLocation: Coordinates;
    }): Promise<NewJourney> {
        const journeyId = ulid();
        logContext(
            `${JourneyStateApi.name}.${this.startNewJourney.name}`,
            { journeyId, userId, startTime },
            log
        );

        const journey: NewJourney = {
            id: journeyId,
            userId,
            status: 'new',
            startTime,
            startLocation,
            distance: 0,
        };
        await this.database.put(journeyId, journey);
        return journey;
    }

    public async stopJourney(journey: InProgressJourney, endTime: Date): Promise<CompletedJourney> {
        logContext(
            `${JourneyStateApi.name}.${this.stopJourney.name}`,
            { journeyId: journey.id, endTime },
            log
        );

        const completeJourney: CompletedJourney = {
            ...journey,
            status: 'completed',
            endTime,
        };
        await this.database.put(completeJourney.id, completeJourney);
        return completeJourney;
    }

    private shouldStartNewJourney({
        velocity,
        lat,
        lon,
    }: {
        velocity?: number;
        lat: number;
        lon: number;
    }): boolean {
        logContext(`${JourneyStateApi.name}.${this.shouldStartNewJourney.name}`, { lat, lon }, log);
        return Boolean(
            velocity && velocity > MINIMUM_VELOCITY_TO_START_JOURNEY_IN_METERS_PER_SECOND
        );
    }

    private shouldStopJourney({
        velocity,
        timeSinceLastReading,
    }: {
        velocity: number;
        timeSinceLastReading: number;
    }): boolean {
        logContext(
            `${JourneyStateApi.name}.${this.shouldStopJourney.name}`,
            { velocity, timeSinceLastReading },
            log
        );
        return (
            timeSinceLastReading > MINIMUM_STATIONARY_TIME_BEFORE_END_IN_MILLISECONDS &&
            (!velocity || velocity < MAXIMUM_VELOCITY_TO_STOP_JOURNEY_IN_METERS_PER_SECOND)
        );
    }
}

function calculateDistanceChange(
    previousCoordinates: Coordinates,
    currentCoordinates: Coordinates
): number {
    const distance = flatCalc(previousCoordinates, currentCoordinates);

    log.info(`${calculateDistanceChange.name} distance ${distance}`); // Calculate

    return distance;
}

function flatCalc(previousCoordinates: Coordinates, currentCoordinates: Coordinates): number {
    const earthRadius = 6371000; // Radius of the Earth in meters

    console.log(currentCoordinates, previousCoordinates);

    // Calculate the differences in coordinates
    const latDiff = (currentCoordinates.lat - previousCoordinates.lat) * (Math.PI / 180);
    const lonDiff = (currentCoordinates.lon - previousCoordinates.lon) * (Math.PI / 180);

    // Calculate the distance using the flat-surface approximation
    const x = lonDiff * Math.cos((previousCoordinates.lon + currentCoordinates.lat) / 2);
    const y = latDiff;

    const distance = Math.sqrt(x * x + y * y) * earthRadius;

    log.info({ latDiff, lonDiff, x, y, distance });

    return distance;
}

// function haversineCalc(previousCoordinates: Coordinates, currentCoordinates: Coordinates): number {
//     const earthRadiusInMeters = 6371000;

//     // Convert latitude and longitude from degrees to radians
//     const lat1Rad = (previousCoordinates.lat * Math.PI) / 180;
//     const lon1Rad = (previousCoordinates.lon * Math.PI) / 180;
//     const lat2Rad = (currentCoordinates.lat * Math.PI) / 180;
//     const lon2Rad = (currentCoordinates.lon * Math.PI) / 180;

//     const latDiff = lat2Rad - lat1Rad;
//     const lonDiff = lon2Rad - lon1Rad;

//     // Haversine formula
//     const a =
//         Math.sin(latDiff / 2) ** 2 +
//         Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(lonDiff / 2) ** 2;
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//     const distance = earthRadiusInMeters * c;
//     return distance;
// }

// function isAtPetrolStation({ lat, lon }: Coordinates): Promise<boolean> {
//     log.info({ lat, lon });
//     return Promise.resolve(false);
// }
