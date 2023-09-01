import { test } from '@japa/runner';
import Database from '@ioc:Adonis/Lucid/Database';
import User from 'App/Models/User';
import UserFactory from 'Database/factories/UserFactory';
import { faker } from '@faker-js/faker';

test.group('api/vehicles', (group) => {
    let user: User;

    let vehicle: Record<string, string>;

    group.each.setup(async () => {
        await Database.beginGlobalTransaction();
        return () => Database.rollbackGlobalTransaction();
    });

    group.each.setup(async () => {
        user = await User.create(
            await UserFactory.merge({ email: 'vehicle.odometer.spec@test.com' }).create()
        );

        vehicle = {
            vin: faker.vehicle.vin(),
            reg_no: faker.string.alphanumeric({ length: 8 }),
            make: faker.vehicle.manufacturer(),
            model: faker.vehicle.model(),
            fuel_type: 'petrol',
        };
    });

    test('POST api/vehicle responds with auth error when no token is provided', async ({
        client,
    }) => {
        const response = await client.post('/api/vehicles').json(vehicle);

        response.assertBodyContains({
            errors: [{ message: 'E_UNAUTHORIZED_ACCESS: Unauthorized access' }],
        });
    });

    test('POST api/vehicle creates a vehicle', async ({ client }) => {
        const response = await client
            .post('/api/vehicles')
            .guard('api')
            .loginAs(user)
            .json(vehicle);

        response.assertBodyContains({
            id: Number,
            user_id: user.id,
            vin: vehicle.vin,
            reg_no: vehicle.reg_no.toUpperCase(),
            make: vehicle.make,
            model: vehicle.model,
            fuel_type: vehicle.fuel_type,
            created_at: Date,
            updated_at: Date,
        });
    });

    test('POST api/vehicle does not create a duplicate', async ({ client }) => {
        await client.post('/api/vehicles').guard('api').loginAs(user).json(vehicle);

        const response = await client
            .post('/api/vehicles')
            .guard('api')
            .loginAs(user)
            .json(vehicle);

        response.assertBodyContains({
            message: `E_VEHICLE_EXISTS: A vehicle with registration number ${vehicle.reg_no.toUpperCase()} has already been added`,
        });
    });

    test('POST api/vehicle removes non-alphanumeric characters', async ({ client }) => {
        vehicle.reg_no = 'ABC @ 123';

        const response = await client
            .post('/api/vehicles')
            .guard('api')
            .loginAs(user)
            .json(vehicle);

        response.assertBodyContains({ user_id: user.id, reg_no: 'ABC123' });
    });
});
