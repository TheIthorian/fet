import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../app.module';

async function registerAndLogin(app: NestFastifyApplication): Promise<string> {
    const email = `integrations-${Date.now()}@example.com`;
    await app.inject({
        method: 'POST',
        url: '/register',
        payload: { email, password: 'secret1234' },
    });
    const res = await app.inject({
        method: 'POST',
        url: '/login',
        payload: { email, password: 'secret1234' },
    });
    return res.json<{ token: string }>().token;
}

describe('Integrations', () => {
    let app: NestFastifyApplication;
    let token: string;

    beforeAll(async () => {
        const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
        app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
        app.useGlobalPipes(
            new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
        );
        await app.init();
        await app.getHttpAdapter().getInstance().ready();
        token = await registerAndLogin(app);
    });

    afterAll(() => app.close());

    it('POST /api/me/integrations/:name generates an API key', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/me/integrations/autopi',
            headers: { authorization: `Bearer ${token}` },
        });

        expect(res.statusCode).toBe(201);
        const body = res.json<{ name: string; apiKey: string; webhookUrl: string }>();
        expect(body.name).toBe('autopi');
        expect(body.apiKey).toHaveLength(64);
        expect(body.webhookUrl).toContain('autopi');
    });

    it('GET /api/me/integrations returns the generated integration', async () => {
        await app.inject({
            method: 'POST',
            url: '/api/me/integrations/traccar',
            headers: { authorization: `Bearer ${token}` },
        });

        const res = await app.inject({
            method: 'GET',
            url: '/api/me/integrations',
            headers: { authorization: `Bearer ${token}` },
        });

        expect(res.statusCode).toBe(200);
        const integrations = res.json<Array<{ name: string }>>();
        expect(integrations.some((i) => i.name === 'traccar')).toBe(true);
    });
});
