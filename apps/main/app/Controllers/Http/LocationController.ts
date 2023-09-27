import Env from '@ioc:Adonis/Core/Env';
import Logger from '@ioc:Adonis/Core/Logger';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import UnknownIntegrationException from 'App/Exceptions/UnknownIntegrationException';
import { transformersByIntegrationName } from 'App/domain/locationRequestTransformers';
import { logContext } from 'App/util/logger';
import { makeClient } from 'fet-journey-service-client';
import fs from 'node:fs/promises';

const journeyServiceClient = makeClient(
    Env.get('JOURNEY_SERVICE_URL'),
    Env.get('JOURNEY_SERVICE_API_KEY')
);

export default class LocationController {
    public async handleLocationUpdate({ request, response }: HttpContextContract) {
        const integrationName = request.param('integrationName');
        const ctx = logContext(
            `${LocationController.name}.${this.handleLocationUpdate.name}`,
            { integrationName },
            Logger
        );

        const integrationTransformer = transformersByIntegrationName[integrationName];
        if (!integrationTransformer) {
            throw UnknownIntegrationException.new(integrationName);
        }

        const location = await integrationTransformer.transform(request);
        Logger.info(`${ctx} location update found for user`);

        const { journey } = await journeyServiceClient.postLocation(location).catch((err) => {
            Logger.error('Error posting location to journey service');
            Logger.error(err);
            throw err;
        });

        await fs.appendFile('./journeyLog.log', JSON.stringify(journey) + ',\n');

        response.status(201).json(location);
    }
}
