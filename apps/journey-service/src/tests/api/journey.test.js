import { faker } from '@faker-js/faker';
import request from 'supertest';
import { ulid } from 'ulid';
import config from '../../config';
import { getApp } from '../utils';
import { database, journeyApi } from '../../api/journey/routes';

const apiKey = config.apiKey;

describe('Journey', () => {
    let app;
    const userId = faker.number.int();

    beforeAll(() => {
        app = getApp();
    });

    describe('resource', () => {
        const journey = ulid();

        it('should return 401 error when invalid api key is provided for [post] requests', async () => {
            const promises = [
                { url: `/api/users/${userId}/journey/${journey.id}` },
                { url: `/api/users/${userId}/journey` },
                { url: `/api/users/${userId}/journey/${journey.id}/position` },
                { url: `/api/users/${userId}/journey/${journey.id}/end` },
            ].map(async ({ url }) => {
                await request(app.express)
                    .post(url)
                    .set('api', ':(')
                    .expect(401)
                    .expect({ message: 'Invalid api key', name: 'ApiKeyAuthenticationError' });
            });

            await Promise.all(promises);
        });

        it('should return 401 error when invalid api key is provided for [get] requests', async () => {
            const promises = [{ url: `/api/users/${userId}/journey/${journey.id}` }].map(
                async ({ url }) => {
                    await request(app.express)
                        .get(url)
                        .set('api', ':(')
                        .expect(401)
                        .expect({ message: 'Invalid api key', name: 'ApiKeyAuthenticationError' });
                }
            );

            await Promise.all(promises);
        });
    });

    describe('/api/users/:userId/journey (POST)', () => {
        it('starts a new journey', async () => {
            const res = await request(app.express)
                .post(`/api/users/${userId}/journey`)
                .send()
                .set({ api: apiKey })
                .expect(200);

            const { journey: result } = res.body;

            expect(result).toMatchObject({ distance: 0, userId });
            expect(new Date(result.startTime)).toBeInstanceOf(Date);
            expect(result.id).toEqual(expect.any(String));
        });
    });

    describe('/api/users/:userId/journey/:journeyId (GET)', () => {
        let journey;

        beforeEach(async () => {
            journey = await journeyApi.create({ userId });
        });

        it('returns 404 error when no journey is found', async () => {
            const invalidId = ulid();
            const res = await request(app.express)
                .get(`/api/users/${userId}/journey/${invalidId}`)
                .set({ api: apiKey })
                .expect(404);

            expect(res.body).toStrictEqual({
                message: `Journey with id ${invalidId} not found`,
                name: 'ResourceNotFoundError',
            });
        });

        it('returns the journey details', async () => {
            journey = await journeyApi.create({ userId });

            await database.put(journey.id, {
                ...journey,
                distance: 123,
            });

            const res = await request(app.express)
                .get(`/api/users/${userId}/journey/${journey.id}`)
                .set({ api: apiKey })
                .expect(200);

            const { journey: result } = res.body;

            expect(result).toStrictEqual({
                id: journey.id,
                distance: 123,
                userId,
                startTime: journey.startTime.toISOString(),
            });
        });
    });

    describe('/api/users/:userId/journey/:journeyId/position (POST)', () => {
        let journey;

        beforeEach(async () => {
            journey = await journeyApi.create({ userId });
        });

        it('updates the journey distance when new coordinates are provided', async () => {
            const res = await request(app.express)
                .post(`/api/users/${userId}/journey/${journey.id}/position`)
                .send({ coordinates: { lat: 51.50134811258048, long: -0.14189287996502006 } })
                .set({ api: apiKey })
                .expect(200);

            const { journey: result } = res.body;

            expect(result).toMatchObject({ distance: 1 });

            const res2 = await request(app.express)
                .post(`/api/users/${userId}/journey/${journey.id}/position`)
                .send({ coordinates: { lat: 51.50072031422008, long: -0.1246355475257489 } })
                .set({ api: apiKey })
                .expect(200);

            const { journey: result2 } = res2.body;

            expect(result2).toMatchObject({ distance: 2 }); // TODO - should be 1_197m
        });

        it('returns 404 error when the journey is not found', async () => {
            const invalidId = ulid();
            await request(app.express)
                .post(`/api/users/${userId}/journey/${invalidId}/position`)
                .send({ coordinates: { lat: 51.50134811258048, long: -0.14189287996502006 } })
                .set({ api: apiKey })
                .expect(404)
                .expect({
                    message: `Journey with id ${invalidId} not found`,
                    name: 'ResourceNotFoundError',
                });
        });
    });

    describe('/api/users/:userId/journey/:journeyId/end (POST)', () => {
        let journey;
        const carId = 123;

        beforeEach(async () => {
            journey = await journeyApi.create({ userId });
        });

        it('ends the journey', async () => {
            const res = await request(app.express)
                .post(`/api/users/${userId}/journey/${journey.id}/end`)
                .send({ carId })
                .set({ api: apiKey })
                .expect(200);

            const { journey: result } = res.body;

            expect(result).toMatchObject({ distance: 0, userId, carId });
            expect(new Date(result.startTime)).toBeInstanceOf(Date);
            expect(new Date(result.endTime)).toBeInstanceOf(Date);
            expect(result.id).toEqual(expect.any(String));
        });

        it('returns 404 error when the journey is not found', async () => {
            const invalidId = ulid();
            await request(app.express)
                .post(`/api/users/${userId}/journey/${invalidId}/end`)
                .send({ carId })
                .set({ api: apiKey })
                .expect(404)
                .expect({
                    message: `Journey with id ${invalidId} not found`,
                    name: 'ResourceNotFoundError',
                });
        });
    });
});
