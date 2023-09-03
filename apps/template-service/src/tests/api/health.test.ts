// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-undef */
import request from 'supertest';
import type { App } from '../utils';
import { getApp } from '../utils';

describe('Health', () => {
    let app: App;

    beforeAll(() => {
        app = getApp();
    });

    it('/api/health (GET) - responds with ok', async () => {
        await request(app.express).get('/api/health').expect(200).expect('ok');
    });
});
