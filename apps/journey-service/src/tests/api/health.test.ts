import type { SuperAgentTest } from 'supertest';
import { agent } from 'supertest';
import type { App } from '../utils';
import { getApp } from '../utils';

describe('Health', () => {
    let app: App;
    let stAgent: SuperAgentTest;

    beforeAll(async () => {
        app = await getApp();
        stAgent = agent(app.server);
    });

    afterAll(async () => {
        await app.shutdown();
    });

    it('/api/health (GET) - responds with ok', async () => {
        await stAgent.get('/api/health').expect(200).expect('ok');
    });
});
