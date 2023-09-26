import Logger from '@ioc:Adonis/Core/Logger';
import { schema } from '@ioc:Adonis/Core/Validator';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Journey from 'App/Models/Journey';
import { logContext } from 'fet-logger';

export default class JourneysController {
    public async create({ request, response }: HttpContextContract) {
        const ctx = logContext(`${JourneysController.name}.${this.create.name}`, {}, Logger);
        const journeySchema = schema.create({
            id: schema.string({ trim: true }),
            userId: schema.number(),
            startTime: schema.date(),
            endTime: schema.date(),
            distance: schema.number(),
            startLocation: schema.object().members({
                lon: schema.number(),
                lat: schema.number(),
            }),
            lastLocation: schema.object().members({
                lon: schema.number(),
                lat: schema.number(),
            }),
        });

        const data = await request.validate({ schema: journeySchema });

        await Journey.create({
            id: data.id,
            userId: data.userId,
            startTime: data.startTime,
            endTime: data.endTime,
            distance: data.distance,
            startLocationLat: data.startLocation.lat,
            startLocationLon: data.startLocation.lon,
            lastLocationLat: data.lastLocation.lat,
            lastLocationLon: data.lastLocation.lon,
        });

        Logger.info(`${ctx} created  journey`, { id: data.id });

        response.json({});
    }
}
