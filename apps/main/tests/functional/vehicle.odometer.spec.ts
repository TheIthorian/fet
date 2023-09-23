import { test } from '@japa/runner';
import Database from '@ioc:Adonis/Lucid/Database';
import User from 'App/Models/User';
import UserFactory from 'Database/factories/UserFactory';
import Vehicle from 'App/Models/Vehicle';
import VehicleFactory from 'Database/factories/VehicleFactory';

test.group('api/vehicles/odometer', (group) => {
    let user: User;
    let vehicle: Vehicle;

    group.each.setup(async () => {
        await Database.beginGlobalTransaction();
        return () => Database.rollbackGlobalTransaction();
    });

    group.each.setup(async () => {
        user = await User.create(
            await UserFactory.merge({ email: 'vehicle.odometer.spec@test.com' }).create()
        );

        vehicle = await Vehicle.create(await VehicleFactory.merge({ userId: user.id }).create());
    });

    test('POST api/vehicles/:vehicleId/odometer responds with auth error when no token is provided', async ({
        client,
    }) => {
        const response = await client.post(`/api/vehicles/${vehicle.id}/odometer`).json({
            value: 100,
        });

        response.assertStatus(401);
        response.assertBodyContains({
            errors: [{ message: 'E_UNAUTHORIZED_ACCESS: Unauthorized access' }],
        });
    });

    test('POST api/vehicles/:vehicleId/odometer creates a new reading', async ({ client }) => {
        const response = await client
            .post(`/api/vehicles/${vehicle.id}/odometer`)
            .json({ value: 100 })
            .guard('api')
            .loginAs(user);

        response.assertBodyContains({
            id: Number,
            user_id: user.id,
            vehicle_id: String(vehicle.id), // Why?????
            value: 100,
            reading_date: Date,
            created_at: Date,
            updated_at: Date,
        });
    });
});
