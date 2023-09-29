import { test } from '@japa/runner';
import Database from '@ioc:Adonis/Lucid/Database';
import User from 'App/Models/User';
import Vehicle from 'App/Models/Vehicle';
import VehicleFactory from 'Database/factories/VehicleFactory';
import UserFactory from 'Database/factories/UserFactory';

test.group('GET /api/me/config', (group) => {
    let user: User;

    group.each.setup(async () => {
        await Database.beginGlobalTransaction();
        return () => Database.rollbackGlobalTransaction();
    });

    group.each.setup(async () => {
        user = await User.create(await UserFactory.merge({ email: 'test@user.spec.ts.login' }).create());
    });

    test('responds with auth error when no token is provided', async ({ client }) => {
        const response = await client.get('/api/me/config');

        response.assertStatus(401);
        response.assertBodyContains({
            errors: [{ message: 'E_UNAUTHORIZED_ACCESS: Unauthorized access' }],
        });
    });

    test('gets the current user config', async ({ client }) => {
        // Create some vehicles for the user
        const vehicleCount = 4;
        await Vehicle.createMany(await VehicleFactory.merge({ userId: user.id }).makeMany(vehicleCount));

        const response = await client.get('/api/me/config').guard('api').loginAs(user);

        response.assertStatus(200);
        response.assertBodyContains({
            userId: user.id,
            isSetupRequired: true,
            vehicleCount,
            email: user.email,
            displayName: user.email,
            userConfig: {
                isGeolocationEnabled: false,
            },
        });
    });
});
