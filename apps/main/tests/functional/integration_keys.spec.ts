import { test } from '@japa/runner';
import Database from '@ioc:Adonis/Lucid/Database';
import User from 'App/Models/User';
import UserFactory from 'Database/factories/UserFactory';
import { IntegrationApiKeyService } from 'App/service/integrationKey';
import Integration from 'App/Models/Integration';

test.group('api/me/integrations', (group) => {
    let user: User;

    group.each.setup(async () => {
        await Database.beginGlobalTransaction();
        return () => Database.rollbackGlobalTransaction();
    });

    group.each.setup(async () => {
        user = await User.create(
            await UserFactory.merge({ email: 'integration_keys.spec@test.com' }).create()
        );
    });

    test('GET api/me/integrations responds with auth error when no token is provided', async ({
        client,
    }) => {
        const response = await client.get('api/me/integrations');

        response.assertStatus(401);
        response.assertBodyContains({
            errors: [{ message: 'E_UNAUTHORIZED_ACCESS: Unauthorized access' }],
        });
    });

    test('GET api/me/integrations responds with all integrations', async ({ client }) => {
        const response = await client.get(`api/me/integrations`).guard('api').loginAs(user);

        response.assertBody([
            {
                name: 'owntracks',
                api_key: null,
                created_at: null,
                updated_at: null,
            },
        ]);
    });

    test('GET api/me/integrations responds with all integrations with populated api key', async ({
        client,
    }) => {
        const integration = await Integration.findBy('name', 'owntracks');
        if (!integration) throw new Error('owntracks integration not found!');

        const { apiKey } = await new IntegrationApiKeyService().generateApiKeyForUser({
            userId: user.id,
            integrationId: integration.id,
        });
        const response = await client.get(`api/me/integrations`).guard('api').loginAs(user);

        response.assertBodyContains([
            {
                name: 'owntracks',
                api_key: apiKey,
                created_at: Date,
                updated_at: Date,
            },
        ]);
    });

    test('POST api/me/integrations/:integrationName responds with auth error when no token is provided', async ({
        client,
    }) => {
        const response = await client.post('api/me/integrations/owntracks');

        response.assertStatus(401);
        response.assertBodyContains({
            errors: [{ message: 'E_UNAUTHORIZED_ACCESS: Unauthorized access' }],
        });
    });

    test('POST api/me/integrations/:integrationName creates an api key for the given integration', async ({
        client,
    }) => {
        const response = await client
            .post('api/me/integrations/owntracks')
            .guard('api')
            .loginAs(user);

        response.assertStatus(201);
        response.assertBodyContains({
            name: 'owntracks',
            api_key: String,
            created_at: String,
            updated_at: String,
        });
    });

    test('POST api/me/integrations/:integrationName responds with error when the given integration is invalid', async ({
        client,
    }) => {
        const response = await client
            .post('api/me/integrations/invalid_integration')
            .guard('api')
            .loginAs(user);

        response.assertStatus(400);
        response.assertBodyContains({
            message: "E_UNKNOWN_INTEGRATION: 'invalid_integration' is not a valid integration",
            code: 'E_UNKNOWN_INTEGRATION',
        });
    });
});
