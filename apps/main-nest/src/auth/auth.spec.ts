import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../app.module';

describe('Auth', () => {
    let app: NestFastifyApplication;
    const email = `auth-${Date.now()}@example.com`;
    const password = 'secret1234';

    beforeAll(async () => {
        const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
        app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
        app.useGlobalPipes(
            new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
        );
        await app.init();
        await app.getHttpAdapter().getInstance().ready();
    });

    afterAll(() => app.close());

    it('POST /register creates a user and returns a token', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/register',
            payload: { email, password },
        });

        expect(res.statusCode).toBe(201);
        const body = res.json<{ token: string; user: { email: string } }>();
        expect(body.token).toBeDefined();
        expect(body.user.email).toBe(email);
    });

    it('POST /login returns a token for valid credentials', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/login',
            payload: { email, password },
        });

        expect(res.statusCode).toBe(201);
        expect(res.json<{ token: string }>().token).toBeDefined();
    });

    it('GET /api/me returns the authenticated user', async () => {
        const { token } = (
            await app.inject({ method: 'POST', url: '/login', payload: { email, password } })
        ).json<{
            token: string;
        }>();

        const res = await app.inject({
            method: 'GET',
            url: '/api/me',
            headers: { authorization: `Bearer ${token}` },
        });

        expect(res.statusCode).toBe(200);
        expect(res.json<{ data: { email: string } }>().data.email).toBe(email);
    });
});
