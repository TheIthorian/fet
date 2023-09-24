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
    UpdateDistanceInput,
    UpdateDistanceOutput,
} from 'fet-journey-service-client';
import type { Database } from './database';

const log = makeLogger(module);

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
