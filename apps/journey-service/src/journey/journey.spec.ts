import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../app.module';

const INTERNAL_KEY = process.env.INTERNAL_KEY ?? 'test-internal-key';

describe('JourneyController', () => {
    let app: NestFastifyApplication;
    const userId = `test-user-${Date.now()}`;
    const t0 = new Date('2024-06-01T09:00:00.000Z');

    beforeAll(async () => {
        const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
        app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        await app.init();
        await app.getHttpAdapter().getInstance().ready();
    });

    afterAll(() => app.close());

    it('returns empty when first ping has insufficient velocity', async () => {
        const otherId = `${userId}-slow`;
        const res = await app.inject({
            method: 'POST',
            url: `/api/users/${otherId}/location`,
            headers: { 'x-api-key': INTERNAL_KEY },
            payload: { lat: 51.5074, lon: -0.1278, velocity: 2, created_at: t0.toISOString() },
        });

        expect(res.statusCode).toBe(200);
        expect(res.json()).toEqual({});
    });

    it('starts a journey when velocity exceeds threshold', async () => {
        const res = await app.inject({
            method: 'POST',
            url: `/api/users/${userId}/location`,
            headers: { 'x-api-key': INTERNAL_KEY },
            payload: { lat: 51.5074, lon: -0.1278, velocity: 10, created_at: t0.toISOString() },
        });

        expect(res.statusCode).toBe(200);
        const body = res.json<{ journey: { status: string; userId: string } }>();
        expect(body.journey.status).toBe('new');
        expect(body.journey.userId).toBe(userId);
    });

    it('advances the journey to inProgress on the next ping', async () => {
        const t1 = new Date(t0.getTime() + 10_000);
        const res = await app.inject({
            method: 'POST',
            url: `/api/users/${userId}/location`,
            headers: { 'x-api-key': INTERNAL_KEY },
            payload: { lat: 51.508, lon: -0.128, velocity: 10, created_at: t1.toISOString() },
        });

        expect(res.statusCode).toBe(200);
        expect(res.json<{ journey: { status: string } }>().journey.status).toBe('inProgress');
    });

    it('completes the journey when stationary for over a minute', async () => {
        const t2 = new Date(t0.getTime() + 90_000);
        const res = await app.inject({
            method: 'POST',
            url: `/api/users/${userId}/location`,
            headers: { 'x-api-key': INTERNAL_KEY },
            payload: { lat: 51.508, lon: -0.128, velocity: 0.5, created_at: t2.toISOString() },
        });

        expect(res.statusCode).toBe(200);
        const body = res.json<{ journey: { status: string; distance: number } }>();
        expect(body.journey.status).toBe('completed');
        expect(body.journey.distance).toBeGreaterThan(0);
    });
});
