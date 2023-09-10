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
                { url: `/api/journey/${journey.id}` },
                { url: `/api/journey` },
                { url: `/api/journey/${journey.id}/position` },
                { url: `/api/journey/${journey.id}/end` },
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
            const promises = [{ url: `/api/journey/${journey.id}` }].map(async ({ url }) => {
                await request(app.express)
                    .get(url)
                    .set('api', ':(')
                    .expect(401)
                    .expect({ message: 'Invalid api key', name: 'ApiKeyAuthenticationError' });
            });

            await Promise.all(promises);
        });
    });

    describe('/api/journey (POST)', () => {
        it('starts a new journey', async () => {
            const res = await request(app.express)
                .post('/api/journey')
                .send({ userId })
                .set({ api: apiKey })
                .expect(200);

            const { journey } = res.body;

            expect(journey).toMatchObject({ distance: 0, userId });
            expect(new Date(journey.startTime)).toBeInstanceOf(Date);
            expect(journey.id).toEqual(expect.any(String));
        });
    });

    describe('/api/journey/:id (GET)', () => {
        let journey;

        beforeAll(async () => {
            journey = await journeyApi.create(userId);
        });

        it('returns 404 error when no journey is found', async () => {
            const invalidId = ulid();
            const res = await request(app.express)
                .get(`/api/journey/${invalidId}?userId=${userId}`)
                .set({ api: apiKey })
                .expect(404);

            expect(res.body).toStrictEqual({
                message: `Journey with id ${invalidId} not found`,
                name: 'ResourceNotFoundError',
            });
        });

        it('returns the journey details', async () => {
            await database.put(journey.id, {
                ...journey,
                distance: 123,
            });

            const res = await request(app.express)
                .get(`/api/journey/${journey.id}?userId=${userId}`)
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

    describe('/api/journey/:id/position (POST)', () => {
        let journey;

        beforeAll(async () => {
            journey = await journeyApi.create(userId);
        });

        it('updates the journey distance', async () => {});
        it('updates the journey distance', async () => {});
    });
});
