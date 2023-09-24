import { ulid } from 'ulid';
import { ResourceNotFoundError } from 'fet-errors';
import { logContext, makeLogger } from 'fet-logger';
import type {
    Coordinates,
    CreateJourneyInput,
    CreateJourneyOutput,
    EndJourneyInput,
    EndJourneyOutput,
    GetJourneyInput,
    GetJourneyOutput,
    Journey,
    PostLocationInput,
    PostLocationOutput,
    UpdateDistanceInput,
    UpdateDistanceOutput,
} from 'fet-journey-service-client';
import type { Database } from './database';

const log = makeLogger(module);

const MINIMUM_VELOCITY_TO_START_JOURNEY_IN_METERS_PER_SECOND = 7;
const MAXIMUM_VELOCITY_TO_STOP_JOURNEY_IN_METERS_PER_SECOND = 1;

export class JourneyApi {
    constructor(private readonly database: Database<Journey>) {}

    async get({ userId, journeyId }: GetJourneyInput): Promise<GetJourneyOutput> {
        const journey = await this.database.get(journeyId);

        if (!journey || journey.userId !== userId) {
            throw new ResourceNotFoundError(`Journey with id ${journeyId} not found`);
        }

        return { journey };
    }

    async create({ userId }: CreateJourneyInput): Promise<CreateJourneyOutput> {
        const ctx = logContext(`${JourneyApi.name}.${this.create.name}`, { userId }, log);
        const id = ulid();
        const journey: Journey = {
            id,
            startTime: new Date(),
            distance: 0,
            userId,
        };

        log.info(`${ctx} creating new journey: ${JSON.stringify(journey)}`);

        await this.database.put(id, journey);
        return { journey };
    }

    async updateDistance(input: UpdateDistanceInput): Promise<UpdateDistanceOutput> {
        const { userId, coordinates, journeyId } = input;
        const { journey: existingJourney } = await this.get({ userId, journeyId });

        existingJourney.distance += calculateDistanceChange(
            existingJourney.lastLocation ?? coordinates,
            coordinates
        );
        existingJourney.lastLocation = coordinates;

        await this.database.put(journeyId, existingJourney);

        return { distance: existingJourney.distance };
    }

    async endJourney(input: EndJourneyInput): Promise<EndJourneyOutput> {
        const { carId, userId, journeyId } = input;

        const { journey } = await this.get({ userId, journeyId });
        await this.database.pop(journeyId);

        log.info(`${JourneyApi.name}.${this.endJourney.name}`, { journey, carId }); // Send to db
        journey.endTime = new Date();
        journey.carId = carId;

        return { journey };
    }

    async postLocation(input: PostLocationInput): Promise<PostLocationOutput> {
        const { userId, velocity, lat, lon } = input;
        const ctx = logContext(`${JourneyApi.name}.${this.postLocation.name}`, { userId }, log);

        const existingJourney = await this.database.search('userId', userId);

        if (!existingJourney) {
            log.info(`${ctx} No existing journey found`);

            // Create new journey
            // TODO - handle case where velocity is undefined and so should take previous location to find it
            if (velocity && velocity > MINIMUM_VELOCITY_TO_START_JOURNEY_IN_METERS_PER_SECOND) {
                log.info(`${ctx} Creating new journey as velocity (${velocity}) is high enough`);
                const { journey: newJourney } = await this.create({ userId });
                newJourney.lastLocation = {
                    lat: input.lat,
                    long: input.lon,
                };
                await this.database.put(newJourney.id, newJourney);
                return { journey: newJourney };
            }

            // User is not moving fast enough to consider a new journey
            log.info(
                `${ctx} Velocity (${
                    velocity ?? 'undefined'
                }) is not high enough to create new journey.`
            );
            return { journey: null };
        }

        // Already on an existing journey
        log.info(`${ctx} Already on existing journey (${existingJourney.id})`);
        if (velocity && velocity <= MAXIMUM_VELOCITY_TO_STOP_JOURNEY_IN_METERS_PER_SECOND) {
            log.info(`${ctx} Velocity is ${velocity} below minimum. Handling stop`);
            if (await isAtPetrolStation({ lat, long: lon })) {
                log.info(`${ctx} stopped at petrol station. Ending journey`);
                // Ping user
                return this.endJourney({ journeyId: existingJourney.id, userId, carId: 1 }); // This needs to be in a complete state which can be updated later
            }
        }

        // Continue journey
        log.info(`${ctx} continuing journey`);
        await this.updateDistance({
            userId,
            journeyId: existingJourney.id,
            coordinates: { long: lon, lat },
        });

        return { journey: existingJourney };
    }
}

function calculateDistanceChange(
    previousCoordinates: Coordinates,
    currentCoordinates: Coordinates
): number {
    const earthRadiusInMeters = 6371000;

    // Convert latitude and longitude from degrees to radians
    const lat1Rad = (previousCoordinates.lat * Math.PI) / 180;
    const lon1Rad = (previousCoordinates.long * Math.PI) / 180;
    const lat2Rad = (currentCoordinates.lat * Math.PI) / 180;
    const lon2Rad = (currentCoordinates.long * Math.PI) / 180;

    const latDiff = lat2Rad - lat1Rad;
    const lonDiff = lon2Rad - lon1Rad;

    // Haversine formula
    const a =
        Math.sin(latDiff / 2) ** 2 +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(lonDiff / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = earthRadiusInMeters * c;

    log.info(`${calculateDistanceChange.name} distance ${distance}`); // Calculate

    return distance;
}

function isAtPetrolStation({ lat, long }: Coordinates): Promise<boolean> {
    log.info({ lat, long });
    return Promise.resolve(false);
}
