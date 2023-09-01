import Vehicle from 'App/Models/Vehicle';
import Factory from '@ioc:Adonis/Lucid/Factory';

export default Factory.define(Vehicle, ({ faker }) => {
    return {
        userId: faker.number.int(),
        vin: faker.vehicle.vin(),
        regNo: faker.string.alphanumeric({ length: 8 }),
        make: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
        fuelType: 'petrol',
    };
}).build();
