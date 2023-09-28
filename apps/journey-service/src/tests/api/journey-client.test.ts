import { faker } from '@faker-js/faker';
import { makeClient } from 'fet-journey-service-client';
import config from '../../config';
import type { App } from '../utils';
import { getApp } from '../utils';

const apiKey = config.apiKey;
const jsClient = makeClient(`http://${config.host}:${config.port}`, apiKey);

describe('JourneyServiceClient', () => {
    const userId = faker.number.int();
    const carId = faker.number.int();
    let app: App;

    beforeAll(async () => {
        app = await getApp();
    });

    afterAll(async () => {
        await app.shutdown();
    });

    describe('happy path', () => {
        it('should create a journey, update its location, and end it', async () => {
            const { journey } = await jsClient.create({ userId });
            const journeyId = journey.id;

            expect(journey).toMatchObject({
                id: expect.any(String) as string,
                startTime: expect.any(String) as string,
                userId,
            });

            const { distance: newDistance } = await jsClient.updateDistance({
                userId,
                journeyId,
                coordinates: {
                    lat: 51.50134811258048,
                    long: -0.14189287996502006,
                },
            });
            expect(newDistance).toEqual(0);

            const { distance: updatedDistance } = await jsClient.updateDistance({
                userId,
                journeyId,
                coordinates: {
                    lat: 51.50072027335213,
                    long: -0.12463557010122289,
                },
            });
            expect(updatedDistance).toEqual(1196.570281356086);

            const { journey: finalJourney } = await jsClient.endJourney({
                userId,
                journeyId,
                carId,
            });
            expect(finalJourney).toMatchObject({
                id: journey.id,
                startTime: journey.startTime,
                userId,
                endTime: expect.any(String) as string,
                carId,
            });
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(new Date(finalJourney.endTime!).getTime()).toBeGreaterThan(
                new Date(finalJourney.startTime).getTime()
            );
        });
    });
});
