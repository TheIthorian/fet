import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../app.module';

async function registerAndLogin(app: NestFastifyApplication): Promise<string> {
    const email = `vehicles-${Date.now()}@example.com`;
    await app.inject({ method: 'POST', url: '/register', payload: { email, password: 'secret1234' } });
    const res = await app.inject({ method: 'POST', url: '/login', payload: { email, password: 'secret1234' } });
    return res.json<{ token: string }>().token;
}

describe('Vehicles', () => {
    let app: NestFastifyApplication;
    let token: string;

    beforeAll(async () => {
        const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
        app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
        await app.init();
        await app.getHttpAdapter().getInstance().ready();
        token = await registerAndLogin(app);
    });

    afterAll(() => app.close());

    it('POST /api/vehicles creates a vehicle', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/vehicles',
            headers: { authorization: `Bearer ${token}` },
            payload: { regNo: `AB${Date.now()}`, make: 'Ford', model: 'Focus', fuelType: 'petrol' },
        });

        expect(res.statusCode).toBe(201);
        const body = res.json<{ make: string; regNo: string }>();
        expect(body.make).toBe('Ford');
    });

    it('GET /api/vehicles returns a list including the created vehicle', async () => {
        const regNo = `CD${Date.now()}`;

        await app.inject({
            method: 'POST',
            url: '/api/vehicles',
            headers: { authorization: `Bearer ${token}` },
            payload: { regNo, make: 'Toyota', model: 'Yaris', fuelType: 'hybrid' },
        });

        const res = await app.inject({
            method: 'GET',
            url: '/api/vehicles',
            headers: { authorization: `Bearer ${token}` },
        });

        expect(res.statusCode).toBe(200);
        const vehicles = res.json<Array<{ regNo: string }>>();
        expect(vehicles.some((v) => v.regNo === regNo)).toBe(true);
    });
});
