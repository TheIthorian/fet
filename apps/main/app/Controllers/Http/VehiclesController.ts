import { schema } from '@ioc:Adonis/Core/Validator';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Vehicle from 'App/Models/Vehicle';

export default class VehiclesController {
    public async index({ response, auth }: HttpContextContract) {
        const user = await auth.use('api').authenticate();

        const vehicles = await Vehicle.query()
            .select('*')
            .where('userId', user.id)
            .orderBy('createdAt');

        response.json(vehicles);
    }

    public async store({ request, response, auth }: HttpContextContract) {
        const user = await auth.use('api').authenticate();

        const vehicleSchema = schema.create({
            vin: schema.string.optional({ trim: true }),
            regNo: schema.string({ trim: true }),
            make: schema.string({ trim: true }),
            model: schema.string({ trim: true }),
            fuelType: schema.string({ trim: true }),
        });

        const data = await request.validate({ schema: vehicleSchema });

        const vehicle = await Vehicle.create({
            vin: data.vin,
            regNo: data.regNo,
            make: data.make,
            model: data.model,
            fuelType: data.fuelType,
            userId: user.id,
        });

        response.json(vehicle);
    }
}
