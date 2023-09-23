import Logger from '@ioc:Adonis/Core/Logger';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import UnknownIntegrationException from 'App/Exceptions/UnknownIntegrationException';
import { transformersByIntegrationName } from 'App/domain/locationRequestTransformers';
import { logContext } from 'App/util/logger';

export default class LocationController {
    public async handlePositionUpdate({ request, response }: HttpContextContract) {
        const integrationName = request.param('integrationName');
        const ctx = logContext(
            `${LocationController.name}.${this.handlePositionUpdate.name}`,
            { integrationName },
            Logger
        );

        const integrationTransformer = transformersByIntegrationName[integrationName];
        if (!integrationTransformer) {
            throw UnknownIntegrationException.new(integrationName);
        }

        const location = await integrationTransformer.transform(request);
        Logger.info(`${ctx} location update found for user`);

        response.status(201).json(location); // TODO - Update DB
    }
}
