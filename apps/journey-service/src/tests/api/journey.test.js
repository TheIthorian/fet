import { faker } from '@faker-js/faker';
import request from 'supertest';
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

    describe('/api/journey (POST)', () => {
        it('returns 401 error when invalid api key is provided', async () => {
            await request(app.express)
                .post('/api/journey')
                .send({ userId })
                .set('api', ':(')
                .expect(401)
                .expect({ message: 'Invalid api key', name: 'ApiKeyAuthenticationError' });
        });

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
        let journeyId;

        beforeAll(async () => {
            const journey = await journeyApi.create(userId);
            journeyId = journey.id;
        });

        it('returns 401 error when invalid api key is provided', async () => {
            await request(app.express)
                .get(`/api/journey/${journeyId}`)
                .set('api', ':(')
                .expect(401)
                .expect({ message: 'Invalid api key', name: 'ApiKeyAuthenticationError' });
        });

        it('starts a new journey', async () => {
            await database.put({
                userId,
                distance: 0,
                startTime: new Date(),
            });
            const res = await request(app.express)
                .get(`/api/journey/${journeyId}?userId=${userId}`)
                .set({ api: apiKey })
                .expect(200);

            const { journey } = res.body;

            expect(journey).toMatchObject({ distance: 0, userId });
            expect(new Date(journey.startTime)).toBeInstanceOf(Date);
        });
    });
});
