import { faker } from '@faker-js/faker';
import { makeClient } from 'fet-journey-service-client';
import config from '../../config';
import type { App } from '../utils';
import { getApp } from '../utils';

const apiKey = config.apiKey;
const jsClient = makeClient(`http://${config.host}:${config.port}`, apiKey);

describe('JourneyServiceClient', () => {
    const userId = faker.number.int();
    let app: App;

    beforeAll(async () => {
        app = await getApp();
    });

    afterAll(async () => {
        await app.shutdown();
    });

    describe('happy path', () => {
        it('should create a journey, update its location, and end it when using the location handler', async () => {
            const startDate = new Date();
            const reading2Date = new Date(startDate.getTime() + 10_000);
            const reading3Date = new Date(reading2Date.getTime() + 10_000);
            const reading4Date = new Date(reading3Date.getTime() + 100_000);

            // Creates journey
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

            // Updates position
            const { journey: inProgressJourney } = await jsClient.postLocation({
                userId,
                lat: 51.6,
                lon: -0.15,
                created_at: reading2Date.toISOString(),
                velocity: 10,
            });

            expect(inProgressJourney).toMatchObject({
                id: journey.id,
                userId,
                startTime: startDate.toISOString(),
                status: 'inProgress',
                startLocation: { lat: 51.5, lon: -0.14 },
                lastLocation: { lat: 51.6, lon: -0.15 },
                lastReadingDate: reading2Date.toISOString(),
                lastSignificantReadingDate: reading2Date.toISOString(),
                distance: 11157.441621057978,
            });

            // Updates position again
            const { journey: inProgressJourney2 } = await jsClient.postLocation({
                userId,
                lat: 51.75,
                lon: -0.165,
                created_at: reading3Date.toISOString(),
                velocity: 10,
            });

            expect(inProgressJourney2).toMatchObject({
                id: journey.id,
                userId,
                startTime: startDate.toISOString(),
                status: 'inProgress',
                startLocation: { lat: 51.5, lon: -0.14 },
                lastLocation: { lat: 51.75, lon: -0.165 },
                lastReadingDate: reading3Date.toISOString(),
                lastSignificantReadingDate: reading3Date.toISOString(),
                distance: 27888.060536859804,
            });

            // Ends journey
            const { journey: completedJourney } = await jsClient.postLocation({
                userId,
                lat: 51.7,
                lon: -0.16,
                created_at: reading4Date.toISOString(),
                velocity: 0,
            });

            expect(completedJourney).toMatchObject({
                id: journey.id,
                userId,
                startTime: startDate.toISOString(),
                status: 'completed',
                startLocation: { lat: 51.5, lon: -0.14 },
                lastLocation: { lat: 51.75, lon: -0.165 },
                distance: 27888.060536859804,
                endTime: reading4Date.toISOString(),
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
});
