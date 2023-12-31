import { schema } from '@ioc:Adonis/Core/Validator';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Vehicle from 'App/Models/Vehicle';
import Database from '@ioc:Adonis/Lucid/Database';
import VehicleAlreadyExistException from 'App/Exceptions/VehicleAlreadyExistException';

export default class VehiclesController {
    public async index({ response, auth }: HttpContextContract) {
        const user = await auth.use('api').authenticate();

        const vehicles = await Vehicle.query().select('*').where('user_id', user.id).orderBy('created_at');

        response.json(vehicles);
    }

    public async store({ request, response, auth }: HttpContextContract) {
        const user = await auth.use('api').authenticate();

        const vehicleSchema = schema.create({
            vin: schema.string.optional({ trim: true }),
            reg_no: schema.string({ trim: true }),
            make: schema.string({ trim: true }),
            model: schema.string({ trim: true }),
            fuel_type: schema.string({ trim: true }),
        });

        const data = await request.validate({ schema: vehicleSchema });
        const regNo = data.reg_no.toUpperCase().replace(/[^a-zA-Z0-9]/g, '');

        const [existingVehicles] = await Database.from('vehicles')
            .count('*', 'total')
            .where('user_id', user.id)
            .andWhere('reg_no', regNo);

        if (existingVehicles.total > 0) {
            throw VehicleAlreadyExistException.new(regNo);
        }

        const vehicle = await Vehicle.create({
            vin: data.vin,
            regNo: regNo,
            make: data.make,
            model: data.model,
            fuelType: data.fuel_type,
            userId: user.id,
        });

        response.json(vehicle);
    }
}
