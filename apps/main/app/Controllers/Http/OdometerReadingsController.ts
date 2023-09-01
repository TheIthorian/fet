import { schema } from '@ioc:Adonis/Core/Validator';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import OdometerReading from 'App/Models/OdometerReading';
import { DateTime } from 'luxon';
import Vehicle from 'App/Models/Vehicle';
import VehicleNotFound from 'App/Exceptions/NoVehicleFoundException';

export default class OdometerReadingsController {
    public async index({ request, response, auth }: HttpContextContract) {
        const user = await auth.use('api').authenticate();

        const { vehicleId } = request.params();
        const existingVehicle = await Vehicle.findBy('id', vehicleId);

        if (!existingVehicle) {
            throw VehicleNotFound.new(vehicleId);
        }

        const readings = await OdometerReading.query()
            .select('*')
            .where('userId', user.id)
            .andWhere('vehicleId', existingVehicle.id)
            .orderBy('value');

        response.json(readings);
    }

    public async store({ request, response, auth }: HttpContextContract) {
        const user = await auth.use('api').authenticate();

        const { vehicleId } = request.params();

        const odometerSchema = schema.create({ value: schema.number() });

        const data = await request.validate({ schema: odometerSchema });

        const odometerReading = await OdometerReading.create({
            userId: user.id,
            vehicleId: vehicleId,
            value: data.value,
            readingDate: DateTime.now().toUTC(),
        });

        response.json(odometerReading);
    }
}
