import { setTimeout } from 'node:timers/promises';
import { faker } from '@faker-js/faker';
import { makeClient } from 'fet-journey-service-client';
import { mockHereClient } from '../../api/service/location/__mocks__/here-client';
import { config } from '../../config';
import type { App } from '../utils';
import { getApp } from '../utils';

const apiKey = config.apiKey;
const jsClient = makeClient(`http://${config.host}:${config.port}`, apiKey);

jest.mock('../../api/service/location/here-client', () => ({
    makeHereClient: jest.fn().mockReturnValue(mockHereClient),
}));

describe('JourneyServiceClient', () => {
    const userId = faker.number.int();
    let app: App;

    beforeAll(async () => {
        jest.mocked(mockHereClient.discoverLocation).mockResolvedValue({ items: [] });
        app = await getApp();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    afterAll(async () => {
        await app.shutdown();
    });

    describe('happy path', () => {
        const startDate = new Date();
        const reading2Date = new Date(startDate.getTime() + 10_000);
        const reading3Date = new Date(reading2Date.getTime() + 10_000);
        const reading4Date = new Date(reading3Date.getTime() + 100_000);

        let journeyId: string;

        it('should create a journey when velocity is high enough', async () => {
            const { journey } = await jsClient.postLocation({
                userId,
                lat: 51.5,
                lon: -0.14,
                created_at: startDate.toISOString(),
                velocity: 10,
            });

            expect(journey).toMatchObject({
                id: expect.any(String) as string,
                userId,
                startTime: startDate.toISOString(),
                status: 'new',
                startLocation: { lat: 51.5, lon: -0.14 },
                lastLocation: { lat: 51.5, lon: -0.14 },
                distance: 0,
            });

            if (!journey) {
                throw new Error('Journey not created');
            }

            journeyId = journey.id;
        });

        it('should update journey location', async () => {
            const { journey: inProgressJourney } = await jsClient.postLocation({
                userId,
                lat: 51.6,
                lon: -0.15,
                created_at: reading2Date.toISOString(),
                velocity: 10,
            });

            expect(inProgressJourney).toMatchObject({
                id: journeyId,
                userId,
                startTime: startDate.toISOString(),
                status: 'inProgress',
                startLocation: { lat: 51.5, lon: -0.14 },
                lastLocation: { lat: 51.6, lon: -0.15 },
                lastReadingDate: reading2Date.toISOString(),
                lastSignificantReadingDate: reading2Date.toISOString(),
                distance: 11157.441621057978,
            });
        });

        it('should update journey location a second time', async () => {
            const { journey: inProgressJourney2 } = await jsClient.postLocation({
                userId,
                lat: 51.75,
                lon: -0.165,
                created_at: reading3Date.toISOString(),
                velocity: 10,
            });

            expect(inProgressJourney2).toMatchObject({
                id: journeyId,
                userId,
                startTime: startDate.toISOString(),
                status: 'inProgress',
                startLocation: { lat: 51.5, lon: -0.14 },
                lastLocation: { lat: 51.75, lon: -0.165 },
                lastReadingDate: reading3Date.toISOString(),
                lastSignificantReadingDate: reading3Date.toISOString(),
                distance: 27888.060536859804,
            });
        });

        it('end the journey', async () => {
            const lat = 51.7;
            const lon = -0.16;

            jest.mocked(mockHereClient.discoverLocation).mockResolvedValue({ items: [] });

            const { journey: completedJourney } = await jsClient.postLocation({
                userId,
                lat,
                lon,
                created_at: reading4Date.toISOString(),
                velocity: 0,
            });

            expect(completedJourney).toMatchObject({
                id: journeyId,
                userId,
                startTime: startDate.toISOString(),
                status: 'completed',
                startLocation: { lat: 51.5, lon: -0.14 },
                lastLocation: { lat: 51.75, lon: -0.165 },
                distance: 27888.060536859804,
                endTime: reading4Date.toISOString(),
            });

            await setTimeout(100);

            expect(mockHereClient.discoverLocation).toHaveBeenCalledTimes(1);
            expect(mockHereClient.discoverLocation).toHaveBeenCalledWith({
                lat: 51.75,
                lon: -0.165, // use previous location
                q: 'petrol station',
            });
        });
    });

    it('does not start journey when velocity is not high enough', async () => {
        const startDate = new Date();

        const response = await jsClient.postLocation({
            userId,
            lat: 51.5,
            lon: -0.14,
            created_at: startDate.toISOString(),
            velocity: 6.5,
        });

        expect(response).toStrictEqual({});
    });
});
