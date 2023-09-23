import { faker } from '@faker-js/faker';
import { test } from '@japa/runner';
import Database from '@ioc:Adonis/Lucid/Database';
import User from 'App/Models/User';
import UserFactory from 'Database/factories/UserFactory';
import { IntegrationApiKeyService } from 'App/service/integrationKey';
import Integration from 'App/Models/Integration';

test.group('api/location/:integrationName', (group) => {
    let user: User;
    let apiKey: string;
    const lon = faker.number.float({ min: -180, max: 180 });
    const lat = faker.number.float({ min: -90, max: 90 });

    group.each.setup(async () => {
        await Database.beginGlobalTransaction();
        return () => Database.rollbackGlobalTransaction();
    });

    group.each.setup(async () => {
        user = await User.create(
            await UserFactory.merge({ email: 'location.spec@test.com' }).create()
        );

        const integration = await Integration.findBy('name', 'owntracks');
        if (!integration) throw new Error('owntracks integration not found!');

        ({ apiKey } = await new IntegrationApiKeyService().generateApiKeyForUser({
            userId: user.id,
            integrationId: integration.id,
        }));
    });

    test('POST api/location/:integrationName responds location and user', async ({ client }) => {
        const response = await client
            .post(`api/location/owntracks?apiKey=${apiKey}`)
            .json({ lon, lat });

        response.assertBodyContains({
            userId: user.id,
            lon,
            lat,
        });
    });

    test('POST api/location/:integrationName responds with error when integration name is invalid', async ({
        client,
    }) => {
        const response = await client
            .post(`api/location/invalid_integration?apiKey=${apiKey}`)
            .json({ lon, lat });

        response.assertStatus(400);
        response.assertBodyContains({
            message: "E_UNKNOWN_INTEGRATION: 'invalid_integration' is not a valid integration",
            code: 'E_UNKNOWN_INTEGRATION',
        });
    });

    test('POST api/location/:integrationName responds with error when the api key provided is invalid', async ({
        client,
    }) => {
        const response = await client
            .post(`api/location/owntracks?apiKey=invalid`)
            .json({ lon, lat });

        response.assertStatus(401);
        response.assertBodyContains({
            message:
                'E_API_KEY_NOT_RECOGNISED: The api key provided for owntracks is not recognised',
            code: 'E_API_KEY_NOT_RECOGNISED',
        });
    });

    test('POST api/location/:integrationName responds with error when the request body is invalid', async ({
        client,
    }) => {
        const response = await client
            .post(`api/location/owntracks?apiKey=${apiKey}`)
            .json({ long: lon, lat });

        response.assertStatus(422);
        response.assertBodyContains({
            errors: [{ rule: 'required', field: 'lon', message: 'required validation failed' }],
        });
    });
});
