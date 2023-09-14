import { faker } from '@faker-js/faker';
import { agent } from 'supertest';
import { ulid } from 'ulid';
import config from '../../config';
import { getApp } from '../utils';
import { database, journeyApi } from '../../api/journey/routes';

const apiKey = `apikey ${config.apiKey}`;

describe('Journey', () => {
    let app;
    const userId = faker.number.int();
    let stAgent;

    beforeAll(async () => {
        app = await getApp();
        stAgent = agent(app.server);
    });

    afterAll(async () => {
        await app.shutdown();
    });

    describe('resource', () => {
        const journey = ulid();

        it('should return 401 error when invalid api key is provided for [post] requests', async () => {
            for (const { url } of [
                { url: `/api/users/${userId}/journey/${journey.id}` },
                { url: `/api/users/${userId}/journey` },
                { url: `/api/users/${userId}/journey/${journey.id}/position` },
                { url: `/api/users/${userId}/journey/${journey.id}/end` },
            ]) {
                // eslint-disable-next-line no-await-in-loop
                await stAgent
                    .post(url)
                    .set({ Authorization: 'apikey :(' })
                    .expect(401)
                    .expect({ message: 'Invalid api key', name: 'ApiKeyAuthenticationError' });
            }

            await Promise.resolve();
        });

        it('should return 401 error when invalid api key is provided for [get] requests', async () => {
            for (const { url } of [{ url: `/api/users/${userId}/journey/${journey.id}` }]) {
                // eslint-disable-next-line no-await-in-loop
                await stAgent
                    .get(url)
                    .set({ Authorisation: 'apikey :(' })
                    .expect(401)
                    .expect({ message: 'Invalid api key', name: 'ApiKeyAuthenticationError' });
            }

            await Promise.resolve();
        });
    });

    describe('/api/users/:userId/journey (POST)', () => {
        it('starts a new journey', async () => {
            const res = await stAgent
                .post(`/api/users/${userId}/journey`)
                .send()
                .set({ Authorization: apiKey })
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
            ({ journey } = await journeyApi.create({ userId }));
        });

        it('returns 404 error when no journey is found', async () => {
            const invalidId = ulid();
            const res = await stAgent
                .get(`/api/users/${userId}/journey/${invalidId}`)
                .set({ Authorization: apiKey })
                .expect(404);

            expect(res.body).toStrictEqual({
                message: `Journey with id ${invalidId} not found`,
                name: 'ResourceNotFoundError',
            });
        });

        it('returns the journey details', async () => {
            ({ journey } = await journeyApi.create({ userId }));

            await database.put(journey.id, {
                ...journey,
                distance: 123,
            });

            const res = await stAgent
                .get(`/api/users/${userId}/journey/${journey.id}`)
                .set({ Authorization: apiKey })
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
            ({ journey } = await journeyApi.create({ userId }));
        });

        it('updates the journey distance when new coordinates are provided', async () => {
            const res = await stAgent
                .post(`/api/users/${userId}/journey/${journey.id}/position`)
                .send({ coordinates: { lat: 51.50134811258048, long: -0.14189287996502006 } })
                .set({ Authorization: apiKey })
                .expect(200);

            const distance = res.body.distance;
            expect(distance).toBe(1);

            const res2 = await stAgent
                .post(`/api/users/${userId}/journey/${journey.id}/position`)
                .send({ coordinates: { lat: 51.50072031422008, long: -0.1246355475257489 } })
                .set({ Authorization: apiKey })
                .expect(200);

            const distance2 = res2.body.distance;
            expect(distance2).toBe(2);
        });

        it('returns 404 error when the journey is not found', async () => {
            const invalidId = ulid();
            await stAgent
                .post(`/api/users/${userId}/journey/${invalidId}/position`)
                .send({ coordinates: { lat: 51.50134811258048, long: -0.14189287996502006 } })
                .set({ Authorization: apiKey })
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
            ({ journey } = await journeyApi.create({ userId }));
        });

        it('ends the journey', async () => {
            const res = await stAgent
                .post(`/api/users/${userId}/journey/${journey.id}/end`)
                .send({ carId })
                .set({ Authorization: apiKey })
                .expect(200);

            const { journey: result } = res.body;

            expect(result).toMatchObject({ distance: 0, userId, carId });
            expect(new Date(result.startTime)).toBeInstanceOf(Date);
            expect(new Date(result.endTime)).toBeInstanceOf(Date);
            expect(result.id).toEqual(expect.any(String));
        });

        it('returns 404 error when the journey is not found', async () => {
            const invalidId = ulid();
            await stAgent
                .post(`/api/users/${userId}/journey/${invalidId}/end`)
                .send({ carId })
                .set({ Authorization: apiKey })
                .expect(404)
                .expect({
                    message: `Journey with id ${invalidId} not found`,
                    name: 'ResourceNotFoundError',
                });
        });
    });
});
